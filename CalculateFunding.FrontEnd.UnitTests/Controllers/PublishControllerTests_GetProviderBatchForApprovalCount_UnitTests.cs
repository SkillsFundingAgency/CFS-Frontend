using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    public class PublishControllerTests_GetProviderBatchForApprovalCount_UnitTests
    {
        private readonly ISpecificationsApiClient _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
        private readonly IAuthorizationHelper _authorizationHelper = Substitute.For<IAuthorizationHelper>();
        private readonly IPublishingApiClient _publishingApiClient = Substitute.For<IPublishingApiClient>();
        private PublishController _publishController;

        [TestInitialize]
        public void Setup()
        {
            _publishController = new PublishController(_specificationsApiClient, _publishingApiClient, _authorizationHelper);
        }

        [TestMethod]
        public async Task GetProviderBatchForApprovalCount_Returns_OkObjectResult_Given_ValidSpecificationIdAndPublishProviderIds()
        {
            string specificationId = "Specification-Id";
            PublishedProviderIdsRequest publishedProviderIds = new PublishedProviderIdsRequest() { PublishedProviderIds = new[] { "p1" } };
            _publishingApiClient.GetProviderBatchForApprovalCount(publishedProviderIds, specificationId)
                .Returns(new ApiResponse<PublishedProviderFundingCount>(HttpStatusCode.OK, new PublishedProviderFundingCount()));

            IActionResult actual = await _publishController.GetProviderBatchForApprovalCount(publishedProviderIds, specificationId);

            actual.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetProviderBatchForApprovalCount_Returns_BadRequestObjectResult_Given_InvalidInputs()
        {
            string specificationId = "spec1";
            PublishedProviderIdsRequest publishedProviderIds = new PublishedProviderIdsRequest();
            _publishingApiClient.GetProviderBatchForApprovalCount(publishedProviderIds, specificationId)
                .Returns(new ApiResponse<PublishedProviderFundingCount>(HttpStatusCode.BadRequest, null));

            IActionResult actual = await _publishController.GetProviderBatchForApprovalCount(publishedProviderIds, specificationId);

            actual.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
