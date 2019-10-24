﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using SearchMode = CalculateFunding.Common.ApiClient.Models.SearchMode;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class DatasetDefinitionSearchServiceTests
    {

        [TestMethod]
        public void PerformSearch_GivenFindDatasetDefinitionsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            IDatasetsApiClient apiClient = CreateApiClient();
            ILogger logger = CreateLogger();
            IMapper mapper = CreateMapper();
            DatasetDefinitionSearchService searchService = CreateSearchService(apiClient, mapper, logger);

            apiClient
                .When(a => a.SearchDatasetDefinitions(Arg.Any<SearchModel>()))
                .Do(x => { throw new HttpRequestException(); });

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Func<Task> test = () => searchService.PerformSearch(request);

            // Assert
            test
                .Should()
                .Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFindDatasetDefinitionsServiceReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            IDatasetsApiClient apiClient = CreateApiClient();
            ILogger logger = CreateLogger();
            IMapper mapper = CreateMapper();

            DatasetDefinitionSearchService searchService = CreateSearchService(apiClient, mapper, logger);

            ApiResponse<SearchResults<DatasetDefinitionIndex>> expectedServiceResult = null;

            apiClient
                .SearchDatasetDefinitions(Arg.Any<SearchModel>())
                .Returns(expectedServiceResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetDefinitionSearchResultViewModel result = await searchService.PerformSearch(request);

            // Assert
            result
                .Should()
                .BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_GivenFirstSearchResultReturnedCorrectly_EnsuresResult()
        {
            // Arrange
            IDatasetsApiClient apiClient = CreateApiClient();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            DatasetDefinitionSearchService searchService = CreateSearchService(apiClient, mapper, logger);

            int numberOfItems = 25;

            ApiResponse<SearchResults<DatasetDefinitionIndex>> itemResult = GenerateSearchResult(numberOfItems);

            apiClient
                .SearchDatasetDefinitions(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetDefinitionSearchResultViewModel results = await searchService.PerformSearch(request);

            // Assert
            results
                .DatasetDefinitions
                .First()
                .Should()
                .BeEquivalentTo(new DatasetDefinitionSearchResultItemViewModel()
                {
                    Id = "10",
                    Description = "Description 0",
                    LastUpdatedDate = new DateTimeOffset(2018, 1, 2, 3, 4, 0, TimeSpan.Zero),
                    Name = "ds-1",
                    ProviderIdentifier = "Provider 0",
                });

            await apiClient
                .Received(1)
                .SearchDatasetDefinitions(Arg.Any<SearchModel>());
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
            IDatasetsApiClient apiClient = CreateApiClient();
            ILogger logger = CreateLogger();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            DatasetDefinitionSearchService searchService = CreateSearchService(apiClient, mapper, logger);

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

            ApiResponse<SearchResults<DatasetDefinitionIndex>> itemResult = GenerateSearchResult(numberOfItems, facets);

            apiClient
                .SearchDatasetDefinitions(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetDefinitionSearchResultViewModel results = await searchService.PerformSearch(request);

            // Assert
            results
                .DatasetDefinitions
                .First()
                .Should()
                .BeEquivalentTo(
                    new DatasetDefinitionSearchResultItemViewModel()
                    {
                        Id = "10",
                        Description = "Description 0",
                        LastUpdatedDate = new DateTimeOffset(2018, 1, 2, 3, 4, 0, TimeSpan.Zero),
                        Name = "ds-1",
                        ProviderIdentifier = "Provider 0",
                    }
                );

            results
                .Facets
                .Should()
                .BeEquivalentTo(new List<SearchFacetViewModel>(){
                    new SearchFacetViewModel
                    {
                        Name = "facet 1",
                        FacetValues = new[]
                        {
                            new SearchFacetValueViewModel { Name = "f1", Count = 5 }
                        }
                    },
                    new SearchFacetViewModel
                    {
                        Name = "facet 2",
                        FacetValues = new[]
                        {
                            new SearchFacetValueViewModel { Name = "f2", Count = 11 },
                            new SearchFacetValueViewModel { Name = "f3", Count = 1 }
                        }
                    }
                });

            await apiClient
                .Received(1)
                .SearchDatasetDefinitions(Arg.Any<SearchModel>());
        }

        [TestMethod]
        public async Task PerformSearch_GivenIsSearchModeAllEnabledFeatureToggleIdTurnedOff_SearchModeIsAny()
        {
            // Arrange
            IDatasetsApiClient apiClient = CreateApiClient();

            DatasetDefinitionSearchService searchService = CreateSearchService(apiClient);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetDefinitionSearchResultViewModel result = await searchService.PerformSearch(request);

            // Assert
            await
	            apiClient
		            .Received(1)
		            .SearchDatasetDefinitions(Arg.Is<SearchModel>(m => m.SearchMode == Common.Models.Search.SearchMode.Any));
        }

        [TestMethod]
        public async Task PerformSearch_GivenIsSearchModeAllEnabledFeatureToggleIdTurnedOn_SearchModeIsAll()
        {
            // Arrange
            IDatasetsApiClient apiClient = CreateApiClient();
            IFeatureToggle featureToggle = CreateFeatureToggle(true);

            DatasetDefinitionSearchService searchService = CreateSearchService(apiClient, featureToggle: featureToggle);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetDefinitionSearchResultViewModel result = await searchService.PerformSearch(request);

            // Assert
            await
                apiClient
                    .Received(1)
                    .SearchDatasetDefinitions(Arg.Is<SearchModel>(m => m.SearchMode == Common.Models.Search.SearchMode.All));
        }

        static DatasetDefinitionSearchService CreateSearchService(IDatasetsApiClient apiClient = null, IMapper mapper = null, ILogger logger = null, IFeatureToggle featureToggle = null)
        {
            return new DatasetDefinitionSearchService(
                apiClient ?? CreateApiClient(),
                mapper ?? CreateMapper(),
                logger ?? CreateLogger(),
                featureToggle ?? CreateFeatureToggle());
        }

        static IDatasetsApiClient CreateApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

        private static IFeatureToggle CreateFeatureToggle(bool featureToggleOn = false)
        {
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            featureToggle
                .IsSearchModeAllEnabled()
                .Returns(featureToggleOn);

            return featureToggle;
        }

        ApiResponse<SearchResults<DatasetDefinitionIndex>> GenerateSearchResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            SearchResults<DatasetDefinitionIndex> result = new SearchResults<DatasetDefinitionIndex>();
            List<DatasetDefinitionIndex> items = new List<DatasetDefinitionIndex>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new DatasetDefinitionIndex()
                {
                    Id = $"{i + 10}",
                    Name = $"ds-{i + 1}",
                    Description = $"Description {i}",
                    LastUpdatedDate = new DateTimeOffset(2018, 1, 2, 3, 4, i, TimeSpan.Zero),
                    ProviderIdentifier = $"Provider {i}",
                });
            }

            result.Results = items.AsEnumerable();
            result.TotalCount = numberOfItems;
            result.Facets = facets;

            return new ApiResponse<SearchResults<DatasetDefinitionIndex>>(HttpStatusCode.OK, result);
        }
    }
}
