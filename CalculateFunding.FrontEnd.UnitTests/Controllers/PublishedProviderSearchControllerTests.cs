using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
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
        private Mock<IJobsApiClient> _jobsApiClient;

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
            _jobsApiClient = new Mock<IJobsApiClient>();
            _publishedProviderSearchService = new Mock<IPublishedProviderSearchService>();
            _httpContext = new Mock<HttpContext>();
        }

        [TestMethod]
        public async Task GetProviderIds_Returns_OK()
        {
            _publishingApiClient.Setup(x =>
                    x.SearchPublishedProviderIds(It.Is<PublishedProviderIdSearchModel>(_ =>
                        _.Filters.Count == 3 &&
                        _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                        _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                        _.Filters["specificationId"][0] == _specificationId)))
                .ReturnsAsync(new ApiResponse<IEnumerable<string>>(System.Net.HttpStatusCode.OK, new[] {"provider1"}));
            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService.Object, 
                    _publishingApiClient.Object,
                    _jobsApiClient.Object);

            IActionResult result = await _publishedProviderSearchController.GetProviderIds(GetSearchRequest());

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
                             _.Filters["specificationId"][0] == _specificationId), null))
                .ReturnsAsync(new PublishProviderSearchResultViewModel());
            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService.Object,
                    _publishingApiClient.Object,
                    _jobsApiClient.Object);

            _publishedProviderSearchController.ControllerContext.HttpContext = _httpContext.Object;

            IActionResult result = await _publishedProviderSearchController.GetProviders(GetSearchRequest());

            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetProviders_NoChangeToSearchFilters_Returns_OK()
        {
            _publishingApiClient.Setup(x =>
                    x.SearchPublishedProviderIds(It.Is<PublishedProviderIdSearchModel>(_ =>
                        _.Filters.Count == 3 &&
                        _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                        _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                        _.Filters["specificationId"][0] == _specificationId)))
                .ReturnsAsync(new ApiResponse<IEnumerable<string>>(System.Net.HttpStatusCode.OK, new[] { "provider1" }));
            _publishedProviderSearchService.Setup(x =>
                    x.PerformSearch(It.Is<SearchRequestViewModel>(
                        _ => _.Filters.Count == 3 &&
                             _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                             _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                             _.Filters["specificationId"][0] == _specificationId), 2400))
                .ReturnsAsync(new PublishProviderSearchResultViewModel());
            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService.Object,
                    _publishingApiClient.Object,
                    _jobsApiClient.Object);

            Dictionary<string, JobSummary> latestJobs = new Dictionary<string, JobSummary>();
            latestJobs.Add("RefreshFundingJob", null);
            latestJobs.Add("ApproveAllProviderFundingJob", null);
            latestJobs.Add("ApproveBatchProviderFundingJob", null);
            latestJobs.Add("PublishAllProviderFundingJob", new JobSummary { LastUpdated = DateTimeOffset.Now,
                                                                            CompletionStatus = CompletionStatus.Succeeded});
            latestJobs.Add("PublishBatchProviderFundingJob", null);

            _jobsApiClient
                .Setup(x =>
                     x.GetLatestJobsForSpecification(_specificationId,
                      "RefreshFundingJob",
                      "ApproveAllProviderFundingJob",
                      "ApproveBatchProviderFundingJob",
                      "PublishAllProviderFundingJob",
                      "PublishBatchProviderFundingJob"))
                .ReturnsAsync(new ApiResponse<IDictionary<string, JobSummary>>(HttpStatusCode.OK, latestJobs));

            SearchRequestViewModel searchModel = GetSearchModel();

            _publishedProviderSearchController.ControllerContext.HttpContext = _httpContext.Object;

            GivenCookie($"{_specificationId}_TS", JsonSerializer.Serialize(DateTimeOffset.Now.AddDays(1)));
            GivenCookie($"{_specificationId}_SearchRequestViewModel", JsonSerializer.Serialize(searchModel));
            GivenCookie($"{_specificationId}_FilteredFundingAmount", "2400");

            IActionResult result = await _publishedProviderSearchController.GetProviders(GetSearchRequest());

            result.Should().BeOfType<OkObjectResult>();
        }

        private void GivenCookie(string cookieKey, string savedCookie)
        {
            _httpContext
                .Setup(_ => _.Request.Cookies[cookieKey])
                .Returns(savedCookie);
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

        private SearchRequestViewModel GetSearchModel(string searchTerm = "") =>
            new SearchRequestViewModel
            {
                SearchTerm = searchTerm,
                Filters = GetFilters(),
                ErrorToggle = ""
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