using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Policies.Models.FundingConfig;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PolicyControllerTests
    {
        private const string fundingStreamId = "fs-1";

        [TestMethod]
        public async Task GetFundingPeriods_GivenGetFundingConfigsFailed_ReturnsFailedResult()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingConfigurationsByFundingStreamId(Arg.Is(fundingStreamId))
                .Returns(new ApiResponse<IEnumerable<FundingConfiguration>>(System.Net.HttpStatusCode.BadRequest, null));

            PolicyController policyController = CreateController(policiesApiClient);

            //Act
            IActionResult result = await policyController.GetFundingPeriods(fundingStreamId);

            //Assert
            result
                .Should()
                .BeAssignableTo<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task GetFundingPeriods_GivenGetFundingPeriodsFailed_ReturnsFailedResult()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingConfigurationsByFundingStreamId(Arg.Is(fundingStreamId))
                .Returns(new ApiResponse<IEnumerable<FundingConfiguration>>(HttpStatusCode.OK, new[] { new FundingConfiguration() }));

            policiesApiClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.BadRequest, null));

            PolicyController policyController = CreateController(policiesApiClient);

            //Act
            IActionResult result = await policyController.GetFundingPeriods(fundingStreamId);

            //Assert
            result
                .Should()
                .BeAssignableTo<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task GetFundingPeriods_GivenOneFundingPeriodContainedInConfig_ReturnsCollectionWithOneFundingPeriod()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingConfigurationsByFundingStreamId(Arg.Is(fundingStreamId))
                .Returns(new ApiResponse<IEnumerable<FundingConfiguration>>(HttpStatusCode.OK, 
                    new[] { new FundingConfiguration { FundingPeriodId = "fp1" } }));

            policiesApiClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, GetFundingPeriods()));

            PolicyController policyController = CreateController(policiesApiClient);

            //Act
            IActionResult result = await policyController.GetFundingPeriods(fundingStreamId);

            //Assert
            result
                .Should()
                .BeAssignableTo<OkObjectResult>();

            IEnumerable<Reference> fundingPeriods = (result as OkObjectResult).Value as IEnumerable<Reference>;

            fundingPeriods
                .Should()
                .HaveCount(1);

            fundingPeriods
                .First()
                .Id
                .Should()
                .Be("fp1");
        }

        [TestMethod]
        public async Task GetFundingPeriods_GivenTwoFundingPeriodContainedInConfigs_ReturnsCollectionWithTwoFundingPeriods()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingConfigurationsByFundingStreamId(Arg.Is(fundingStreamId))
                .Returns(new ApiResponse<IEnumerable<FundingConfiguration>>(HttpStatusCode.OK,
                    new[] { new FundingConfiguration { FundingPeriodId = "fp1" }, new FundingConfiguration { FundingPeriodId = "fp3" } }));

            policiesApiClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, GetFundingPeriods()));

            PolicyController policyController = CreateController(policiesApiClient);

            //Act
            IActionResult result = await policyController.GetFundingPeriods(fundingStreamId);

            //Assert
            result
                .Should()
                .BeAssignableTo<OkObjectResult>();

            IEnumerable<Reference> fundingPeriods = (result as OkObjectResult).Value as IEnumerable<Reference>;

            fundingPeriods
                .Should()
                .HaveCount(2);
        }

        [TestMethod]
        public void GetFundingStreams_GivenGetFundingStreamsFailed_ReturnsFailedResult()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(System.Net.HttpStatusCode.BadRequest, null));

            PolicyController policyController = CreateController(policiesApiClient);

            //Act
            Func<Task<IActionResult>> invocation = () => policyController.GetFundingStreams(false);

            //Assert
            invocation
                .Should()
                .Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task GetFundingStreams_GivenTwoFundingStreamsReturned_ReturnsTwoFundingStreams()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, GetFundingStreams()));

            PolicyController policyController = CreateController(policiesApiClient);

            //Act
            IActionResult result = await policyController.GetFundingStreams(false);

            //Assert
            result
                .Should()
                .BeAssignableTo<OkObjectResult>();

            IEnumerable<FundingStream> fundingStreams = (result as OkObjectResult).Value as IEnumerable<FundingStream>;

            fundingStreams
                .Should()
                .HaveCount(3);
        }

        [TestMethod]
        public async Task GetFundingStreams_GivenTwoFundingStreamsReturned_ReturnsOneFundingStreamWhenSecurityTrimmed()
        {
            //Arrange
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            policiesApiClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, GetFundingStreams()));

            IAuthorizationHelper authorizationHelper = CreateAuthorizationHelper();
            authorizationHelper
                .GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), "DSG")
                .Returns(new FundingStreamPermission { CanCreateSpecification = false });
            authorizationHelper
                .GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), "PSG")
                .Returns(new FundingStreamPermission { CanCreateSpecification = true });
            authorizationHelper
                .GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), "Missing")
                .Returns((FundingStreamPermission)null);

            PolicyController policyController = CreateController(policiesApiClient, authorizationHelper);

            //Act
            IActionResult result = await policyController.GetFundingStreams(true);

            //Assert
            result
                .Should()
                .BeAssignableTo<OkObjectResult>();

            IEnumerable<FundingStream> fundingStreams = (result as OkObjectResult).Value as IEnumerable<FundingStream>;

            fundingStreams
                .Should()
                .HaveCount(1);

            fundingStreams
                .First()
                .Id
                .Should()
                .Be("PSG");
        }

        public PolicyController CreateController(IPoliciesApiClient policiesApiClient = null, IAuthorizationHelper authorizationHelper = null)
        {
            return new PolicyController(policiesApiClient ?? CreatePoliciesApiClient(), authorizationHelper ?? CreateAuthorizationHelper());
        }

        private static IPoliciesApiClient CreatePoliciesApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static IAuthorizationHelper CreateAuthorizationHelper()
        {
            return Substitute.For<IAuthorizationHelper>();
        }

        private static IEnumerable<FundingPeriod> GetFundingPeriods()
        {
            return new[] {
                    new FundingPeriod { Id = "fp1", Name = "Period 1" },
                    new FundingPeriod { Id = "fp2", Name = "Period 2" },
                    new FundingPeriod { Id = "fp3", Name = "Period 3" },
                };
        }

        private static IEnumerable<FundingStream> GetFundingStreams()
        {
            return new[] {
                    new FundingStream { Id = "DSG", Name = "DSG" },
                    new FundingStream { Id = "PSG", Name = "PSG" },
                    new FundingStream { Id = "Missing", Name = "Missing"}
                };
        }
    }
}
