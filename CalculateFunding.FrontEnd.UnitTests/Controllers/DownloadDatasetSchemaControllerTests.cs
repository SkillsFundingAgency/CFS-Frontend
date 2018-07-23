namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using FluentAssertions;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using System.Net;
    using System;
    using CalculateFunding.Frontend.Controllers;

    [TestClass]
    public class DownloadDatasetSchemaControllerTests
    {

        [TestMethod]
        public void Download_WithNullOrEmptyChemaNameThen_ThrowsArgumentNullException()
        {
            //Arrange
            string schemaName = null;

            DownloadDatasetSchemaController controller = CreateController();

            //Act
            Func<Task> result = async () => await controller.Download(schemaName);

            // Assert
            result
               .Should()
               .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task Download_WhenResponseIsNotASuccess_ReturnsNotFoundResult()
        {
            //Arrange
            const string schemaName = "test schema";

            ApiResponse<DownloadDatasetSchemaResponse> apiResponse = new ApiResponse<DownloadDatasetSchemaResponse>(HttpStatusCode.NotFound);

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .GetDatasetSchemaUrl(Arg.Is<DownloadDatasetSchemaRequest>(m => m.DatasetDefinitionName == schemaName))
                .Returns(apiResponse);

            DownloadDatasetSchemaController controller = CreateController(apiClient);

            //Act
            IActionResult actionResult = await controller.Download(schemaName);

            //Assert
            actionResult
                .Should()
                .BeOfType<NotFoundResult>();
        }

        [TestMethod]
        public async Task Download_WhenResponseIsASuccess_ReturnsRedirectResult()
        {
            //Arrange
            const string schemaName = "test schema";

            const string schemaUrl = "http://wherever";

            DownloadDatasetSchemaResponse downloadDatasetSchemaResponse = new DownloadDatasetSchemaResponse
            {
                SchemaUrl = schemaUrl
            };

            ApiResponse<DownloadDatasetSchemaResponse> apiResponse = new ApiResponse<DownloadDatasetSchemaResponse>(HttpStatusCode.OK, downloadDatasetSchemaResponse);

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .GetDatasetSchemaUrl(Arg.Is<DownloadDatasetSchemaRequest>(m => m.DatasetDefinitionName == schemaName))
                .Returns(apiResponse);

            DownloadDatasetSchemaController controller = CreateController(apiClient);

            //Act
            IActionResult actionResult = await controller.Download(schemaName);

            //Assert
            actionResult
                .Should()
                .BeOfType<RedirectResult>()
                .Which
                .Url
                .Should()
                .Be(schemaUrl);
        }


        private static DownloadDatasetSchemaController CreateController(IDatasetsApiClient apiClient = null)
        {
            return new DownloadDatasetSchemaController(apiClient ?? CreateApiClient());
        }

        private static IDatasetsApiClient CreateApiClient()
        {
            return Substitute.For<IDatasetsApiClient>();
        }
    }
}
