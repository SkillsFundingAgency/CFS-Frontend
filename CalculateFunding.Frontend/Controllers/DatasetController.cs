using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Serilog;
using SearchMode = CalculateFunding.Common.Models.Search.SearchMode;

namespace CalculateFunding.Frontend.Controllers
{
    public class DatasetController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private IAuthorizationHelper _authorizationHelper;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public DatasetController(IDatasetsApiClient datasetApiClient, ILogger logger, IMapper mapper,
            ISpecificationsApiClient specificationsApiClient, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _datasetApiClient = datasetApiClient;
            _logger = logger;
            _mapper = mapper;
            _specificationsApiClient = specificationsApiClient;
            _authorizationHelper = authorizationHelper;
        }

        [HttpPost]
        [Route("api/datasets")]
        public async Task<IActionResult> SaveDataset([FromBody] CreateDatasetViewModel vm)
        {
            Guard.ArgumentNotNull(vm.Name, nameof(vm.Name));
            Guard.ArgumentNotNull(vm.Description, nameof(vm.Description));
            Guard.ArgumentNotNull(vm.Filename, nameof(vm.Filename));
            Guard.ArgumentNotNull(vm.FundingStreamId, nameof(vm.FundingStreamId));
            Guard.ArgumentNotNull(vm.DataDefinitionId, nameof(vm.DataDefinitionId));

            ValidatedApiResponse<NewDatasetVersionResponseModel> response = await _datasetApiClient.CreateNewDataset(
                new CreateNewDatasetModel
                {
                    Name = vm.Name,
                    DefinitionId = vm.DataDefinitionId,
                    Description = vm.Description,
                    Filename = vm.Filename,
                    FundingStreamId = vm.FundingStreamId
                });

            if (response.ModelState != null && response.ModelState.Keys.Any())
            {
                _logger.Warning("Invalid model provided");

                return new BadRequestObjectResult(response.ModelState);
            }
            else
            {
                if (!response.StatusCode.IsSuccess())
                {
                    int statusCode = (int) response.StatusCode;

                    _logger.Error($"Error when posting data set with status code: {statusCode}");

                    return new StatusCodeResult(statusCode);
                }
            }

            return new OkObjectResult(response.Content);
        }

        [HttpPut]
        [Route("api/datasets/{fundingStreamId}/{datasetId}")]
        public async Task<IActionResult> UpdateDatasetVersion([FromRoute] string fundingStreamId,
            [FromRoute] string datasetId,
            [FromBody] DatasetUpdateViewModel vm)
        {
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<NewDatasetVersionResponseModel> response =
                await _datasetApiClient.DatasetVersionUpdate(new DatasetVersionUpdateModel
                {
                    DatasetId = datasetId,
                    FundingStreamId = fundingStreamId,
                    Filename = vm.Filename
                });

            if (response.ModelState != null && response.ModelState.Keys.Any())
            {
                _logger.Warning("Invalid model provided");

                return new BadRequestObjectResult(response.ModelState);
            }
            else
            {
                if (!response.StatusCode.IsSuccess())
                {
                    int statusCode = (int) response.StatusCode;

                    _logger.Error("Error when posting data set with status code: {statusCode}", statusCode);

                    return new InternalServerErrorResult($"Error when posting data set with status code: {statusCode}");
                }
            }

            return new OkObjectResult(response.Content);
        }

        [HttpPost]
        [Route("api/datasets/validate-dataset")]
        public async Task<IActionResult> ValidateDataset([FromBody] ValidateDatasetModel vm)
        {
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<DatasetValidationStatusModel> apiResponse = await _datasetApiClient.ValidateDataset(
                new GetDatasetBlobModel
                {
                    DatasetId = vm.DatasetId,
                    Version = vm.Version,
                    Filename = vm.Filename,
                    Description = vm.Description,
                    Comment = vm.Comment,
                    FundingStreamId = vm.FundingStreamId
                });

            if (apiResponse == null)
            {
                _logger.Warning("Validate Dataset API response was null");
                return new InternalServerErrorResult("Validate Dataset API response was null");
            }

            if (!apiResponse.StatusCode.IsSuccess())
            {
                _logger.Warning("Failed to validate dataset with status code: {statusCode}", apiResponse.StatusCode);

                if (apiResponse.StatusCode == HttpStatusCode.BadRequest &&
                    !apiResponse.ModelState.Values.IsNullOrEmpty())
                {
                    return new BadRequestObjectResult(apiResponse.ModelState);
                }

                return new InternalServerErrorResult(
                    "Validate Dataset API response failed with status code: {statusCode}" + apiResponse.StatusCode);
            }

            DatasetValidationStatusViewModel
                result = _mapper.Map<DatasetValidationStatusViewModel>(apiResponse.Content);

            return new OkObjectResult(result);
        }

