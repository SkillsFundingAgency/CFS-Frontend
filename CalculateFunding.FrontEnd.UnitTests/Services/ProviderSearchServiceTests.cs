using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class ProviderSearchServiceTests
    {
        [TestMethod]
        public void PerformSearch_GivenProviderApiClientUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            IProvidersApiClient providersApiClient = Substitute.For<IProvidersApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = CreateMapper();
            ProviderSearchService providerSearchService = CreateSearchService(providersApiClient, mapper, logger);

            providersApiClient
                .When(a => a.SearchMasterProviders(Arg.Any<SearchFilterRequest>()))
                .Do(x => { throw new HttpRequestException(); });

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Func<Task> test = () => providerSearchService.PerformSearch(request);

            // Assert
            test
                .Should()
                .Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_GivenProviderApiClientReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            IProvidersApiClient providersApiClient = Substitute.For<IProvidersApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = CreateMapper();

            ProviderSearchService providersSearchService = CreateSearchService(providersApiClient, mapper, logger);

            PagedResult<ProviderVersionSearchResult> expectedServiceResult = null;

            providersApiClient
                .SearchMasterProviders(Arg.Any<SearchFilterRequest>())
                .Returns(expectedServiceResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            ProviderSearchResultViewModel result = await providersSearchService.PerformSearch(request);

            // Assert
            result
                .Should()
                .BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResult()
        {
            // Arrange
            IProvidersApiClient providersApiClient = Substitute.For<IProvidersApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ProviderSearchService providersSearchService = CreateSearchService(providersApiClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<ProviderVersionSearchResult> itemResult = GeneratePagedResult(numberOfItems);

            providersApiClient
                .SearchMasterProviders(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            ProviderSearchResultViewModel results = await providersSearchService.PerformSearch(request);

            // Assert
            ProviderSearchResultItemViewModel first = results.Providers.First();
            first
                .Should()
                .NotBeNull();

            first
                .Id
                .Should()
                .Be("10");

            first
                .Name
                .Should()
                .Be("prov-1");

            first
                .LocalAuthority
                .Should()
                .Be("auth-1");
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResults()
        {
            // Arrange
            IProvidersApiClient providersApiClient = Substitute.For<IProvidersApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ProviderSearchService providersSearchService = CreateSearchService(providersApiClient, mapper, logger);

            int numberOfItems = 25;

            PagedResult<ProviderVersionSearchResult> itemResult = GeneratePagedResult(numberOfItems);

            providersApiClient
                .SearchMasterProviders(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            ProviderSearchResultViewModel results = await providersSearchService.PerformSearch(request);

            // Assert
            results.TotalResults.Should().Be(numberOfItems);
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
            IProvidersApiClient providersApiClient = Substitute.For<IProvidersApiClient>();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            ProviderSearchService providersSearchService = CreateSearchService(providersApiClient, mapper, logger);

            int numberOfItems = 25;

            IEnumerable<SearchFacet> facets = new[]
            {
                new SearchFacet
                {
                    Name = "facet 1",
                    FacetValues = new[]
                    {
                        new SearchFacetValue { Name = "f1", Count = 5 }
                    }
                },
                new SearchFacet
                {
                    Name = "facet 2",
                    FacetValues = new[]
                    {
                        new SearchFacetValue { Name = "f2", Count = 11 },
                        new SearchFacetValue { Name = "f3", Count = 1 }
                    }
                }
            };

            PagedResult<ProviderVersionSearchResult> itemResult = GeneratePagedResult(numberOfItems, facets);

            providersApiClient
                .SearchMasterProviders(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            ProviderSearchResultViewModel results = await providersSearchService.PerformSearch(request);

            // Assert
            ProviderSearchResultItemViewModel first = results.Providers.First();
            first
                .Should()
                .NotBeNull();

            first
                .Id
                .Should()
                .Be("10");

            first
                .Name
                .Should()
                .Be("prov-1");

            first
                .LocalAuthority
                .Should()
                .Be("auth-1");

            results.Facets.Count().Should().Be(facets.Count());
            results.Facets.First().Name.Should().Be("facet 1");
            results.Facets.First().FacetValues.Count().Should().Be(1);
            results.Facets.First().FacetValues.First().Name.Should().Be("f1");
            results.Facets.First().FacetValues.First().Count.Should().Be(5);
            results.Facets.Last().Name.Should().Be("facet 2");
            results.Facets.Last().FacetValues.Count().Should().Be(2);
            results.Facets.Last().FacetValues.First().Name.Should().Be("f2");
            results.Facets.Last().FacetValues.First().Count.Should().Be(11);
            results.Facets.Last().FacetValues.Last().Name.Should().Be("f3");
            results.Facets.Last().FacetValues.Last().Count.Should().Be(1);
        }

        static ProviderSearchService CreateSearchService(IProvidersApiClient providersApiClient = null, IMapper mapper = null, ILogger logger = null, IFeatureToggle featureToggle = null)
        {
            return new ProviderSearchService(
                providersApiClient ?? CreateProvidersApiClient(),
                mapper ?? CreateMapper(),
                logger ?? CreateLogger(),
                featureToggle ?? CreateFeatureToggle());
        }

        static IFeatureToggle CreateFeatureToggle(bool searchModeAll = true)
        {
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();

            featureToggle.IsSearchModeAllEnabled()
                .Returns(searchModeAll);

            return featureToggle;
        }

        static IProvidersApiClient CreateProvidersApiClient()
        {
            return Substitute.For<IProvidersApiClient>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        PagedResult<ProviderVersionSearchResult> GeneratePagedResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            PagedResult<ProviderVersionSearchResult> result = new PagedResult<ProviderVersionSearchResult>();
            List<ProviderVersionSearchResult> items = new List<ProviderVersionSearchResult>();
            for (int i = 0; i < numberOfItems - 1; i++)
            {
                items.Add(new ProviderVersionSearchResult()
                {
                    Id = $"{i + 10}",
                    Name = $"prov-{i + 1}",
                    ProviderId = $"{i + 1}",
                    Authority = $"auth-{i + 1}"
                });
            }

            result.Items = items.AsEnumerable();
            result.PageNumber = 1;
            result.PageSize = 50;
            result.TotalItems = numberOfItems;
            result.TotalPages = 1;
            result.Facets = facets;

            return result;
        }
    }
}
