// <copyright file="DatasetControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Datasets;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class DatasetControllerTests
    {
        private Mock<ISpecificationsApiClient> _specifications;
        private Mock<IAuthorizationHelper> _authorisationHelper;

        private DatasetController _controller;
        private IDatasetsApiClient _apiClient;
        private ILogger _logger;

        [TestInitialize]
        public void SetUp()
        {
            _specifications = new Mock<ISpecificationsApiClient>();
            _authorisationHelper = new Mock<IAuthorizationHelper>();
            _logger = Substitute.For<ILogger>();
            _apiClient = Substitute.For<IDatasetsApiClient>();

            _controller = CreateController(_apiClient, _logger);
        }

        [TestMethod]
        public void SaveDataset_GivenViewModelIsNull_ThrowsArgumentNullException()
        {
            // Act
            Func<Task> test = async () => await _controller.CreateNewDataset(null);

            // Assert
            test
                .Should()
                .ThrowExactly<NullReferenceException>();
        }
        
        [TestMethod]
        public async Task UpdateDatasetVersion_GivenBadRequestFromApi_ReturnsBadRequest()
        {
            ValidatedApiResponse<NewDatasetVersionResponseModel> response = new ValidatedApiResponse<NewDatasetVersionResponseModel>(HttpStatusCode.BadRequest);

            _apiClient
                .DatasetVersionUpdate(Arg.Any<DatasetVersionUpdateModel>())
                .Returns(response);

            IActionResult result = await _controller.UpdateDatasetVersion(null, null, new DatasetUpdateViewModel());

            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task SaveDataset_GivenViewModelIsNotNullButResponseContainsModelErrors_ReturnsBadRequest()
        {
            // Arrange
            ValidatedApiResponse<NewDatasetVersionResponseModel> response = new ValidatedApiResponse<NewDatasetVersionResponseModel>(HttpStatusCode.BadRequest)
            {
                ModelState = new Dictionary<string, IEnumerable<string>>
                {
                    {
                        "Name", new[]
                        {
                            "Invalid name"
                        }
                    }
                }
            };

            CreateDatasetViewModel viewModel = new CreateDatasetViewModel
            {
                Description = "Description",
                Filename = "Filename.xlsx",
                Name = "Name",
                DataDefinitionId = "0123456789",
                FundingStreamId = "DSG"
            };

            _apiClient
                .CreateNewDataset(Arg.Any<CreateNewDatasetModel>())
                .Returns(response);

            // Act
            IActionResult result = await _controller.CreateNewDataset(viewModel);

            // Assert
            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task SaveDataset_GivenResponseIsInternalServerError_ReturnsInternalServerErrorResult()
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

            _apiClient
                .CreateNewDataset(Arg.Any<CreateNewDatasetModel>())
                .Returns(response);

            // Act
            IActionResult result = await _controller.CreateNewDataset(viewModel);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>();
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

            _apiClient
                .CreateNewDataset(Arg.Any<CreateNewDatasetModel>())
                .Returns(response);

            // Act
            IActionResult result = await _controller.CreateNewDataset(viewModel);

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
        public async Task DownloadConverterWizardReportFile_GivenResponseIsSuccess_ReturnsSuccess()
        {
            // Arrange
            string specificationId = "123";
            DatasetDownloadModel responseModel = new DatasetDownloadModel
            {
                Url = "dataset-converter-wizard-report-url"
            };

            ApiResponse<DatasetDownloadModel> response = new ApiResponse<DatasetDownloadModel>(HttpStatusCode.OK, responseModel);

            _apiClient
                .DownloadConverterWizardReportFile(specificationId)
                .Returns(response);

            // Act
            IActionResult result = await _controller.DownloadConverterWizardReportFile(specificationId);

            // Assert
            result
                .Should()
                .BeOfType<RedirectResult>()
                .Subject
                .Url
                .Should()
                .Be(responseModel.Url);
        }

        [TestMethod]
        public void ValidateDataset_GivenViewModelIsNull_ThrowsArgumentNullException()
        {
            // Act
            Func<Task> test = async () => await _controller.ValidateDataset(null);

            // Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }
        
        [TestMethod]
        public async Task ValidateDataset_GivenNoUploadDatasetFilePermission_ReturnsForbidden()
        {
            // Act
            ForbidResult forbidResult = await _controller.ValidateDataset(new ValidateDatasetModel()) as ForbidResult;

            // Assert
            forbidResult
                .Should()
                .NotBeNull();
        }

        [TestMethod]
        public async Task ValidateDataset_GivenViewModelButResponseIsBadRequest_ReturnsBadRequestObjectResult()
        {
            string fundingStreamId = Guid.NewGuid().ToString();
            
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel
            {
                FundingStreamId = fundingStreamId
            };

            GivenTheUserHasPermissionToUploadDataSourceFilesForFundingStream(fundingStreamId, new FundingStreamPermission
            {
                CanUploadDataSourceFiles = true
            });

            ValidatedApiResponse<DatasetValidationStatusModel> response = new ValidatedApiResponse<DatasetValidationStatusModel>(HttpStatusCode.BadRequest)
            {
                ModelState = new Dictionary<string, IEnumerable<string>>()
            };

            _apiClient
                .ValidateDataset(Arg.Any<GetDatasetBlobModel>())
                .Returns(response);

            // Act
            IActionResult result = await _controller.ValidateDataset(viewModel);

            // Assert
            result
                .Should()
                .BeOfType<BadRequestObjectResult>();

            _logger
                .Received(1)
                .Warning(Arg.Is("Failed to validate dataset with status code: {statusCode}"), Arg.Is(HttpStatusCode.BadRequest));
        }

        [TestMethod]
        public async Task ValidateDataset_GivenViewModelButResponseIsBadRequestAndHasModelState_ReturnsBadRequestObjectResult()
        {
            string fundingStreamId = Guid.NewGuid().ToString();
            
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel
            {
                FundingStreamId = fundingStreamId
            };

            GivenTheUserHasPermissionToUploadDataSourceFilesForFundingStream(fundingStreamId, new FundingStreamPermission
            {
                CanUploadDataSourceFiles = true
            });

            IDictionary<string, IEnumerable<string>> modelState = new Dictionary<string, IEnumerable<string>>();
            modelState.Add("error",
                new List<string>
                {
                    "an error occured"
                });

            ValidatedApiResponse<DatasetValidationStatusModel> response = new ValidatedApiResponse<DatasetValidationStatusModel>(HttpStatusCode.BadRequest)
            {
                ModelState = modelState
            };

            _apiClient
                .ValidateDataset(Arg.Any<GetDatasetBlobModel>())
                .Returns(response);

            // Act
            IActionResult result = await _controller.ValidateDataset(viewModel);

            // Assert
            result
                .Should()
                .BeOfType<BadRequestObjectResult>();

            _logger
                .Received(1)
                .Warning(Arg.Is("Failed to validate dataset with status code: {statusCode}"), Arg.Is(HttpStatusCode.BadRequest));
        }

        [TestMethod]
        public async Task ValidateDataset_GivenViewModelAndResponseIsSuccess_ReturnsStatusModel()
        {
            string fundingStreamId = Guid.NewGuid().ToString();
            
            // Arrange
            ValidateDatasetModel viewModel = new ValidateDatasetModel
            {
                FundingStreamId = fundingStreamId
            };

            GivenTheUserHasPermissionToUploadDataSourceFilesForFundingStream(fundingStreamId, new FundingStreamPermission
            {
                CanUploadDataSourceFiles = true
            });

            DatasetValidationStatusModel statusModel = new DatasetValidationStatusModel
            {
                ValidationFailures = new Dictionary<string, IEnumerable<string>>(),
                CurrentOperation = DatasetValidationStatus.Processing,
                DatasetId = "datasetId",
                ErrorMessage = "errorMessage",
                OperationId = "operationId"
            };

            ValidatedApiResponse<DatasetValidationStatusModel> response = new ValidatedApiResponse<DatasetValidationStatusModel>(HttpStatusCode.OK, statusModel);

            DatasetValidationStatusViewModel resultViewModel = new DatasetValidationStatusViewModel
            {
                ValidationFailures = new Dictionary<string, IEnumerable<string>>(),
                CurrentOperation = DatasetValidationStatusOperationViewModel.Processing,
                DatasetId = "datasetId",
                ErrorMessage = "errorMessage",
                OperationId = "operationId"
            };

            _apiClient
                .ValidateDataset(Arg.Any<GetDatasetBlobModel>())
                .Returns(response);

            // Act
            IActionResult result = await _controller.ValidateDataset(viewModel);

            // Assert
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Which
                .Value
                .Should()
                .BeEquivalentTo(resultViewModel);
        }

        [TestMethod]
        public void ValidateDefinitionSpecificationRelationship_GivenNameIsNull_ThrowsArgumentNullException()
        {
            //Arrange
            ValidateDefinitionSpecificationRelationshipModel model = new ValidateDefinitionSpecificationRelationshipModel() { Name = "Somthing" };

            // Act
            Func<Task> func =
                async () => await _controller.ValidateDefinitionSpecificationRelationship(model);

            // Assert
            func
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public void ValidateDefinitionSpecificationRelationship_GivenSpecificationIdIsNull_ThrowsArgumentNullException()
        {
            //Arrange
            ValidateDefinitionSpecificationRelationshipModel model = new ValidateDefinitionSpecificationRelationshipModel() { Name = "Somthing" };


            // Act
            Func<Task> func =
                async () => await _controller.ValidateDefinitionSpecificationRelationship(model);

            // Assert
            func
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task ValidateDefinitionSpecificationRelationship_GivenValidModel_ReturnsSuccessful()
        {
            //Arrange
            ValidateDefinitionSpecificationRelationshipModel model = new ValidateDefinitionSpecificationRelationshipModel() 
            { 
                Name = "Somthing" ,
                SpecificationId = "sp-1",
                TargetSpecificationId = "sp-2"
            };


            _apiClient.ValidateDefinitionSpecificationRelationship(Arg.Is<ValidateDefinitionSpecificationRelationshipModel>(x => x.Name == model.Name))
                .Returns(new NoValidatedContentApiResponse(HttpStatusCode.OK));

            // Act
            IActionResult result = await _controller.ValidateDefinitionSpecificationRelationship(model);

            // Assert
            result
               .Should()
               .BeOfType<StatusCodeResult>()
               .Which
               .StatusCode
               .Should()
               .Be((int)HttpStatusCode.OK);
        }

        [TestMethod]
        public async Task UpdateDefinitionSpecificationRelationship_GivenBadRequestFromApi_ReturnsBadRequest()
        {
            ValidatedApiResponse<DefinitionSpecificationRelationshipVersion> response = new ValidatedApiResponse<DefinitionSpecificationRelationshipVersion>(HttpStatusCode.BadRequest);
            string specificationId = "specificationId";
            string relationshipId = "relationshipId";

            _apiClient
                .UpdateDefinitionSpecificationRelationship(Arg.Any<UpdateDefinitionSpecificationRelationshipModel>(),
                    Arg.Any<string>(), Arg.Any<string>())
                .Returns(response);

            IActionResult result = await _controller.UpdateDefinitionSpecificationRelationship(
                specificationId, relationshipId, new UpdateDefinitionSpecificationRelationshipModel());

            result
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public void UpdateDefinitionSpecificationRelationship_GivenSpecificationIdIsNull_ThrowsArgumentNullException()
        {
            UpdateDefinitionSpecificationRelationshipModel model = new UpdateDefinitionSpecificationRelationshipModel();

            Func<Task> func =
                async () => await _controller.UpdateDefinitionSpecificationRelationship(null, "relationshipId", model);

            func
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public void UpdateDefinitionSpecificationRelationship_GivenRelationshipIdIsNull_ThrowsArgumentNullException()
        {
            UpdateDefinitionSpecificationRelationshipModel model = new UpdateDefinitionSpecificationRelationshipModel();

            Func<Task> func =
                async () => await _controller.UpdateDefinitionSpecificationRelationship("specificationId", null, model);

            func
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task GetAvailableFundingLinesCalculations_GivenBadRequestFromApi_ReturnsBadRequest()
        {
            ValidatedApiResponse<PublishedSpecificationConfiguration> response = new ValidatedApiResponse<PublishedSpecificationConfiguration>(HttpStatusCode.BadRequest);
            string relationshipId = "relationshipId";

            _apiClient
                .GetFundingLinesCalculations(Arg.Any<string>())
                .Returns(response);

            IActionResult result = await _controller.GetFundingLinesCalculationsForRelationship(relationshipId);

            result
                .Should()
                .BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public void GetAvailableFundingLinesCalculations_GivenRelationshipIdIsNull_ThrowsArgumentNullException()
        {
            Func<Task> func =
                async () => await _controller.GetFundingLinesCalculationsForRelationship(null);

            func
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        private DatasetController CreateController(IDatasetsApiClient apiClient,
            ILogger logger)
            => new DatasetController(apiClient,
                logger,
               MappingHelper.CreateFrontEndMapper(),
                _specifications.Object,
                _authorisationHelper.Object);

        private void GivenTheUserHasPermissionToUploadDataSourceFilesForFundingStream(string fundingSteamId,
            FundingStreamPermission fundingStreamPermission)
            => _authorisationHelper
                .Setup(_ => _.GetUserFundingStreamPermissions(It.IsAny<ClaimsPrincipal>(), fundingSteamId))
                .ReturnsAsync(fundingStreamPermission);
    }
}