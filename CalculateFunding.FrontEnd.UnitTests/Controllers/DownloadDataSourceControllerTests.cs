using CalculateFunding.Common.ApiClient.DataSets;
using Serilog;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FluentAssertions;
using CalculateFunding.Common.ApiClient.Models;
using System.Net;
using System;
using CalculateFunding.Common.ApiClient.DataSets.Models;

namespace CalculateFunding.Frontend.Controllers
{
    [TestClass]
    public class DownloadDataSourceControllerTests
    {
        [TestMethod]
        public void DownloadUrl_WithNullDatasetID_Then_ThrowsArgumentNullException()
        {
            //Arrange
            string datasourceId = null;
            IDatasetsApiClient dataClient = CreateApiClient();
            ILogger logger = CreateLogger();

            DownloadDatasourceController controller = new DownloadDatasourceController(dataClient, logger);

            //Act
            Func<Task> result = async () => await controller.Download(datasourceId);

            // Assert
            result
               .Should()
               .ThrowExactly<ArgumentNullException>();

        }

        [TestMethod]
        public async Task DownloadUrl_GivenDatasetId_Of_NonExistingDataset_ReturnsNoContent()
        {
            //Arrange
            string datasourceId = "123123";
            IDatasetsApiClient dataClient = CreateApiClient();
            ILogger logger = CreateLogger();

            ApiResponse<DatasetDownloadModel> response = new ApiResponse<DatasetDownloadModel>(HttpStatusCode.NoContent);

            dataClient
                .DownloadDatasetFile(datasourceId)
                .Returns(response);

            DownloadDatasourceController controller = new DownloadDatasourceController(dataClient, logger);

            //Act
            IActionResult result = await controller.Download(datasourceId);

            //Assert
            result
               .Should()
               .BeOfType<NotFoundResult>();
        }

        [TestMethod]

        public async Task DownloadUrl_GivenValidUrlFound_Returns_RedirectResult()
        {
            //Arrange
            string datasourceId = "23423423";
            IDatasetsApiClient dataClient = CreateApiClient();
            ILogger logger = CreateLogger();

            DatasetDownloadModel urlResults = new DatasetDownloadModel()
            {
                Url = "test"
            };

            ApiResponse<DatasetDownloadModel> response = new ApiResponse<DatasetDownloadModel>(HttpStatusCode.OK, urlResults);

            DownloadDatasourceController controller = new DownloadDatasourceController(dataClient, logger);

            dataClient
           .DownloadDatasetFile(datasourceId)
           .Returns(response);
            //Act
            IActionResult actionResult = await controller.Download(datasourceId);

            // Asserts
            actionResult
                .Should()
                .BeOfType<RedirectResult>()
                .Which
                .Url
                .Should()
                .Be(urlResults.Url);
        }


        private static IDatasetsApiClient CreateApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }
    }
}
