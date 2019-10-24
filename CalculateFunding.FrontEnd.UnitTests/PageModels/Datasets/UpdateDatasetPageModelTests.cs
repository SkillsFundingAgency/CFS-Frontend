using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Datasets
{
    [TestClass]
    public class UpdateDatasetPageModelTests
    {
        [TestMethod]
        public async Task UpdateDatasetPageModel_OnGetAsync_WhenValidDatasetVersionRequested_ThenPageIsDisplayed()
        {
            // Arrange
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            UpdateDatasetPageModel pageModel = CreatePageModel(datasetsApiClient);

            string datasetId = "ds1";

            DatasetVersionResponseViewModel datasetVersionResponse = new DatasetVersionResponseViewModel()
            {
                Id = "ds1",
            };

            datasetsApiClient
                .GetCurrentDatasetVersionByDatasetId(datasetId)
                .Returns(new ApiResponse<DatasetVersionResponseViewModel>(HttpStatusCode.OK, datasetVersionResponse));

            // Act
            IActionResult result = await pageModel.OnGetAsync(datasetId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .And
                .Should().NotBeNull();

            pageModel.DatasetVersion
                .Should()
                .BeEquivalentTo(datasetVersionResponse, c => c.WithAutoConversion()
	                .Excluding(_ => _.PublishStatus)
	                .Excluding(_ => _.LastUpdatedDate));
        }

        [TestMethod]
        public async Task UpdateDatasetPageModel_OnGetAsync_WhenDatasetVersionResponseIsNull_ThenErrorIsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            UpdateDatasetPageModel pageModel = CreatePageModel(datasetsApiClient);

            string datasetId = "ds1";

            datasetsApiClient
                .GetCurrentDatasetVersionByDatasetId(datasetId)
                .Returns((ApiResponse<DatasetVersionResponseViewModel>)null);

            // Act
            IActionResult result = await pageModel.OnGetAsync(datasetId);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should().Be("Datasets verion API response was null");
        }

        [TestMethod]
        public async Task UpdateDatasetPageModel_OnGetAsync_WhenDatasetVersionResponseIsNotOk_ThenErrorIsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            UpdateDatasetPageModel pageModel = CreatePageModel(datasetsApiClient);

            string datasetId = "ds1";

            datasetsApiClient
                .GetCurrentDatasetVersionByDatasetId(datasetId)
                .Returns(new ApiResponse<DatasetVersionResponseViewModel>(HttpStatusCode.InternalServerError, null));

            // Act
            IActionResult result = await pageModel.OnGetAsync(datasetId);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should().Be("Datasets version API call was not OK, returned 'InternalServerError'");
        }

        [TestMethod]
        public async Task UpdateDatasetPageModel_OnGetAsync_WhenDatasetVersionResponseContentIsNull_ThenErrorIsReturned()
        {
            // Arrange
            IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

            UpdateDatasetPageModel pageModel = CreatePageModel(datasetsApiClient);

            string datasetId = "ds1";

            datasetsApiClient
                .GetCurrentDatasetVersionByDatasetId(datasetId)
                .Returns(new ApiResponse<DatasetVersionResponseViewModel>(HttpStatusCode.OK, null));

            // Act
            IActionResult result = await pageModel.OnGetAsync(datasetId);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should().Be("Datasets version API content was null");
        }

        private static UpdateDatasetPageModel CreatePageModel(
            IDatasetsApiClient datasetsApiClient = null,
            ILogger logger = null,
            IMapper mapper = null
            )
        {
            return new UpdateDatasetPageModel(
                datasetsApiClient ?? CreateDatasetsApiClient(),
                logger ?? CreateLogger(),
                MappingHelper.CreateFrontEndMapper()
                );
        }

        private static IDatasetsApiClient CreateDatasetsApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }
    }
}
