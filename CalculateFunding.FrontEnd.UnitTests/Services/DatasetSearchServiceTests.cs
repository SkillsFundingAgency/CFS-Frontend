// <copyright file="DatasetSearchServiceTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using FluentAssertions;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            datasetClient
                .When(a => a.FindDatasets(Arg.Any<SearchFilterRequest>()))
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            PagedResult<DatasetSearchResultItem> expectedServiceResult = null;

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            int numberOfItems = 25;

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            int numberOfItems = 25;

            IEnumerable<SearchFacet> facets = new[]
            {
                new SearchFacet(), new SearchFacet()
            };

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

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

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems, facets);

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            int numberOfItems = 0;

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            int numberOfItems = 25;

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            int numberOfItems = 25;

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);
            itemResult.PageNumber = 2;
            itemResult.PageSize = 50;
            itemResult.TotalItems = 75;

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
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
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(datasetClient, mapper, logger, featureToggle);

            int numberOfItems = 50;

            PagedResult<DatasetSearchResultItem> itemResult = GeneratePagedResult(numberOfItems);
            itemResult.PageNumber = 2;
            itemResult.PageSize = 50;
            itemResult.TotalItems = 175;

            datasetClient
                .FindDatasets(Arg.Any<SearchFilterRequest>())
                .Returns(itemResult);

            SearchRequestViewModel request = new SearchRequestViewModel()
            {
                PageNumber = 2,
            };

            // Act
            DatasetSearchResultViewModel results = await datasetSearchService.PerformSearch(request);

            // Assert
            results.StartItemNumber.Should().Be(51);
            results.EndItemNumber.Should().Be(100);
        }

	    [TestMethod]
	    public async Task PerformSearchDatasetVersion_GivenClientReturnsResult_ShouldReturnCorrectlyMappedResult()
	    {
			// Arrange
		    IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
		    ILogger mockLogger = Substitute.For<ILogger>();
		    IMapper mockMapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger, featureToggle);

		    PagedResult<DatasetVersionSearchResultModel> itemResult = GeneratedPagedResultsDatasetVersionSearchResultModel(50);
		    itemResult.PageNumber = 2;
		    itemResult.PageSize = 50;
		    itemResult.TotalItems = 175;

		    mockDatasetsApiClient
			    .FindDatasetsVersions(Arg.Any<SearchFilterRequest>())
			    .Returns(itemResult);

			// Act
			DatasetVersionSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearchDatasetVersion(new SearchRequestViewModel());

			// Assert
		    datasetVersionSearchResultViewModel.Should().NotBeNull();
		    datasetVersionSearchResultViewModel.Results.Count().Should().Be(50);
		    datasetVersionSearchResultViewModel.TotalResults.Should().Be(175);
		    datasetVersionSearchResultViewModel.CurrentPage.Should().Be(2);
		    datasetVersionSearchResultViewModel.PageSize.Should().Be(50);
	    }

	    [TestMethod]
	    public async Task PerformSearchDatasetVersion_GivenClientReturnsEmptyResult_ShouldReturnCorrectlyMappedResult()
	    {
		    // Arrange
		    IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
		    ILogger mockLogger = Substitute.For<ILogger>();
		    IMapper mockMapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger, featureToggle);

		    mockDatasetsApiClient
			    .FindDatasetsVersions(Arg.Any<SearchFilterRequest>())
			    .Returns((PagedResult<DatasetVersionSearchResultModel>)null);

		    // Act
		    DatasetVersionSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearchDatasetVersion(new SearchRequestViewModel());

		    // Assert
		    datasetVersionSearchResultViewModel.Should().BeNull();
	    }

        [TestMethod]
        public async Task PerformSearchDatasetVersion_GivenIsSearchModeAllEnabledFeatureToggleIdTurnedOff_SearchModeIsAny()
        {
            // Arrange
            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            ILogger mockLogger = Substitute.For<ILogger>();
            IMapper mockMapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger, featureToggle);

            // Act
            DatasetVersionSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearchDatasetVersion(new SearchRequestViewModel());

            // Assert
            await
                mockDatasetsApiClient
                    .Received(1)
                    .FindDatasetsVersions(Arg.Is<SearchFilterRequest>(m => m.SearchMode == SearchMode.Any));
        }

        [TestMethod]
        public async Task PerformSearchDatasetVersion_GivenIsSearchModeAllEnabledFeatureToggleIdTurnedOn_SearchModeIsAll()
        {
            // Arrange
            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            ILogger mockLogger = Substitute.For<ILogger>();
            IMapper mockMapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle(true);

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger, featureToggle);

            // Act
            DatasetVersionSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearchDatasetVersion(new SearchRequestViewModel());

            // Assert
            await
                mockDatasetsApiClient
                    .Received(1)
                    .FindDatasetsVersions(Arg.Is<SearchFilterRequest>(m => m.SearchMode == SearchMode.All));
        }

        [TestMethod]
        public async Task PerformSearch_GivenIsSearchModeAllEnabledFeatureToggleIdTurnedOff_SearchModeIsAny()
        {
            // Arrange
            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            ILogger mockLogger = Substitute.For<ILogger>();
            IMapper mockMapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle();

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger, featureToggle);

            // Act
            DatasetSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearch(new SearchRequestViewModel());

            // Assert
            await
                mockDatasetsApiClient
                    .Received(1)
                    .FindDatasets(Arg.Is<SearchFilterRequest>(m => m.SearchMode == SearchMode.Any));
        }

        [TestMethod]
        public async Task PerformSearch_GivenIsSearchModeAllEnabledFeatureToggleIdTurnedOn_SearchModeIsAll()
        {
            // Arrange
            IDatasetsApiClient mockDatasetsApiClient = Substitute.For<IDatasetsApiClient>();
            ILogger mockLogger = Substitute.For<ILogger>();
            IMapper mockMapper = MappingHelper.CreateFrontEndMapper();
            IFeatureToggle featureToggle = CreateFeatureToggle(true);

            IDatasetSearchService datasetSearchService = new DatasetSearchService(mockDatasetsApiClient, mockMapper, mockLogger, featureToggle);

            // Act
            DatasetSearchResultViewModel datasetVersionSearchResultViewModel = await datasetSearchService.PerformSearch(new SearchRequestViewModel());

            // Assert
            await
                mockDatasetsApiClient
                    .Received(1)
                    .FindDatasets(Arg.Is<SearchFilterRequest>(m => m.SearchMode == SearchMode.All));
        }

        private PagedResult<DatasetSearchResultItem> GeneratePagedResult(int numberOfItems, IEnumerable<SearchFacet> facets = null)
        {
            PagedResult<DatasetSearchResultItem> result = new PagedResult<DatasetSearchResultItem>();
            List<DatasetSearchResultItem> items = new List<DatasetSearchResultItem>();
            for (int i = 0; i < numberOfItems; i++)
            {
                items.Add(new DatasetSearchResultItem()
                {
                    Id = $"{i + 10}",
                    Name = $"Dataset {i + 1}",
                    Status = "Unknown",
                    LastUpdated = new DateTime(2018, 2, 6, 15, 31, 0),
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

	    private PagedResult<DatasetVersionSearchResultModel> GeneratedPagedResultsDatasetVersionSearchResultModel(int numberOfItems)
	    {
		    PagedResult<DatasetVersionSearchResultModel> result = new PagedResult<DatasetVersionSearchResultModel>();
		    List<DatasetVersionSearchResultModel> items = new List<DatasetVersionSearchResultModel>();
		    for (int i = 0; i < numberOfItems; i++)
		    {
			    items.Add(new DatasetVersionSearchResultModel()
			    {
				    Id = $"{i + 10}",
				    Name = $"Dataset {i + 1}"
			    });
		    }

		    result.Items = items.AsEnumerable();
		    result.PageNumber = 1;
		    result.PageSize = 50;
		    result.TotalItems = numberOfItems;
		    result.TotalPages = 1;
		    result.Facets = null;

		    return result;
		}

        private static IFeatureToggle CreateFeatureToggle(bool featureToggleOn = false)
        {
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            featureToggle
                .IsSearchModeAllEnabled()
                .Returns(featureToggleOn);

            return featureToggle;
        }
    }
}
