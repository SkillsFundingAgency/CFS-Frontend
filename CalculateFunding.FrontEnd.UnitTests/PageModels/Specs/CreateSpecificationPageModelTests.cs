using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Specs
{
    [TestClass]
    public class CreateSpecificationPageModelTests
    {

        [TestMethod]
        public async Task OnGetAsync_GivenPagePopulates_ReturnsPage()
        {
            //Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams);

            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();

            policiesApiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            CreateSpecificationPageModel pageModel = CreatePageModel(policiesApiClient: policiesApiClient, authorizationHelper: authorizationHelper);

            //Act
            IActionResult result = await pageModel.OnGetAsync();

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            pageModel
                .IsAuthorizedToCreate
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenUserDoesNotHaveCreateSpecificationPermissionForAnyFundingStream_ThenFundingStreamsShouldBeEmpty()
        {
            // Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fp1", Name = "funding" }
            };

            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();

            policiesApiClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(Enumerable.Empty<PolicyModels.FundingStream>());

            CreateSpecificationPageModel pageModel = CreatePageModel(policiesApiClient: policiesApiClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGetAsync();

            // Assert
            result.Should().BeOfType<PageResult>();
            pageModel.FundingStreams.Should().BeEmpty();
            pageModel
                .IsAuthorizedToCreate
                .Should().BeFalse();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenPagePopulatesButModelStateIsInvalid_ReturnsPage()
        {
            //Arrange 
            const string specName = "spec name";

            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ISpecsApiClient apiClient = CreateApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            policiesApiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            CreateSpecificationPageModel pageModel = CreatePageModel(specsClient: apiClient, policiesApiClient: policiesApiClient, authorizationHelper: authorizationHelper);

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
            {
                Name = specName
            };

            pageModel.PageContext.ModelState.AddModelError("test", "Invalid model");

            //Act
            IActionResult result = await pageModel.OnPostAsync();

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            pageModel
                .IsAuthorizedToCreate
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenViewModelIsValid_ReturnsRedirect()
        {
            //Arrange
            const string specName = "spec name";

            CreateSpecificationModel createModel = new CreateSpecificationModel
            {
                Name = specName,
                Description = "description",
                FundingStreamIds = new[] { "fs1" },
                FundingPeriodId = "fp1"
            };

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.NotFound);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            Specification createdSpecification = new Specification()
            {
                Id = "specId",
            };

            apiClient
                .CreateSpecification(Arg.Any<CreateSpecificationModel>())
                .Returns(new ValidatedApiResponse<Specification>(HttpStatusCode.OK, createdSpecification));

            IMapper mapper = CreateMapper();
            mapper
                .Map<CreateSpecificationModel>(Arg.Any<CreateSpecificationViewModel>())
                .Returns(createModel);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<string>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(true);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper, authorizationHelper: authorizationHelper);

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
            {
                Name = specName,
                Description = "description",
                FundingStreamId = "fs1",
                FundingPeriodId = "fp1"
            };

            //Act
            IActionResult result = await pageModel.OnPostAsync();

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be("/specs/policies/specId?operationType=SpecificationCreated&operationId=specId");
        }

        [TestMethod]
        public async Task OnPostAsync_GivenUserDoesNotHaveCreateSpecificationPermissionForAnyFundingStream_ThenReturnsForbidResult()
        {
            // Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "Funding Period 1" },
                new Reference { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<string>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(false);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CreateSpecificationViewModel createModel = new CreateSpecificationViewModel
            {
                Description = "Test spec",
                FundingPeriodId = "FY1819",
                FundingStreamId = "fs1",
                Name = "Test spec"
            };

            CreateSpecificationPageModel pageModel = CreatePageModel(authorizationHelper: authorizationHelper, mapper: mapper);
            pageModel.CreateSpecificationViewModel = createModel;

            // Act
            IActionResult result = await pageModel.OnPostAsync();

            // Assert
            result.Should().BeOfType<ForbidResult>();

            pageModel
                .IsAuthorizedToCreate
                .Should().BeFalse();
        }

        private static CreateSpecificationPageModel CreatePageModel(ISpecsApiClient specsClient = null, IPoliciesApiClient policiesApiClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            CreateSpecificationPageModel pageModel = new CreateSpecificationPageModel(specsClient ?? CreateApiClient(), policiesApiClient ?? CreatePoliciesApiClient(), mapper ?? CreateMapper(), authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(Common.Identity.Authorization.Models.SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            return pageModel;
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IPoliciesApiClient CreatePoliciesApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }
    }
}
