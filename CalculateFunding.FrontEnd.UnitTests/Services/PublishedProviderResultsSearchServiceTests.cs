using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Policies.Models.FundingConfig;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class PublishedProviderResultsSearchServiceTests
    {
        private Mock<IPoliciesApiClient> _policiesApiClient;
        private Mock<IPublishingApiClient> _publishingClient;
        private IMapper _mapper;
        private ILogger _logger;
        private PublishedProviderSearchService _service;

        [TestInitialize]
        public void TestInitialize()
        {
            _publishingClient = new Mock<IPublishingApiClient>();
            _policiesApiClient = new Mock<IPoliciesApiClient>();
            MapperConfiguration mapperConfiguration = new MapperConfiguration(c => { c.AddProfile<FrontEndMappingProfile>(); });
            _mapper = mapperConfiguration.CreateMapper();
            _logger = Mock.Of<ILogger>();
        }

        [TestMethod]
        public async Task PerformSearch_GivenResultsWithoutErrors_ReturnsExpected()
        {
            int numberOfItems = 25;

            SearchResults<PublishedProviderSearchItem> searchResults = GenerateSearchResults(numberOfItems);

            _publishingClient
                .Setup(x => x.SearchPublishedProvider(It.IsAny<SearchModel>()))
                .ReturnsAsync(new ApiResponse<SearchResults<PublishedProviderSearchItem>>(HttpStatusCode.OK, searchResults));

            var providerStats = new ProviderFundingStreamStatusResponse {ProviderApprovedCount = 0, TotalFunding = 1234, ProviderDraftCount = numberOfItems};
            _publishingClient
                .Setup(x => x.GetProviderStatusCounts(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ApiResponse<IEnumerable<ProviderFundingStreamStatusResponse>>(HttpStatusCode.OK, new []
                {
                    providerStats
                }));

            FundingConfiguration config = new FundingConfiguration
            {
                ApprovalMode = ApprovalMode.All,
                FundingStreamId = "stream",
                FundingPeriodId = "period",
                ProviderSource = ProviderSource.CFS
            };
            
            _policiesApiClient
                .Setup(x => x.GetFundingConfiguration(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(new ApiResponse<FundingConfiguration>(HttpStatusCode.OK, config));

            _service = new PublishedProviderSearchService(_publishingClient.Object, _policiesApiClient.Object, _logger, _mapper);
            
            SearchRequestViewModel request = new SearchRequestViewModel { PageSize = 12 };
            
            PublishProviderSearchResultViewModel result = await _service.PerformSearch(request);

            result.CanApprove.Should().BeTrue();
            result.Providers.Should().HaveCount(numberOfItems);
            result.TotalErrorResults.Should().Be(0);
            result.TotalProvidersToApprove.Should().Be(numberOfItems);
        }
        SearchResults<PublishedProviderSearchItem> GenerateSearchResults(int numberOfItems)
        {
            List<PublishedProviderSearchItem> items = new List<PublishedProviderSearchItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new PublishedProviderSearchItem
                {
                    Id = $"{i + 10}",
                    SpecificationId = "specId",
                    FundingPeriodId = "period",
                    FundingStreamId = "stream",
                    ProviderName = $"prov-{i + 1}",
                });
            }

            return new SearchResults<PublishedProviderSearchItem>
            {
                Results = items.AsEnumerable(),
                Facets = new SearchFacet[]
                {
                    new SearchFacet { Name = "providerType", FacetValues = new List<SearchFacetValue>()},
                    new SearchFacet { Name = "localAuthority", FacetValues = new List<SearchFacetValue>()},
                    new SearchFacet { Name = "fundingStatus", FacetValues = new List<SearchFacetValue>()},
                },
                TotalCount = numberOfItems,
                TotalErrorCount = 0
            };
        }
    }
}