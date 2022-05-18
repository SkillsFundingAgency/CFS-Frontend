using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.FundingDataZone;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.ViewModels.Provider;
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
        private Mock<ISpecificationsApiClient> _mockSpecificationsApiClient;
        private Mock<IFundingDataZoneApiClient> _mockFundingDataZoneApiClient;


        [TestInitialize]
        public void Initialize()
        {
            _mockProvidersApiClient = new Mock<IProvidersApiClient>();
            _mockResultsApiClient = new Mock<IResultsApiClient>();
            _mockSpecificationsApiClient = new Mock<ISpecificationsApiClient>();
            _mockFundingDataZoneApiClient = new Mock<IFundingDataZoneApiClient>();

            ApiResponse<ProviderVersionSearchResult> data = new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK, Builder<ProviderVersionSearchResult>.CreateNew().Build());


            _mockProvidersApiClient.Setup(x => x.GetProviderByIdFromProviderVersion("providerVersionId", "providerId"))
                .ReturnsAsync(data);

            _sut = new ProviderController(_mockProvidersApiClient.Object, _mockResultsApiClient.Object, _mockSpecificationsApiClient.Object, _mockFundingDataZoneApiClient.Object);
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

        [TestMethod]
        public void Should_GetProviderResults_ValidId_Success()
        {
            string providerId = "providerId";
            string specificationFirst = "specificationFirst";
            string specificationSecond = "specificationSecond";
            string providerVersionFirst = "providerVersionFirst";
            string providerVersionSecond = "providerVersionSecond";

            List<SpecificationInformation> specifications = new()
            {
                new SpecificationInformation{ Id = specificationFirst },
                new SpecificationInformation{ Id = specificationSecond  }
            };

            var specificationsResponse = new ApiResponse<IEnumerable<SpecificationInformation>>(HttpStatusCode.OK,
                specifications);

            _mockResultsApiClient.Setup(c => c.GetSpecificationsWithProviderResultsForProviderId(providerId))
                .ReturnsAsync(specificationsResponse);

            var specificationSummaryResponseFirst = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK,
                new SpecificationSummary { Id = specificationFirst, ProviderVersionId = providerVersionFirst });

            _mockSpecificationsApiClient.Setup(c => c.GetSpecificationSummaryById(specificationFirst))
                .ReturnsAsync(specificationSummaryResponseFirst);

            var specificationSummaryResponseSecond = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK,
                new SpecificationSummary { Id = specificationSecond, ProviderVersionId = providerVersionSecond });

            _mockSpecificationsApiClient.Setup(c => c.GetSpecificationSummaryById(specificationSecond))
                .ReturnsAsync(specificationSummaryResponseSecond);

            var providerVersionSearchResponse = new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.OK,
                new ProviderVersionSearchResult { Id = specificationFirst, ProviderVersionId = providerVersionFirst });

            _mockProvidersApiClient.Setup(_ => _.GetProviderByIdFromProviderVersion(providerVersionFirst, providerId))
                .ReturnsAsync(providerVersionSearchResponse);

            _mockProvidersApiClient.Setup(_ => _.GetProviderByIdFromProviderVersion(providerVersionSecond, providerId))
                .ReturnsAsync(new ApiResponse<ProviderVersionSearchResult>(HttpStatusCode.NotFound));

            var actual = _sut.GetProviderResults(providerId);

            actual.Result.Should().NotBeNull();
            actual.Result.Should().BeOfType<OkObjectResult>();
            (actual.Result as OkObjectResult)?.StatusCode.Should().Be(200);

            ((actual.Result as OkObjectResult)?.Value as IEnumerable<SpecificationInformation>)
                .Should()
                .BeEquivalentTo(specifications.Where(_ => _.Id != specificationSecond));
        }

        [TestMethod]
        public void Should_GetCurrentProviderVersionForFundingStream_ValidId_Success()
        {
            string testFundingStreamId = "a valid id";
            var currentProviderMetadataResponse = new ApiResponse<CurrentProviderVersionMetadata>(HttpStatusCode.OK,
                Builder<CurrentProviderVersionMetadata>.CreateNew().Build());
            _mockProvidersApiClient.Setup(c => c.GetCurrentProviderMetadataForFundingStream(testFundingStreamId))
                .ReturnsAsync(currentProviderMetadataResponse);
            var providerVersionMetadataResponse = new ApiResponse<ProviderVersionMetadata>(HttpStatusCode.OK,
                Builder<ProviderVersionMetadata>.CreateNew().Build());
            _mockProvidersApiClient.Setup(c =>
                    c.GetProviderVersionMetadata(currentProviderMetadataResponse.Content.ProviderVersionId))
                .ReturnsAsync(providerVersionMetadataResponse);
            _sut = new ProviderController(_mockProvidersApiClient.Object,
                _mockResultsApiClient.Object,
                _mockSpecificationsApiClient.Object,
                _mockFundingDataZoneApiClient.Object);

            Task<IActionResult> actual = _sut.GetCurrentProviderVersionForFundingStream(testFundingStreamId);

            var result = actual.Result as OkObjectResult;
            result?.StatusCode.Should().Be(200);
            result?.Value.Should().BeOfType<CurrentProviderVersionForFundingStream>();
            result?.Value.As<CurrentProviderVersionForFundingStream>().Should().BeEquivalentTo(
                new CurrentProviderVersionForFundingStream
                {
                    ProviderSnapshotId = currentProviderMetadataResponse.Content.ProviderSnapshotId,
                    Name = providerVersionMetadataResponse.Content.Name,
                    ProviderVersionId = currentProviderMetadataResponse.Content.ProviderVersionId,
                    TargetDate = providerVersionMetadataResponse.Content.TargetDate,
                    Version = providerVersionMetadataResponse.Content.Version,
                    Description = providerVersionMetadataResponse.Content.Description,
                });
        }
    }
}
