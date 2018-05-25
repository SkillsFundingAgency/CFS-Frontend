// <copyright file="DatasetControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>
namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;
    using Serilog;

    [TestClass]
    public class DatasetControllerTests
    {
        [TestMethod]
        public void SaveDataset_GivenViewModelIsNull_ThowsArgumentNullException()
        {
            // Arrange
            CreateDatasetViewModel viewModel = null;

            DatasetController controller = CreateController();

            // Act
            Func<Task> test = async () => await controller.SaveDataset(viewModel);

            // Assert
            test
               .Should()
               .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task SaveDataset_GivenViewModelIsNotNullButResponseContainsModelErrors_ReturnsBadRequest()
        {
            // Arrange
            ValidatedApiResponse<NewDatasetVersionResponseModel> response = new ValidatedApiResponse<NewDatasetVersionResponseModel>(HttpStatusCode.BadRequest);
            response.ModelState = new Dictionary<string, IEnumerable<string>>
            {
                { "Name", new [] {"Invalid name" } }
            };

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel();

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .CreateDataset(Arg.Any<CreateNewDatasetModel>())
                .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.SaveDataset(viewModel);

            // Assert
            logger
                .Received(1)
                .Warning(Arg.Is("Invalid model provided"));

            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task SaveDataset_GivenResponseIsInternalServerError_ReturnsStatusCode500()
        {
            // Arrange
            ValidatedApiResponse<NewDatasetVersionResponseModel> response = new ValidatedApiResponse<NewDatasetVersionResponseModel>(HttpStatusCode.InternalServerError);

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel();

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .CreateDataset(Arg.Any<CreateNewDatasetModel>())
                .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.SaveDataset(viewModel);

            // Assert
            logger
                .Received(1)
                .Error(Arg.Is($"Error when posting data set with status code: 500"));

            result
                .Should()
                .BeOfType<StatusCodeResult>();

            StatusCodeResult statusCodeResult = result as StatusCodeResult;

            statusCodeResult
                .StatusCode
                .Should()
                .Be(500);
        }

        [TestMethod]
        public async Task SaveDataset_GivenResponseIsSuccess_ReturnsSuccess()
        {
            // Arrange
            NewDatasetVersionResponseModel responseModel = new NewDatasetVersionResponseModel
            {
                DatasetId = "dataset-id"
            };

            ValidatedApiResponse<NewDatasetVersionResponseModel> response = new ValidatedApiResponse<NewDatasetVersionResponseModel>(HttpStatusCode.OK, responseModel);

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel();

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .CreateDataset(Arg.Any<CreateNewDatasetModel>())
                .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.SaveDataset(viewModel);

            // Assert
            result
                .Should()
                .BeOfType<OkObjectResult>();

            OkObjectResult objectResult = result as OkObjectResult;

            NewDatasetVersionResponseModel content = objectResult.Value as NewDatasetVersionResponseModel;

            content
                .DatasetId
                .Should()
                .Be("dataset-id");
        }

        [TestMethod]
        public void ValidateDatasett_GivenViewModelIsNull_ThowsArgumentNullException()
        {
            // Arrange
            ValidateDatasetModel viewModel = null;

            DatasetController controller = CreateController();

            // Act
            Func<Task> test = async () => await controller.ValidateDataset(viewModel);

            // Assert
            test
               .Should()
               .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task ValidateDatasett_GivenViewModelButResponseIsBadRequest_ReturnsStatusCode400()
        {
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel();

            ApiResponse<ValidateDatasetResponseModel> response = new ApiResponse<ValidateDatasetResponseModel>(HttpStatusCode.BadRequest);

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .ValidateDataset(Arg.Is(viewModel))
                .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.ValidateDataset(viewModel);

            // Assert
            result
               .Should()
               .BeOfType<InternalServerErrorResult>()
               .Which
               .Value.Should().Be("Failed to validate dataset with status code: 400");

            logger
                .Received(1)
                .Warning(Arg.Is("Failed to validate dataset with status code: {statusCode}"), Arg.Is(HttpStatusCode.BadRequest));
        }

        [TestMethod]
        public async Task ValidateDatasett_GivenViewModelAndResponseIsSuccess_ReturnsNoContent()
        {
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel();

            ApiResponse<ValidateDatasetResponseModel> response = new ApiResponse<ValidateDatasetResponseModel>(HttpStatusCode.NoContent);

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .ValidateDataset(Arg.Is(viewModel))
                .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.ValidateDataset(viewModel);

            // Assert
            result
               .Should()
               .BeOfType<NoContentResult>();
        }

        private static DatasetController CreateController(IDatasetsApiClient apiClient = null, ILogger logger = null)
        {
            return new DatasetController(apiClient ?? CreateApiClient(), logger ?? CreateLogger());
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
