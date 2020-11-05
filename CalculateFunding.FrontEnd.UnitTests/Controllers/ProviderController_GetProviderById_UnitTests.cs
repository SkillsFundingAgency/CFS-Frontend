using System.Net;
using CalculateFunding.Common.ApiClient.FundingDataZone;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Frontend.Controllers;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class ProviderController_GetProviderById_UnitTests
    {
        private ProviderController _sut;
        private Mock<IProvidersApiClient> _mockProvidersApiClient;
        private Mock<IResultsApiClient> _mockResultsApiClient;
        private Mock<IFundingDataZoneApiClient> _mockFundingDataZoneApiClient;


        [TestInitialize]
        public void Initialize()
        {
            _mockProvidersApiClient = new Mock<IProvidersApiClient>();
            _mockResultsApiClient = new Mock<IResultsApiClient>();
            _mockFundingDataZoneApiClient = new Mock<IFundingDataZoneApiClient>();

            ApiResponse<ProviderVersionSearchResult> data = new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, Builder<ProviderVersionSearchResult>.CreateNew().Build());


            _mockProvidersApiClient.Setup(x => x.GetProviderByIdFromProviderVersion("providerVersionId", "providerId"))
                .ReturnsAsync(data);

            _sut = new ProviderController(_mockProvidersApiClient.Object, _mockResultsApiClient.Object, _mockFundingDataZoneApiClient.Object);
        }

        [TestMethod]
        public void Should_GetProviderById_ValidId_Success()
        {
            var actual = _sut.GetProviderById("providerVersionId", "providerId");

            actual.Result.Should().NotBeNull();
            actual.Result.Should().BeOfType<OkObjectResult>();
            (actual.Result as OkObjectResult)?.StatusCode.Should().Be(200);
            (actual.Result as OkObjectResult)?.Value.Should().BeOfType<ProviderVersionSearchResult>();
        }
    }
}
