using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Approvals;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ApprovalControllerTests
    {
        [TestMethod]
        public async Task UpdateApprovalStatusForAllocationLine_WhenUserDoesHaveApproveFundingPermission_ThenActionAllowed()
        {
            // Arrange
            string specificationId = "abc123";

            PublishedAllocationLineResultStatusUpdateViewModel model = new PublishedAllocationLineResultStatusUpdateViewModel
            {
                Status = AllocationLineStatusViewModel.Approved,
                Providers = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
            };

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveFunding))
                .Returns(true);

            IResultsApiClient resultsClient = CreateResultsClient();
            resultsClient
                .UpdatePublishedAllocationLineStatusByBatch(Arg.Is(specificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(new ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel>(HttpStatusCode.OK, new PublishedAllocationLineResultStatusUpdateResponseModel()));

            ApprovalController controller = CreateApprovalController(resultsClient: resultsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<OkResult>();
        }

        [TestMethod]
        public async Task UpdateApprovalStatusForAllocationLine_WhenUserDoesHavePublishFundingPermission_ThenActionAllowed()
        {
            // Arrange
            string specificationId = "abc123";

            PublishedAllocationLineResultStatusUpdateViewModel model = new PublishedAllocationLineResultStatusUpdateViewModel
            {
                Status = AllocationLineStatusViewModel.Published,
                Providers = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
            };

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanPublishFunding))
                .Returns(true);

            IResultsApiClient resultsClient = CreateResultsClient();
            resultsClient
                .UpdatePublishedAllocationLineStatusByBatch(Arg.Is(specificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(new ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel>(HttpStatusCode.OK, new PublishedAllocationLineResultStatusUpdateResponseModel()));

            ApprovalController controller = CreateApprovalController(resultsClient: resultsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<OkResult>();
        }

        [TestMethod]
        public async Task UpdateApprovalStatusForAllocationLine_WhenUserDoesNotHaveApproveFundingPermission_ThenReturn403()
        {
            // Arrange
            string specificationId = "abc123";

            PublishedAllocationLineResultStatusUpdateViewModel model = new PublishedAllocationLineResultStatusUpdateViewModel
            {
                Status = AllocationLineStatusViewModel.Approved
            };

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveFunding))
                .Returns(false);

            ApprovalController controller = CreateApprovalController(authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task UpdateApprovalStatusForAllocationLine_WhenUserDoesNotHavePublishFundingPermission_ThenReturn403()
        {
            // Arrange
            string specificationId = "abc123";

            PublishedAllocationLineResultStatusUpdateViewModel model = new PublishedAllocationLineResultStatusUpdateViewModel
            {
                Status = AllocationLineStatusViewModel.Published
            };

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanPublishFunding))
                .Returns(false);

            ApprovalController controller = CreateApprovalController(authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task UpdateApprovalStatusForAllocationLine_ThenCallEndpointToScheduleJob()
        {
            // Arrange
            string specificationId = "abc123";

            PublishedAllocationLineResultStatusUpdateViewModel model = new PublishedAllocationLineResultStatusUpdateViewModel
            {
                Status = AllocationLineStatusViewModel.Approved,
                Providers = new List<PublishedAllocationLineResultStatusUpdateProviderViewModel>()
            };

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveFunding))
                .Returns(true);

            IResultsApiClient resultsClient = CreateResultsClient();

            ApprovalController controller = CreateApprovalController(resultsClient: resultsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<OkResult>();

            await resultsClient
                .Received(1)
                .UpdatePublishedAllocationLineStatus(Arg.Is(specificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>());
        }

        [TestMethod]
        public async Task RefreshPublishedResults_WhenUserDoesHaveRefreshFundingPermission_ThenActionAllowed()
        {
            // Arrange
            string specificationId = "abc123";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanRefreshFunding))
                .Returns(true);

            ISpecsApiClient specsClient = CreateSpecsClient();
            specsClient.RefreshPublishedResults(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationCalculationExecutionStatusModel>(HttpStatusCode.OK, new SpecificationCalculationExecutionStatusModel()));

            ApprovalController controller = CreateApprovalController(specsClient: specsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.RefreshPublishedResults(specificationId);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task RefreshPublishedResults_WhenUserDoesNotHaveRefreshFundingPermission_ThenReturn403()
        {
            // Arrange
            string specificationId = "abc123";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanRefreshFunding))
                .Returns(false);

            ApprovalController controller = CreateApprovalController(authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.RefreshPublishedResults(specificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        [DataRow(null, null, null, "providerId")]
        [DataRow("", null, null, "providerId")]
        [DataRow("a", null, null, "specificationId")]
        [DataRow("a", "", null, "specificationId")]
        [DataRow("a", "b", null, "fundingStreamId")]
        [DataRow("a", "b", "", "fundingStreamId")]
        public void PublishedProviderProfile_MissingData_Errors(string providerId, string specificationId, string fundingStreamId, string parameterName)
        {
            //Arrange
            var resultsApiClient = Substitute.For<IResultsApiClient>();
            var specsApiClient = Substitute.For<ISpecsApiClient>();
            var mapper = Substitute.For<IMapper>();
            var authorizationHelper = Substitute.For<IAuthorizationHelper>();

            var controller = new ApprovalController(resultsApiClient, specsApiClient, mapper, authorizationHelper);

            //Act
            Func<Task> action = async () => 
                await controller.PublishedProviderProfile(providerId, specificationId, fundingStreamId);

            //Assert
            action
                .Should().Throw<ArgumentNullException>()
                .WithMessage($"Value cannot be null.{Environment.NewLine}Parameter name: {parameterName}");

            resultsApiClient.Received(0).GetPublishedProviderResults(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
            mapper.Received(0).Map<IEnumerable<PublishedProviderProfileViewModel>>(Arg.Any<IEnumerable<PublishedProviderProfile>>());
        }

#if NCRUNCH
        [Ignore]
#endif
        [TestMethod]
        [DataRow(HttpStatusCode.NotFound, typeof(NotFoundObjectResult))]
        [DataRow(HttpStatusCode.PreconditionFailed, typeof(InternalServerErrorResult))]
        [DataRow(HttpStatusCode.Redirect, typeof(InternalServerErrorResult))]
        public async Task PublishedProviderProfile_ClientCallFails_ReturnsError(HttpStatusCode statusCode, Type actionResultType)
        {
            //Arrange
            var resultsApiClient = Substitute.For<IResultsApiClient>();
            var specsApiClient = Substitute.For<ISpecsApiClient>();
            var mapper = Substitute.For<IMapper>();
            var authorizationHelper = Substitute.For<IAuthorizationHelper>();

            var callResult = new ApiResponse<IEnumerable<PublishedProviderProfile>>(statusCode);

            resultsApiClient
                .GetPublishedProviderProfile(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(callResult);

            var controller = new ApprovalController(resultsApiClient, specsApiClient, mapper, authorizationHelper);

            var providerId = "p";
            var specificationId = "s";
            var fundingStreamId = "f";

            //Act
            var result = await controller.PublishedProviderProfile(providerId, specificationId, fundingStreamId);

            //Assert
            await resultsApiClient
                .Received(1)
                .GetPublishedProviderProfile(providerId, specificationId, fundingStreamId);

            mapper
                .Received(0)
                .Map<IEnumerable<PublishedProviderProfileViewModel>>(Arg.Any<IEnumerable<PublishedProviderProfile>>());

            result
                .Should()
                .BeOfType(actionResultType);
        }

        [TestMethod]
        public async Task PublishedProviderProfile_CallsSucceed_ReturnsOK()
        {
            //Arrange
            var resultsApiClient = Substitute.For<IResultsApiClient>();
            var specsApiClient = Substitute.For<ISpecsApiClient>();
            var mapper = Substitute.For<IMapper>();
            var authorizationHelper = Substitute.For<IAuthorizationHelper>();

            var callContent = new PublishedProviderProfile[] { };
            var callResult = new ApiResponse<IEnumerable<PublishedProviderProfile>>(HttpStatusCode.OK, callContent);
            var mappedResult = new[] { new PublishedProviderProfileViewModel() };

            resultsApiClient
                .GetPublishedProviderProfile(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(callResult);

            mapper
                .Map<IEnumerable<PublishedProviderProfileViewModel>>(callResult.Content)
                .Returns(mappedResult);

            var controller = new ApprovalController(resultsApiClient, specsApiClient, mapper, authorizationHelper);

            var providerId = "p";
            var specificationId = "s";
            var fundingStreamId = "f";

            //Act
            var result = await controller.PublishedProviderProfile(providerId, specificationId, fundingStreamId);

            //Assert
            await resultsApiClient
                .Received(1)
                .GetPublishedProviderProfile(providerId, specificationId, fundingStreamId);

            mapper
                .Received(1)
                .Map<IEnumerable<PublishedProviderProfileViewModel>>(callContent);

            result
                .Should()
                .BeOfType(typeof(OkObjectResult));

            var value = (result as OkObjectResult).Value;

            value.Should().Be(mappedResult);
        }

        private ApprovalController CreateApprovalController(IResultsApiClient resultsClient = null,
            ISpecsApiClient specsClient = null,
            IAuthorizationHelper authorizationHelper = null)
        {
            IMapper mapper = Substitute.For<IMapper>();

            return new ApprovalController(
                resultsClient ?? CreateResultsClient(),
                specsClient ?? CreateSpecsClient(),
                mapper,
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanApproveFunding));
        }

        private IResultsApiClient CreateResultsClient()
        {
            return Substitute.For<IResultsApiClient>();
        }

        private ISpecsApiClient CreateSpecsClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }
    }
}
