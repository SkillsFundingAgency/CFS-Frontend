using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Results;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PublishController_GetPublishedProviderTransactions_UnitTests
    {
        private PublishController _sut;
        private readonly Mock<IPublishingApiClient> _mockPublishingApiClient = new Mock<IPublishingApiClient>();
        private readonly Mock<ISpecificationsApiClient> _mockSpecificationsApiClient = new Mock<ISpecificationsApiClient>();
        private readonly Mock<IAuthorizationHelper> _mockAuthorizatonHelper = new Mock<IAuthorizationHelper>();

        [TestMethod]
        public void GetReleasedPublishedProviderTransactions_Success()
        {
            ApiResponse<IEnumerable<ReleasePublishedProviderTransaction>> data =
                new ApiResponse<IEnumerable<ReleasePublishedProviderTransaction>>(HttpStatusCode.OK,
                    Builder<ReleasePublishedProviderTransaction>
                        .CreateListOfSize(10)
                        .All()
                        .Do(x => x.Author = new Reference("1", "Test Bot"))
                        .Build().AsEnumerable()
                );
            _mockPublishingApiClient.Setup(x =>
                    x.GetReleasedPublishedProviderTransactions("ABC123", "providerId"))
                .ReturnsAsync(data);
            _sut = new PublishController(
                _mockSpecificationsApiClient.Object, 
                _mockPublishingApiClient.Object, 
                _mockAuthorizatonHelper.Object);

            Task<IActionResult> actual = _sut.GetReleasedPublishedProviderTransactions("ABC123", "providerId");

            actual.Result.Should().BeOfType<OkObjectResult>();
            (actual.Result as OkObjectResult)?.StatusCode.Should().Be(200);
            (actual.Result as OkObjectResult)?.Value.Should().BeOfType<ProviderTransactionResultsViewModel>();
        }

        [TestMethod]
        public void GetReleasedPublishedProviderTransactions_ReturnNotFoundObjectResult_GivenNoResultReturnsFromPublishingApi()
        {
            _sut = new PublishController(_mockSpecificationsApiClient.Object, _mockPublishingApiClient.Object, _mockAuthorizatonHelper.Object);

            Task<IActionResult> actual = _sut.GetReleasedPublishedProviderTransactions("ABC123", "providerId");

            actual.Result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public void GetPublishedProviderTransactions_Success()
        {
            ApiResponse<IEnumerable<PublishedProviderTransaction>> data =
                new ApiResponse<IEnumerable<PublishedProviderTransaction>>(HttpStatusCode.OK,
                    Builder<PublishedProviderTransaction>
                        .CreateListOfSize(10)
                        .All()
                        .Do(x => x.Author = new Reference("1", "Test Bot"))
                        .Build().AsEnumerable()
                );
            _mockPublishingApiClient.Setup(x =>
                    x.GetPublishedProviderTransactions("ABC123", "providerId"))
                .ReturnsAsync(data);
            _sut = new PublishController(
                _mockSpecificationsApiClient.Object,
                _mockPublishingApiClient.Object,
                _mockAuthorizatonHelper.Object);

            Task<IActionResult> actual = _sut.GetPublishedProviderTransactions("ABC123", "providerId");

            actual.Result.Should().BeOfType<OkObjectResult>();
            (actual.Result as OkObjectResult)?.StatusCode.Should().Be(200);
            (actual.Result as OkObjectResult)?.Value.Should().BeOfType<ProviderTransactionResultsViewModel>();
        }

        [TestMethod]
        public void GetPublishedProviderTransactions_ReturnNotFoundObjectResult_GivenNoResultReturnsFromPublishingApi()
        {
            _sut = new PublishController(_mockSpecificationsApiClient.Object, _mockPublishingApiClient.Object, _mockAuthorizatonHelper.Object);

            Task<IActionResult> actual = _sut.GetPublishedProviderTransactions("ABC123", "providerId");

            actual.Result.Should().BeOfType<NotFoundObjectResult>();
        }
    }
}
