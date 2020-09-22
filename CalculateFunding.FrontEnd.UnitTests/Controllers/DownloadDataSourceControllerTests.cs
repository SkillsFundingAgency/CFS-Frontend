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
using static NSubstitute.Substitute;

namespace CalculateFunding.Frontend.Controllers
{
    [TestClass]
    public class DownloadDataSourceControllerTests
    {
        private IDatasetsApiClient _dataClient;
        private ILogger _logger;
        
        private DownloadDatasourceController _controller;

        [TestInitialize]
        public void SetUp()
        {
            _dataClient = For<IDatasetsApiClient>();
            _logger = For<ILogger>();
            
            _controller = new DownloadDatasourceController(_dataClient, _logger);
        }
        
        [TestMethod]
        public void DownloadUrl_WithNullDatasetID_Then_ThrowsArgumentNullException()
        {
            //Act
            Func<Task> result = async () => await _controller.Download(null);

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

            ApiResponse<DatasetDownloadModel> response = new ApiResponse<DatasetDownloadModel>(HttpStatusCode.NoContent);

            _dataClient
                .DownloadDatasetFile(datasourceId)
                .Returns(response);

            //Act
            IActionResult result = await _controller.Download(datasourceId);

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

            DatasetDownloadModel urlResults = new DatasetDownloadModel()
            {
                Url = "test"
            };

            ApiResponse<DatasetDownloadModel> response = new ApiResponse<DatasetDownloadModel>(HttpStatusCode.OK, urlResults);

            _dataClient
           .DownloadDatasetFile(datasourceId)
           .Returns(response);
            //Act
            IActionResult actionResult = await _controller.Download(datasourceId);

            // Asserts
            actionResult
                .Should()
                .BeOfType<RedirectResult>()
                .Which
                .Url
                .Should()
                .Be(urlResults.Url);
        }
    }
}
