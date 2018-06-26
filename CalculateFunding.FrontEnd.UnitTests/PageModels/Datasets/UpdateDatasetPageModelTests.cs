using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Datasets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Threading.Tasks;
using Serilog;
using AutoMapper;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Extensions;

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

            DatasetVersionResponse datasetVersionResponse = new DatasetVersionResponse()
            {
                Id = "ds1",
            };

            datasetsApiClient
                .GetCurrentDatasetVersionByDatasetId(datasetId)
                .Returns(new ApiResponse<DatasetVersionResponse>(System.Net.HttpStatusCode.OK, datasetVersionResponse));

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
                .BeEquivalentTo(datasetVersionResponse, c => c.WithAutoConversion());
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
                .Returns((ApiResponse<DatasetVersionResponse>)null);

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
                .Returns(new ApiResponse<DatasetVersionResponse>(System.Net.HttpStatusCode.InternalServerError, null));

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
                .Returns(new ApiResponse<DatasetVersionResponse>(System.Net.HttpStatusCode.OK, null));

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
