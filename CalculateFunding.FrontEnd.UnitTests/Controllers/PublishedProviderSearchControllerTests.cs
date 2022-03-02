using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PublishedProviderSearchControllerTests
    {
        private Mock<IPublishingApiClient> _publishingApiClient;

        private Mock<IPublishedProviderSearchService> _publishedProviderSearchService;

        private Mock<HttpContext> _httpContext;

        private PublishedProviderSearchController _publishedProviderSearchController;

        private string _fundingStreamId = "PSG";

        private string _fundingPeriodId = "FY-1920";

        private string _specificationId = "spec1";

        [TestInitialize]
        public void Setup()
        {
            _publishingApiClient = new Mock<IPublishingApiClient>();
            _publishedProviderSearchService = new Mock<IPublishedProviderSearchService>();
            _httpContext = new Mock<HttpContext>();
        }

        [TestMethod]
        public async Task GetProviderIds_Returns_OK()
        {
            _publishingApiClient.Setup(x =>
                    x.GetPublishedProviderIds(_specificationId))
                .ReturnsAsync(new ApiResponse<IEnumerable<string>>(System.Net.HttpStatusCode.OK, new[] {"provider1"}));
            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService.Object, 
                    _publishingApiClient.Object);

            IActionResult result = await _publishedProviderSearchController.GetProviderIds(_specificationId);

            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task SearchProviderIds_Returns_OK()
        {
            _publishingApiClient.Setup(x =>
                    x.SearchPublishedProviderIds(It.Is<PublishedProviderIdSearchModel>(_ =>
                        _.Filters.Count == 3 &&
                        _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                        _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                        _.Filters["specificationId"][0] == _specificationId)))
                .ReturnsAsync(new ApiResponse<IEnumerable<string>>(System.Net.HttpStatusCode.OK, new[] { "provider1" }));
            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService.Object,
                    _publishingApiClient.Object);

            IActionResult result = await _publishedProviderSearchController.SearchProviderIds(GetSearchRequest());

            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetProviders_Returns_OK()
        {
            _publishingApiClient.Setup(x =>
                    x.SearchPublishedProviderIds(It.Is<PublishedProviderIdSearchModel>(_ =>
                        _.Filters.Count == 3 &&
                        _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                        _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                        _.Filters["specificationId"][0] == _specificationId)))
                .ReturnsAsync(new ApiResponse<IEnumerable<string>>(System.Net.HttpStatusCode.OK, new[] {"provider1"}));
            _publishedProviderSearchService.Setup(x =>
                    x.PerformSearch(It.Is<SearchRequestViewModel>(
                        _ => _.Filters.Count == 3 &&
                             _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                             _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                             _.Filters["specificationId"][0] == _specificationId)))
                .ReturnsAsync(new PublishProviderSearchResultViewModel());
            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService.Object,
                    _publishingApiClient.Object);

            _publishedProviderSearchController.ControllerContext.HttpContext = _httpContext.Object;

            IActionResult result = await _publishedProviderSearchController.GetProviders(GetSearchRequest());

            result.Should().BeOfType<OkObjectResult>();
        }

        private SearchPublishedProvidersRequest GetSearchRequest(string searchTerm = "") =>
            new SearchPublishedProvidersRequest
            {
                SearchTerm = searchTerm,
                Status = new string[] { },
                ProviderType = new string[] { },
                ProviderSubType = new string[] { },
                LocalAuthority = new string[] { },
                Indicative = new string [] {},
                FundingStreamId = _fundingStreamId,
                SpecificationId = _specificationId,
                SearchMode = Common.Models.Search.SearchMode.All,
                PageSize = 50,
                PageNumber = 1,
                IncludeFacets = true,
                FacetCount = 0,
                FundingPeriodId = _fundingPeriodId,
                ErrorToggle = "",
                SearchFields = new string[] { }
            };

        private Dictionary<string, string[]> GetFilters()
        {
            Dictionary<string, string[]> destination = new Dictionary<string, string[]>();

            destination.Add("specificationId", new[] { _specificationId });
            destination.Add("fundingPeriodId", new[] { _fundingPeriodId });
            destination.Add("fundingStreamId", new[] { _fundingStreamId });

            return destination;
        }
    }
}