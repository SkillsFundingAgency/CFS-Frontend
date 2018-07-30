using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Pages.Datasets;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Datasets
{
    [TestClass]
    public class SchemasPageModelTests
    {
        [TestMethod]
        public async Task WhenSchemasPageIsLoadedAndNoDatasetDefinitionsExist_ThenPageIsDisplayed()
        {
            // Arrange
            IDatasetDefinitionSearchService datasetDefinitionSearchService = CreateDatasetDefinitionsSearchService();

            DatasetDefinitionSearchResultViewModel searchResult = new DatasetDefinitionSearchResultViewModel();

            datasetDefinitionSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            SchemasPageModel pageModel = CreatePageModel(datasetDefinitionSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .InitialSearchResults
                 .Should()
                 .NotBeNullOrWhiteSpace();

            pageModel
                .SearchTerm
                .Should()
                .BeNullOrWhiteSpace();

            await datasetDefinitionSearchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(s =>
                s.PageNumber == 1 &&
                s.SearchTerm == null));
        }

        [TestMethod]
        public async Task WhenSchemasPageIsLoadedAndSearchTermIsProvided_ThenPageIsDisplayedWithSearchTermSet()
        {
            // Arrange
            IDatasetDefinitionSearchService datasetDefinitionSearchService = CreateDatasetDefinitionsSearchService();

            DatasetDefinitionSearchResultViewModel searchResult = new DatasetDefinitionSearchResultViewModel();

            datasetDefinitionSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            string searchTerm = "testTerm";

            SchemasPageModel pageModel = CreatePageModel(datasetDefinitionSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(searchTerm, null);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .InitialSearchResults
                 .Should()
                 .NotBeNullOrWhiteSpace();

            pageModel
                .SearchTerm
                .Should()
                .Be(searchTerm);

            await datasetDefinitionSearchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(s =>
                s.PageNumber == 1 &&
                s.SearchTerm == searchTerm));
        }

        [TestMethod]
        public async Task WhenSchemasPageIsLoadedAndPageNumberIsProvided_ThenPageIsDisplayed()
        {
            // Arrange
            int page = 2;

            IDatasetDefinitionSearchService datasetDefinitionSearchService = CreateDatasetDefinitionsSearchService();

            DatasetDefinitionSearchResultViewModel searchResult = new DatasetDefinitionSearchResultViewModel()
            {
                CurrentPage = page,
            };

            datasetDefinitionSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            SchemasPageModel pageModel = CreatePageModel(datasetDefinitionSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, page);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .InitialSearchResults
                 .Should()
                 .NotBeNullOrWhiteSpace();

            pageModel
                .SearchResults
                .CurrentPage
                .Should()
                .Be(page);

            await datasetDefinitionSearchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(s =>
                s.PageNumber == page &&
                s.SearchTerm == null));
        }

        [TestMethod]
        public async Task WhenSchemasPageIsLoadedAndDatasetDefinitionsExist_ThenPageIsDisplayed()
        {
            // Arrange
            IDatasetDefinitionSearchService datasetDefinitionSearchService = CreateDatasetDefinitionsSearchService();

            DatasetDefinitionSearchResultViewModel searchResult = new DatasetDefinitionSearchResultViewModel()
            {
                CurrentPage = 1,
                DatasetDefinitions = new List<DatasetDefinitionSearchResultItemViewModel>()
                {
                    new DatasetDefinitionSearchResultItemViewModel()
                    {
                         Id = "1",
                         Description = "One Description",
                         LastUpdatedDate = new DateTimeOffset(2018, 1, 5, 2, 55, 0, TimeSpan.Zero),
                         Name = "Search one",
                         ProviderIdentifier = "PRV1",
                    },
                    new DatasetDefinitionSearchResultItemViewModel()
                    {
                         Id = "2",
                         Description = "Two Description",
                         LastUpdatedDate = new DateTimeOffset(2018, 1, 5, 2, 2, 0, TimeSpan.Zero),
                         Name = "Search two",
                         ProviderIdentifier = "PRV2",
                    },
                    new DatasetDefinitionSearchResultItemViewModel()
                    {
                         Id = "3",
                         Description = "Three Description",
                         LastUpdatedDate = new DateTimeOffset(2018, 1, 5, 2, 3, 0, TimeSpan.Zero),
                         Name = "Search three",
                         ProviderIdentifier = "PRV3",
                    }
                },
                EndItemNumber = 3,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                StartItemNumber = 1,
                TotalResults = 3,
            };

            datasetDefinitionSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            SchemasPageModel pageModel = CreatePageModel(datasetDefinitionSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .InitialSearchResults
                 .Should()
                 .NotBeNullOrWhiteSpace();

            pageModel
                .SearchTerm
                .Should()
                .BeNullOrWhiteSpace();

            await datasetDefinitionSearchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(s =>
                s.PageNumber == 1 &&
                s.SearchTerm == null));

            pageModel
                .SearchResults
                .Should()
                .BeEquivalentTo(new DatasetDefinitionSearchResultViewModel()
                {
                    CurrentPage = 1,
                    DatasetDefinitions = new List<DatasetDefinitionSearchResultItemViewModel>()
                    {
                        new DatasetDefinitionSearchResultItemViewModel()
                        {
                                Id = "1",
                                Description = "One Description",
                                LastUpdatedDate = new DateTimeOffset(2018, 1, 5, 2, 55, 0, TimeSpan.Zero),
                                Name = "Search one",
                                ProviderIdentifier = "PRV1",
                        },
                        new DatasetDefinitionSearchResultItemViewModel()
                        {
                             Id = "2",
                             Description = "Two Description",
                             LastUpdatedDate = new DateTimeOffset(2018, 1, 5, 2, 2, 0, TimeSpan.Zero),
                             Name = "Search two",
                             ProviderIdentifier = "PRV2",
                        },
                        new DatasetDefinitionSearchResultItemViewModel()
                        {
                             Id = "3",
                             Description = "Three Description",
                             LastUpdatedDate = new DateTimeOffset(2018, 1, 5, 2, 3, 0, TimeSpan.Zero),
                             Name = "Search three",
                             ProviderIdentifier = "PRV3",
                        }
                    },
                    EndItemNumber = 3,
                    Facets = new List<SearchFacetViewModel>(),
                    PagerState = new PagerState(1, 1),
                    StartItemNumber = 1,
                    TotalResults = 3,
                });
        }

        [TestMethod]
        public async Task WhenSchemasPageIsLoadedAndResultsAreNull_ThenErrorIsReturned()
        {
            // Arrange
            IDatasetDefinitionSearchService datasetDefinitionSearchService = CreateDatasetDefinitionsSearchService();

            DatasetDefinitionSearchResultViewModel searchResult = null;

            datasetDefinitionSearchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            SchemasPageModel pageModel = CreatePageModel(datasetDefinitionSearchService);

            // Act
            IActionResult result = await pageModel.OnGetAsync(null, null);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Search results returned null from API call");

            await datasetDefinitionSearchService
                .Received(1)
                .PerformSearch(Arg.Any<SearchRequestViewModel>());
        }

        private SchemasPageModel CreatePageModel(IDatasetDefinitionSearchService datasetDefinitionSearchService = null)
        {
            return new SchemasPageModel(datasetDefinitionSearchService ?? CreateDatasetDefinitionsSearchService());
        }

        private IDatasetDefinitionSearchService CreateDatasetDefinitionsSearchService()
        {
            return Substitute.For<IDatasetDefinitionSearchService>();
        }
    }
}
