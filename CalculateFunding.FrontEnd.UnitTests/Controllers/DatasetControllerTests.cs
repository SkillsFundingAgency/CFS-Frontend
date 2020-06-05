// <copyright file="DatasetControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.Controllers
{
    [TestClass]
    public class DatasetControllerTests
    {
	    private static Mock<ISpecificationsApiClient> _mockSpecificationsApiClient;
	    private static Mock<IAuthorizationHelper> _mockAuthorisationHelper;

	    [TestMethod]
        public void SaveDataset_GivenViewModelIsNull_ThrowsArgumentNullException()
        {
            // Arrange
            CreateDatasetViewModel viewModel = null;

            DatasetController controller = CreateController();

            // Act
            Func<Task> test = async () => await controller.SaveDataset(viewModel);

            // Assert
            test
               .Should()
               .ThrowExactly<NullReferenceException>();
        }

        [TestMethod]
        public async Task SaveDataset_GivenViewModelIsNotNullButResponseContainsModelErrors_ReturnsBadRequest()
        {
            // Arrange
            ValidatedApiResponse<NewDatasetVersionResponseModel> response = new ValidatedApiResponse<NewDatasetVersionResponseModel>(HttpStatusCode.BadRequest)
            {
	            ModelState = new Dictionary<string, IEnumerable<string>> {{"Name", new[] {"Invalid name"}}}
            };

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel
            {
                Description = "Description",
                Filename = "Filename.xlsx",
                Name = "Name",
                DataDefinitionId = "0123456789",
                FundingStreamId = "DSG"
            };

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .CreateNewDataset(Arg.Any<CreateNewDatasetModel>())
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

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel
            {
                Description = "Description",
                Filename = "Filename.xlsx",
                Name = "Name",
                DataDefinitionId = "0123456789",
                FundingStreamId = "DSG"
            };

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .CreateNewDataset(Arg.Any<CreateNewDatasetModel>())
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

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel
            {
                Description = "Description",
                Filename = "Filename.xlsx",
                Name = "Name",
                DataDefinitionId = "0123456789",
                FundingStreamId = "DSG"
            };

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .CreateNewDataset(Arg.Any<CreateNewDatasetModel>())
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
        public async Task ValidateDataset_GivenViewModelButResponseIsBadRequest_ReturnsStatusCode400()
        {
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel();

            ValidatedApiResponse<DatasetValidationStatusModel> response = new ValidatedApiResponse<DatasetValidationStatusModel>(HttpStatusCode.BadRequest);
            response.ModelState = new Dictionary<string, IEnumerable<string>>();

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
                .ValidateDataset(Arg.Any<GetDatasetBlobModel>())
                .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.ValidateDataset(viewModel);

            // Assert
            result
               .Should()
               .BeOfType<InternalServerErrorResult>();

            logger
                .Received(1)
                .Warning(Arg.Is("Failed to validate dataset with status code: {statusCode}"), Arg.Is(HttpStatusCode.BadRequest));
        }

        [TestMethod]
        public async Task ValidateDataset_GivenViewModelButResponseIsBadRequestAndHasModelState_ReturnsStatusCode400()
        {
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel();

            IDictionary<string, IEnumerable<string>> modelState = new Dictionary<string, IEnumerable<string>>();
            modelState.Add("error", new List<string> { "an error occured" });

            ValidatedApiResponse<DatasetValidationStatusModel> response = new ValidatedApiResponse<DatasetValidationStatusModel>(HttpStatusCode.BadRequest);
            response.ModelState = modelState;

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
	            .ValidateDataset(Arg.Any<GetDatasetBlobModel>())
	            .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.ValidateDataset(viewModel);

            // Assert
            result
               .Should()
               .BeOfType<BadRequestObjectResult>();

            logger
                .Received(1)
                .Warning(Arg.Is("Failed to validate dataset with status code: {statusCode}"), Arg.Is(HttpStatusCode.BadRequest));
        }

        [TestMethod]
        public async Task ValidateDataset_GivenViewModelAndResponseIsSuccess_ReturnsStatusModel()
        {
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel();


            DatasetValidationStatusModel statusModel = new DatasetValidationStatusModel
            {
                ValidationFailures = new Dictionary<string, IEnumerable<string>>(),
                CurrentOperation = DatasetValidationStatus.Processing,
                DatasetId = "datasetId",
                ErrorMessage = "errorMessage",
                OperationId = "operationId",
            };

            ValidatedApiResponse<DatasetValidationStatusModel> response = new ValidatedApiResponse<DatasetValidationStatusModel>(HttpStatusCode.OK, statusModel);

            DatasetValidationStatusViewModel resultViewModel = new DatasetValidationStatusViewModel()
            {
                ValidationFailures = new Dictionary<string, IEnumerable<string>>(),
                CurrentOperation = DatasetValidationStatusOperationViewModel.Processing,
                DatasetId = "datasetId",
                ErrorMessage = "errorMessage",
                OperationId = "operationId",
            };

            IDatasetsApiClient apiClient = CreateApiClient();
            apiClient
	            .ValidateDataset(Arg.Any<GetDatasetBlobModel>())
	            .Returns(response);

            ILogger logger = CreateLogger();

            DatasetController controller = CreateController(apiClient, logger);

            // Act
            IActionResult result = await controller.ValidateDataset(viewModel);

            // Assert
            result
               .Should()
                   .BeOfType<OkObjectResult>()
                   .Which
                   .Value
                   .Should()
                   .BeEquivalentTo(resultViewModel);
        }

        private static DatasetController CreateController(IDatasetsApiClient apiClient = null, ILogger logger = null, IMapper mapper = null)
        {
			_mockSpecificationsApiClient = new Mock<ISpecificationsApiClient>();
			_mockAuthorisationHelper = new Mock<IAuthorizationHelper>();

            return new DatasetController(apiClient ?? CreateApiClient(), logger ?? CreateLogger(), mapper ?? MappingHelper.CreateFrontEndMapper(), _mockSpecificationsApiClient.Object, _mockAuthorisationHelper.Object);
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
