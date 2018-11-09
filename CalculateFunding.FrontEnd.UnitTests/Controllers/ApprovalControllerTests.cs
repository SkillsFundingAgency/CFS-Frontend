using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Controllers;
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
                .UpdatePublishedAllocationLineStatus(Arg.Is(specificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(new ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel>(HttpStatusCode.OK, new PublishedAllocationLineResultStatusUpdateResponseModel()));

            ApprovalController controller = CreateApprovalController(resultsClient: resultsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
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
                .UpdatePublishedAllocationLineStatus(Arg.Is(specificationId), Arg.Any<PublishedAllocationLineResultStatusUpdateModel>())
                .Returns(new ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel>(HttpStatusCode.OK, new PublishedAllocationLineResultStatusUpdateResponseModel()));

            ApprovalController controller = CreateApprovalController(resultsClient: resultsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await controller.UpdateApprovalStatusForAllocationLine(specificationId, model);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
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

        private ApprovalController CreateApprovalController(IResultsApiClient resultsClient = null, ISpecsApiClient specsClient = null, IAuthorizationHelper authorizationHelper = null)
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
