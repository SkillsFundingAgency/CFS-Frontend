namespace CalculateFunding.Frontend.UnitTests.PageModels.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Datasets;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class ManageDatasetsModelTests
    {

        [TestMethod]
        public async Task OnGetAsync_GivenDatasetPageModelPerformSearchReturnsNoResults_ReturnsPageResult()
        {

            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(1, null);

            //Assert
            result
                .Should()
                .NotBeNull();

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 1 &&
                    c.SearchTerm == null));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenDatasetPageModelPerformSearchReturnsResults_ReturnsPageResult()
        {
            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 1,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>()
                {
                    new DatasetSearchResultItemViewModel()
                    {
                        Id = "Search1",
                        Name = "Search One",
                        Description = "Description",
                        LastUpdated = new DateTime(2018, 3, 5, 12, 34, 52),
                        Status = "Draft"
                    }

                },
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(null, null);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            DatasetModel
                .SearchResults
                .Should()
                .BeEquivalentTo(new DatasetSearchResultViewModel()
                {

                    CurrentPage = 1,
                    EndItemNumber = 0,
                    Facets = new List<SearchFacetViewModel>(),
                    PagerState = new PagerState(1, 1),
                    Datasets = new List<DatasetSearchResultItemViewModel>()
                        {
                            new DatasetSearchResultItemViewModel()
                            {
                                Id = "Search1",
                                Name = "Search One",
                                Description = "Description",
                                LastUpdated = new DateTime(2018, 3, 5, 12, 34, 52),
                                Status = "Draft"
                            }
                        },
                    StartItemNumber = 1,
                    TotalResults = 0
                });

            await searchService
               .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == null &&
                    c.SearchTerm == null));
        }

        [TestMethod]
        public async Task OnGetAsync_GivenDatasetSearchModelSecondPageRequested_ReturnsPageResult()
        {

            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(2, null);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 2 &&
                    c.SearchTerm == null));
        }


        [TestMethod]
        public async Task OnGetAsync_GivenDatasetPageModelSearchTermRequested_ReturnsPageResult()
        {

            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            const string searchTerm = "testTerm";

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(2, searchTerm);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == 2 &&
                    c.SearchTerm == searchTerm));
        }


        [TestMethod]
        public async Task OnGetAsync_GivenDatasetPerformSearchReturnsNullResults_ThenErrorReturned()
        {

            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            DatasetSearchResultViewModel searchResult = null;

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(null, null);

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>();

            InternalServerErrorResult statusCodeResult = result as InternalServerErrorResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);

            statusCodeResult
                .Value
                .Should()
                .Equals("There was an error retrieving data sources from the Search Index.");

            await searchService
                .Received(1)
                .PerformSearch(Arg.Is<SearchRequestViewModel>(
                    c => c.PageNumber == null &&
                    c.SearchTerm == null));
        }

        [TestMethod]
        public async Task OnGetAsync_WhenOperationTypeisSpecifiedButNoOperationId_ThenPreconditionFailedReturned()
        {
            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(null, null, DatasetPageBannerOperationType.DatasetUpdated, null);

            //Assert
            result
                .Should()
                .BeOfType<PreconditionFailedResult>()
                .Which
                .Value
                .Should()
                .Be("Operation ID not provided");
        }


        [TestMethod]
        public async Task OnGetAsync_WhenOperationTypeIsDatasetUpdatedAndDatasetVersionByDatasetIdIsNotReturned_ThenInternalServerErrorResult()
        {
            //Arrange
            IDatasetSearchService searchService = CreateSearchService();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService);

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(null, null, DatasetPageBannerOperationType.DatasetUpdated, "Dataset1");

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .And
                .Equals("Dataset API response returned null.");
        }

        [TestMethod]
        public async Task OnGetAsync_WhenOperationTypeIsDatasetUpdated_ThenBannerPopulated()
        {
            //Arrange
            IDatasetSearchService searchService = CreateSearchService();
            IDatasetsApiClient datasetsApiClient = CreateDatasetApiClient();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService, datasetsApiClient);

            string datasetId = "Dataset1";

            DatasetVersionResponse datasetVersionResponse = CreateDatasetResponseForBannerChecks(datasetId);

            datasetsApiClient.GetCurrentDatasetVersionByDatasetId(Arg.Any<string>())
                .Returns(new ApiResponse<DatasetVersionResponse>(HttpStatusCode.OK, datasetVersionResponse));

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(null, null, DatasetPageBannerOperationType.DatasetUpdated, "Dataset1");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            DatasetModel
                .PageBanner
                .Should()
                .BeEquivalentTo(new PageBannerOperation()
                {
                    EntityName = "Test Dataset",
                    EntityType = "Data Source",
                    OperationId = "Dataset1",
                    SecondaryActionUrl = "/datasets/updatedataset?datasetId=" + datasetId,
                    DisplayOperationActionSummary = true,
                    CurrentDataSourceRows = datasetVersionResponse.CurrentDataSourceRows,
                    PreviousDataSourceRows = datasetVersionResponse.PreviousDataSourceRows,
                    OperationActionSummaryText = "A new version of a data source with " + datasetVersionResponse.CurrentDataSourceRows + " data rows uploaded, the previous version contained " + datasetVersionResponse.PreviousDataSourceRows + "  data rows",
                });
        }

        [TestMethod]
        public async Task OnGetAsync_WhenOperationTypeIsDatasetCreated_ThenBannerPopulated()
        {
            //Arrange
            IDatasetSearchService searchService = CreateSearchService();
            IDatasetsApiClient datasetsApiClient = CreateDatasetApiClient();

            DatasetSearchResultViewModel searchResult = new DatasetSearchResultViewModel()
            {
                CurrentPage = 2,
                EndItemNumber = 0,
                Facets = new List<SearchFacetViewModel>(),
                PagerState = new PagerState(1, 1),
                Datasets = new List<DatasetSearchResultItemViewModel>(),
                StartItemNumber = 1,
                TotalResults = 0
            };

            searchService
                .PerformSearch(Arg.Any<SearchRequestViewModel>())
                .Returns(searchResult);

            ManageDatasetsPageModel DatasetModel = CreateDatasetPageModel(searchService, datasetsApiClient);

            string datasetId = "Dataset1";

            DatasetVersionResponse datasetVersionResponse = CreateDatasetResponseForBannerChecks(datasetId);

            datasetsApiClient.GetCurrentDatasetVersionByDatasetId(Arg.Any<string>())
                .Returns(new ApiResponse<DatasetVersionResponse>(HttpStatusCode.OK, datasetVersionResponse));

            //Act
            IActionResult result = await DatasetModel.OnGetAsync(null, null, DatasetPageBannerOperationType.DatasetCreated, "Dataset1");

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            DatasetModel
                .PageBanner
                .Should()
                .BeEquivalentTo(new PageBannerOperation()
                {
                    EntityName = "Test Dataset",
                    EntityType = "Data Source",
                    OperationId = "Dataset1",
                    SecondaryActionUrl = "/datasets/updatedataset?datasetId=" + datasetId,
                    CurrentDataSourceRows = datasetVersionResponse.CurrentDataSourceRows,
                    PreviousDataSourceRows = datasetVersionResponse.PreviousDataSourceRows,
                    DisplayOperationActionSummary = true,
                    OperationActionSummaryText = "A new data source with " + datasetVersionResponse.CurrentDataSourceRows + " data rows uploaded",
                });
        }

        private static DatasetVersionResponse CreateDatasetResponseForBannerChecks(string datasetId)
        {
            return new DatasetVersionResponse()
            {
                BlobName = "datasetblob",
                Id = "DatasetId",
                Name = "Test Dataset",
                Description = "Test Description",
                Comment = "Test Comment",
                Status = "Draft",
                Author = new Reference("1", "Test User"),
                Version = 1,
                Definition = new Reference("1", "Test Definition"),
                LastUpdatedDate = new DateTime(2018, 3, 5, 12, 34, 52),
                CurrentDataSourceRows = 10,
                PreviousDataSourceRows = 10,
            };
        }


        private static ManageDatasetsPageModel CreateDatasetPageModel(
            IDatasetSearchService searchService = null,
            IDatasetsApiClient datasetApiClient = null,
            IFeatureToggle featureToggle = null)
        {
            return new ManageDatasetsPageModel(
                searchService ?? CreateSearchService(),
                datasetApiClient ?? CreateDatasetApiClient(),
                featureToggle ?? CreateFeatureToggle());
        }

        private static IDatasetSearchService CreateSearchService()
        {
            return Substitute.For<IDatasetSearchService>();
        }

        private static IDatasetsApiClient CreateDatasetApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static IFeatureToggle CreateFeatureToggle()
        {
            return Substitute.For<IFeatureToggle>();
        }
    }
}
