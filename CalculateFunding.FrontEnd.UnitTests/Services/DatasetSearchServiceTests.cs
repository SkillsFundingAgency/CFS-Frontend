// <copyright file="DatasetSearchServiceTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.Models.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    [TestClass]
    public class DatasetSearchServiceTests
    {
        [TestMethod]
        public void PerformSearch_WhenFindDatasetsServiceUnavailable_ThenHttpExceptionThrown()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            datasetClient
                .When(a => a.SearchDatasets(Arg.Any<SearchModel>()))
                .Do(x => { throw new HttpRequestException(); });

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            Action pageAction = new Action(() =>
            {
                DatasetSearchResultViewModel result = datasetSearchService.PerformSearch(request).Result;
            });

            // Assert
            pageAction.Should().Throw<HttpRequestException>();
        }

        [TestMethod]
        public async Task PerformSearch_WhenFindDatasetsServiceReturnsNotFound_ThenNullReturned()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            ApiResponse<SearchResults<DatasetIndex>> expectedServiceResult = null;

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(expectedServiceResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetSearchResultViewModel result = await datasetSearchService.PerformSearch(request);

            // Assert
            result.Should().BeNull();
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultReturnedCorrectly()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            int numberOfItems = 25;

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems);

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            DatasetSearchResultItemViewModel first = results.Datasets.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.Status.Should().Be("Unknown");
            first.LastUpdated.Should().Be(new DateTime(2018, 2, 6, 15, 31, 0));
            first.Name.Should().Be("Dataset 1");
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_ReturnedCorrectly()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            int numberOfItems = 25;

            IEnumerable<SearchFacet> facets = new[]
            {
                new SearchFacet(), new SearchFacet()
            };

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems, facets);

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            DatasetSearchResultItemViewModel first = results.Datasets.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.LastUpdated.Should().Be(new DateTime(2018, 2, 6, 15, 31, 0));
            first.Status.Should().Be("Unknown");
            first.Name.Should().Be("Dataset 1");

            results.Facets.Count().Should().Be(2);
        }

        [TestMethod]
        public async Task PerformSearch_FirstSearchResultWithFacets_EnsuresFacetsLoadedCorrectly()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

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

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems, facets);

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            DatasetSearchResultItemViewModel first = results.Datasets.First();
            first.Should().NotBeNull();
            first.Id.Should().Be("10");
            first.LastUpdated.Should().Be(new DateTime(2018, 2, 6, 15, 31, 0));
            first.Status.Should().Be("Unknown");
            first.Name.Should().Be("Dataset 1");

            results.Facets.Count().Should().Be(2);
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

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnZeroItems()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            int numberOfItems = 0;

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems);

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(0);
            results.EndItemNumber.Should().Be(0);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSinglePageOfItems()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            int numberOfItems = 25;

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems);

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel();

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(1);
            results.EndItemNumber.Should().Be(numberOfItems);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSecondPageOfItemsWithLessThanPageSize()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            int numberOfItems = 25;

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems);
            itemResult.Content.TotalCount = 75;

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
                PageSize = 50
            };

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(75);
        }

        [TestMethod]
        public async Task PerformSearch_StartAndEndItemsNumbersDisplayedCorrectlyOnSecondPageOfItemsWithMorePagesAvailable()
        {
            // Arrange
            IDatasetsApiClient datasetClient = Substitute.For<IDatasetsApiClient>();
            ILogger logger = Substitute.For<ILogger>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger);

            int numberOfItems = 50;

            ApiResponse<SearchResults<DatasetIndex>> itemResult = GenerateSearchResult(numberOfItems);
            itemResult.Content.TotalCount = 175;

            datasetClient
                .SearchDatasets(Arg.Any<SearchModel>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
                PageSize = 50
            };

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(100);
        }

	    [TestMethod]
	    public async Task PerformSearchDatasetVersion_GivenClientReturnsEmptyResult_ShouldReturnCorrectlyMappedResult()
	    {
		    // Arrange
		    IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
		    ILogger mockLogger = Substitute.For<ILogger>();
		    IMapper mockMapper = MappingHelper.CreateFrontEndMapper();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger);

		    mockDatasetsApiClient
			    .SearchDatasets(Arg.Any<SearchModel>())
			    .Returns((ApiResponse<SearchResults<DatasetIndex>>)null);

		    // Act
		    DatasetVersionSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearchDatasetVersion(new SearchRequestViewModel());

		    // Assert
		    datasetVersionSearchResultViewModel.Should().BeNull();
	    }

        private ApiResponse<SearchResults<DatasetIndex>> GenerateSearchResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
	        SearchResults<DatasetIndex> result = new SearchResults<DatasetIndex>();
            List<DatasetIndex> items = new List<DatasetIndex>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new DatasetIndex()
                {
                    Id = $"{i + 10}",
                    Name = $"Dataset {i + 1}",
                    Status = "Unknown",
                    LastUpdatedDate = new DateTime(2018, 2, 6, 15, 31, 0),
                });
            }

            result.Results = items.AsEnumerable();
            result.TotalCount = numberOfItems;
            result.Facets = facets;

            return new ApiResponse<SearchResults<DatasetIndex>>(HttpStatusCode.OK, result);
        }

	    private ApiResponse<SearchResults<DatasetVersionIndex>> GeneratedPagedResultsDatasetVersionSearchResultModel(int numberOfItems)
	    {
		    SearchResults<DatasetVersionIndex> result = new SearchResults<DatasetVersionIndex>();
		    List<DatasetVersionIndex> items = new List<DatasetVersionIndex>();
		    for (int i = 0; i < numberOfItems; i++)
		    {
			    items.Add(new DatasetVersionIndex()
			    {
				    Id = $"{i + 10}",
				    Name = $"Dataset {i + 1}"
			    });
		    }

		    result.Results = items.AsEnumerable();
		    result.TotalCount = numberOfItems;
		    result.Facets = null;

		    return new ApiResponse<SearchResults<DatasetVersionIndex>>(HttpStatusCode.OK, result);
		}
    }
}
