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
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class PublishedProviderSearchControllerTests
    {
        private IPublishingApiClient _publishingApiClient;

        private IPublishedProviderSearchService _publishedProviderSearchService;

        private PublishedProviderSearchController _publishedProviderSearchController;

        private string _fundingStreamId = "PSG";

        private string _fundingPeriodId = "FY-1920";

        private string _specificationId = "spec1";

        [TestInitialize]
        public void Setup()
        {
            _publishingApiClient = Substitute.For<IPublishingApiClient>();
            _publishedProviderSearchService = Substitute.For<IPublishedProviderSearchService>();

            _publishedProviderSearchController =
                new PublishedProviderSearchController(_publishedProviderSearchService, _publishingApiClient);
        }

        [TestMethod]
        public async Task GetProviderIds_Returns_OK()
        {
            _publishingApiClient
                .SearchPublishedProviderIds(Arg.Is<PublishedProviderIdSearchModel>(_ => _.Filters.Count == 3 &&
                    _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                    _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                    _.Filters["specificationId"][0] == _specificationId))
                .Returns(new ApiResponse<IEnumerable<string>>(System.Net.HttpStatusCode.OK, new string[] { "provider1" }));

            IActionResult result = await _publishedProviderSearchController.GetProviderIds(GetSearchRequest());

            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task GetProviders_Returns_OK()
        {
            _publishedProviderSearchService
                .PerformSearch(Arg.Is<SearchRequestViewModel>(_ => _.Filters.Count == 3 &&
                    _.Filters["fundingStreamId"][0] == _fundingStreamId &&
                    _.Filters["fundingPeriodId"][0] == _fundingPeriodId &&
                    _.Filters["specificationId"][0] == _specificationId))
                .Returns(new PublishProviderSearchResultViewModel());
            
            IActionResult result = await _publishedProviderSearchController.GetProviders(GetSearchRequest());

            result.Should().BeOfType<OkObjectResult>();
        }

        private ViewModels.Common.SearchPublishedProvidersRequest GetSearchRequest()
        {
            return new SearchPublishedProvidersRequest {
                SearchTerm = "",
                Status = new string[] { },
                ProviderType = new string[] { },
                ProviderSubType = new string[] { },
                LocalAuthority = new string[] { },
                FundingStreamId = _fundingStreamId,
                SpecificationId = _specificationId,
                SearchMode = Common.Models.Search.SearchMode.All,
                PageSize = 50,
                PageNumber = 1,
                IncludeFacets = true,
                FacetCount = 0,
                FundingPeriodId = _fundingPeriodId,
                ErrorToggle =  "",
                SearchFields = new string[] { }
            };
        }

    }
}