        [HttpGet]
        [Route("api/dataset-validate-status/{operationId}")]
        public async Task<IActionResult> GetDatasetValidateStatus([FromRoute] string operationId)
        {
            if (string.IsNullOrWhiteSpace(operationId))
            {
                return new BadRequestObjectResult("Missing operationId");
            }

            ApiResponse<DatasetValidationStatusModel> statusResponse =
                await _datasetApiClient.GetValidateDatasetStatus(operationId);
            if (statusResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Validation status not found");
            }
            else if (statusResponse.StatusCode == HttpStatusCode.OK)
            {
                DatasetValidationStatusViewModel result =
                    _mapper.Map<DatasetValidationStatusViewModel>(statusResponse.Content);
                return new OkObjectResult(result);
            }
            else
            {
                _logger.Error(
                    $"{nameof(GetDatasetValidateStatus)} returned unexpected HTTP status {statusResponse.StatusCode}");
                return new InternalServerErrorResult("Unable to query Validate Status");
            }
        }

        [HttpGet]
        [Route("api/datasets/getdatasetsbyspecificationid/{specificationId}")]
        public async Task<IActionResult> GetDatasetBySpecificationId(string specificationId)
        {
            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> result =
                await _datasetApiClient.GetRelationshipsBySpecificationId(specificationId);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result);
            }

            if (result.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound();
            }

            return BadRequest();
        }

        [HttpGet]
        [Route("api/datasets/get-dataset-definitions/")]
        public async Task<IActionResult> GetDatasetDefinitions()
        {
            var result = await _datasetApiClient.GetDatasetDefinitions();

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }

            return BadRequest(result.StatusCode);
        }

        [HttpPut]
        [Route("api/datasets/assignDatasetSchema/{specificationId}")]
        public async Task<IActionResult> AssignDatasetSchema([FromBody] AssignDatasetSchemaUpdateViewModel viewModel,
            [FromRoute] string specificationId)
        {
            Guard.ArgumentNotNull(viewModel.Name, nameof(viewModel.Name));
            Guard.ArgumentNotNull(viewModel.DatasetDefinitionId, nameof(viewModel.DatasetDefinitionId));
            Guard.ArgumentNotNull(viewModel.Description, nameof(viewModel.Description));

            ApiResponse<SpecificationSummary> specificationResponse =
                await _specificationsApiClient.GetSpecificationSummaryById(specificationId);
            if (specificationResponse == null || specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult(
                    $"Unable to get specification response. Specification Id value = {specificationId}");
            }

            if (specificationResponse.StatusCode == HttpStatusCode.OK && specificationResponse.Content == null)
            {
                throw new InvalidOperationException(
                    $"Unable to retrieve specification model from the response. Specification Id value = {specificationId}");
            }

            bool isAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User,
                specificationResponse.Content, SpecificationActionTypes.CanEditSpecification);

            if (!isAuthorizedToEdit)
            {
                return new ForbidResult();
            }

            if (!string.IsNullOrWhiteSpace(viewModel.Name))
            {
                ApiResponse<IEnumerable<DefinitionSpecificationRelationship>> existingRelationshipResponse =
                    await _datasetApiClient.GetRelationshipBySpecificationIdAndName(specificationId, viewModel.Name);

                if (existingRelationshipResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError(
                        $"{nameof(AssignDatasetSchemaViewModel)}.{nameof(AssignDatasetSchemaViewModel.Name)}",
                        ValidationMessages.RelationshipNameAlreadyExists);
                }
            }

            if (!ModelState.IsValid)
            {
                if (specificationResponse.StatusCode == HttpStatusCode.OK)
                {
                    SpecificationSummary specContent = specificationResponse.Content;

                    ApiResponse<IEnumerable<DatasetDefinition>> datasetResponse =
                        await _datasetApiClient.GetDatasetDefinitions();

                    if (datasetResponse == null || datasetResponse.StatusCode == HttpStatusCode.NotFound)
                    {
                        return new NotFoundObjectResult(ErrorMessages.DatasetDefinitionNotFoundInDatasetService);
                    }

                    if (datasetResponse.StatusCode == HttpStatusCode.OK)
                    {
                        IEnumerable<DatasetDefinition> datasetDefinitionList = datasetResponse.Content;

                        if (datasetDefinitionList == null)
                        {
                            throw new InvalidOperationException(
                                $"Unable to retrieve Dataset definition from the response. Specification Id value = {specificationId}");
                        }
                    }
                    else
                    {
                        return new StatusCodeResult(500);
                    }
                }
            }

            CreateDefinitionSpecificationRelationshipModel datasetSchema =
                new CreateDefinitionSpecificationRelationshipModel
                {
                    Name = viewModel.Name,
                    SpecificationId = specificationId,
                    DatasetDefinitionId = viewModel.DatasetDefinitionId,
                    Description = viewModel.Description,
                    IsSetAsProviderData = viewModel.IsSetAsProviderData,
                    UsedInDataAggregations = false
                };

            ApiResponse<DefinitionSpecificationRelationship> newAssignDatasetResponse =
                await _datasetApiClient.CreateRelationship(datasetSchema);

            if (newAssignDatasetResponse?.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(true);
            }

            return new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/datasets/get-datasets-for-fundingstream/{fundingStreamId}")]
        public async Task<IActionResult> GetDatasetsForFundingStream(string fundingStreamId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            
            ApiResponse<IEnumerable<DatasetDefinationByFundingStream>> result =
                await _datasetApiClient.GetDatasetDefinitionsByFundingStreamId(fundingStreamId);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }

            return result.StatusCode == HttpStatusCode.BadRequest ? new BadRequestResult() : new StatusCodeResult(500);
        }
    }
}