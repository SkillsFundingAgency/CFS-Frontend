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
