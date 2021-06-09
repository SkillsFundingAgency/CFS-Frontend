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
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Common.Models.Search;
using Microsoft.AspNetCore.Authentication;
using CalculateFunding.Common.ApiClient.Datasets.Models;

namespace CalculateFunding.Frontend.Controllers
{
    public class DatasetController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public DatasetController(IDatasetsApiClient datasetApiClient, ILogger logger, IMapper mapper,
            ISpecificationsApiClient specificationsApiClient, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _datasetApiClient = datasetApiClient;
            _logger = logger;
            _mapper = mapper;
            _specificationsApiClient = specificationsApiClient;
            _authorizationHelper = authorizationHelper;
        }

        [HttpPost]
        [Route("api/datasets")]
        public async Task<IActionResult> CreateNewDataset([FromBody] CreateDatasetViewModel vm)
        {
            Guard.IsNullOrWhiteSpace(vm.Name, nameof(vm.Name));
            Guard.IsNullOrWhiteSpace(vm.Description, nameof(vm.Description));
            Guard.IsNullOrWhiteSpace(vm.Filename, nameof(vm.Filename));
            Guard.IsNullOrWhiteSpace(vm.FundingStreamId, nameof(vm.FundingStreamId));
            Guard.IsNullOrWhiteSpace(vm.DataDefinitionId, nameof(vm.DataDefinitionId));

            ValidatedApiResponse<NewDatasetVersionResponseModel> response = await _datasetApiClient.CreateNewDataset(
                new CreateNewDatasetModel
                {
                    Name = vm.Name,
                    DefinitionId = vm.DataDefinitionId,
                    Description = vm.Description,
                    Filename = vm.Filename,
                    FundingStreamId = vm.FundingStreamId
                });

            return response.Handle(nameof(CreateNewDatasetModel),
                onSuccess: x => Ok(x.Content));
        }

        [HttpPut]
        [Route("api/datasets/toggleDatasetRelationship/{relationshipId}")]
        public async Task<IActionResult> ToggleDatasetRelationship([FromRoute] string relationshipId,
            [FromBody] bool converterEnabled)
        {
            HttpStatusCode statusCode = await _datasetApiClient.ToggleDatasetRelationship(relationshipId, converterEnabled);

            if (statusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(true);
            }

            return new StatusCodeResult(500);
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

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("DatasetVersionUpdate");
            if (errorResult != null)
            {
                return errorResult;
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
            
            FundingStreamPermission permissions = await _authorizationHelper.GetUserFundingStreamPermissions(User, vm.FundingStreamId);
            
            if (permissions?.CanUploadDataSourceFiles != true)
            {
                _logger.Error($"User [{User?.Identity?.Name}] has insufficient permissions to upload a dataset file for {vm.FundingStreamId}");
                return Forbid(new AuthenticationProperties());
            }

            ValidatedApiResponse<DatasetValidationStatusModel> apiResponse = await _datasetApiClient.ValidateDataset(
                new GetDatasetBlobModel
                {
                    DatasetId = vm.DatasetId,
                    Version = vm.Version,
                    Filename = vm.Filename,
                    Description = vm.Description,
                    Comment = vm.Comment,
                    FundingStreamId = vm.FundingStreamId,
                    MergeExistingVersion = vm.MergeExistingVersion,
                    EmptyFieldEvaluationOption = vm.EmptyFieldEvaluationOption
                });

            if (apiResponse == null)
            {
                _logger.Warning("Validate Dataset API response was null");
                return new InternalServerErrorResult("Validate Dataset API response was null");
            }

            if (!apiResponse.StatusCode.IsSuccess())
            {
                _logger.Warning("Failed to validate dataset with status code: {statusCode}", apiResponse.StatusCode);

                if (apiResponse.IsBadRequest(out BadRequestObjectResult badRequest))
                {
                    return badRequest;
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
            Guard.IsNullOrWhiteSpace(operationId, nameof(operationId));

            ApiResponse<DatasetValidationStatusModel> statusResponse =
                await _datasetApiClient.GetValidateDatasetStatus(operationId);

            IActionResult errorResult =
                statusResponse.IsSuccessOrReturnFailureResult("GetCalculationStatusCounts");
            if (errorResult != null)
            {
                return errorResult;
            }

            DatasetValidationStatusViewModel result =
                _mapper.Map<DatasetValidationStatusViewModel>(statusResponse.Content);

            return new OkObjectResult(result);
        }

        [HttpGet]
        [Route("api/datasets/getdatasetsbyspecificationid/{specificationId}")]
        public async Task<IActionResult> GetDatasetBySpecificationId(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

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
            ApiResponse<IEnumerable<DatasetDefinition>> response = await _datasetApiClient.GetDatasetDefinitions();

            IActionResult errorResult =
                response.IsSuccessOrReturnFailureResult("GetDatasetDefinitions");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
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
                specificationResponse.Content.GetSpecificationId(), SpecificationActionTypes.CanEditSpecification);

            if (!isAuthorizedToEdit)
            {
                return new ForbidResult();
            }

            if (!string.IsNullOrWhiteSpace(viewModel.Name))
            {
                ApiResponse<DefinitionSpecificationRelationship> existingRelationshipResponse =
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
                    UsedInDataAggregations = false,
                    ConverterEnabled = viewModel.ConverterEnabled
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

            ApiResponse<IEnumerable<DatasetDefinitionByFundingStream>> result =
                await _datasetApiClient.GetDatasetDefinitionsByFundingStreamId(fundingStreamId);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }

            return result.StatusCode == HttpStatusCode.BadRequest ? new BadRequestResult() : new StatusCodeResult(500);
        }

        [HttpGet]
        [Route("api/datasets/get-datasources-by-relationship-id/{relationshipId}")]
        public async Task<IActionResult> GetPreviousVersions(string relationshipId)
        {
            ApiResponse<SelectDatasourceModel> result =
                await _datasetApiClient.GetDataSourcesByRelationshipId(relationshipId);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }

            return new StatusCodeResult(Convert.ToInt32(result.StatusCode));
        }

        [HttpPost]
        [Route("api/datasets/assign-datasource-version-to-relationship/{specificationId}/{relationshipId}/{datasetVersionId}")]
        public async Task<IActionResult> AssignDatasourceVersionToRelationship([FromRoute]string relationshipId, [FromRoute]string specificationId,
            [FromRoute]string datasetVersionId)
        {
            Guard.IsNullOrWhiteSpace(relationshipId, nameof(relationshipId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(datasetVersionId, nameof(datasetVersionId));

            ApiResponse<SelectDatasourceModel> sourcesResponse =
                await _datasetApiClient.GetDataSourcesByRelationshipId(relationshipId);

            if (sourcesResponse.StatusCode != HttpStatusCode.OK || sourcesResponse.Content == null)
            {
                _logger.Error($"Failed to fetch data sources with status code {sourcesResponse.StatusCode.ToString()}");
                return NotFound();
            }

            bool isAuthorizedToMap = await _authorizationHelper.DoesUserHavePermission(User,
                sourcesResponse.Content.SpecificationId, SpecificationActionTypes.CanMapDatasets);
            if (!isAuthorizedToMap)
            {
                return new ForbidResult();
            }

            if (string.IsNullOrWhiteSpace(datasetVersionId))
            {
                SelectDataSourceViewModel viewModel = PopulateViewModel(sourcesResponse.Content);
                this.ModelState.AddModelError($"{nameof(SelectDataSourceViewModel)}.{nameof(datasetVersionId)}", "");
                if (viewModel == null)
                {
                    return new StatusCodeResult(500);
                }
            }

            string[] datasetVersionArray = datasetVersionId.Split("_");
            if (datasetVersionArray.Length != 2)
            {
                _logger.Error($"Dataset version: {datasetVersionId} is invalid");
                return new StatusCodeResult(500);
            }

            AssignDatasourceModel assignDatasetVersion = new AssignDatasourceModel
            {
                RelationshipId = relationshipId,
                DatasetId = datasetVersionArray[0],
                Version = Convert.ToInt32(datasetVersionArray[1])
            };

            ApiResponse<JobCreationResponse> result =
                await _datasetApiClient.AssignDatasourceVersionToRelationship(assignDatasetVersion);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }

            _logger.Error($"Failed to assign dataset version with status code: {result.StatusCode}");

            return new StatusCodeResult(500);
        }

        [HttpPost]
        [Route("api/datasets/expanded-datasources/{relationshipId}/{datasetId}")]
        public async Task<IActionResult> GetExpandedDataSourcesSearch(
            [FromRoute]string relationshipId,
            [FromRoute]string datasetId,
            [FromBody]SearchModel search)
        {
            ApiResponse<SelectDatasourceModel> result =
                await _datasetApiClient.GetDataSourcesByRelationshipId(relationshipId);

            DatasetVersions datasetVersions = result.Content.Datasets.SingleOrDefault(d => d.Id == datasetId);

            if (datasetVersions != null)
            {
                int totalPages = datasetVersions.Versions.Count() / search.Top;
                if (datasetVersions.Versions.Count() % search.Top > 0)
                {
                    totalPages++;
                }

                int startNumber = ((search.Top * search.PageNumber) - search.Top) + 1;
                int endNumber = (search.Top * search.PageNumber);
                if (endNumber > datasetVersions.Versions.Count())
                {
                    endNumber = datasetVersions.Versions.Count();
                }
                
                PagedDatasetSearchResults searchPagedResult = new PagedDatasetSearchResults
                {
                    Name = datasetVersions.Name,
                    Id = datasetVersions.Id,
                    Description = datasetVersions.Description,
                    Items = datasetVersions.Versions.Skip(startNumber - 1).Take(5),
                    TotalCount = datasetVersions.Versions.Count(),
                    PagerState = new PagerState(search.PageNumber, totalPages),
                    StartItemNumber = startNumber,
                    EndItemNumber = endNumber
                };

                return Ok(searchPagedResult);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
        }

        [HttpGet]
        [Route("/api/datasets/get-current-dataset-version-by-dataset-id/{datasetId}")]
        public async Task<IActionResult> GetCurrentDatasetVersionByDatasetId(string datasetId)
        {
            Guard.IsNullOrWhiteSpace(nameof(datasetId), datasetId);
            
            ApiResponse<DatasetVersionResponseViewModel> result = await _datasetApiClient.GetCurrentDatasetVersionByDatasetId(datasetId);

            if (result.StatusCode == HttpStatusCode.OK)
                return new OkObjectResult(result.Content);
            
            return new InternalServerErrorResult(result.StatusCode.ToString());
        }

        [HttpGet]
        [Route("api/datasets/download-validate-dataset-error-url/{jobId}")]
        public async Task<IActionResult> DownloadValidateDatasetValidationErrorSasUrl([FromRoute] string jobId)
        {
            Guard.IsNullOrWhiteSpace(jobId, nameof(jobId));

            DatasetValidationErrorRequestModel requestModel = new DatasetValidationErrorRequestModel
            {
                JobId = jobId
            };

            ApiResponse<DatasetValidationErrorSasUrlResponseModel> apiResponse = await _datasetApiClient.GetValidateDatasetValidationErrorSasUrl(requestModel);

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.ValidationErrorFileUrl))
            {
                return new OkObjectResult(apiResponse.Content.ValidationErrorFileUrl);
            }

            return new NotFoundResult();
        }

        [HttpGet]
        [Route("api/datasets/reports/{specificationId}/report-metadata")]
        public async Task<IActionResult> DownloadConverterWizardReportFile([FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<DatasetDownloadModel> apiResponse = await _datasetApiClient.DownloadConverterWizardReportFile(specificationId);

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.Url))
            {
                return Redirect(apiResponse.Content.Url);
            }

            return new NotFoundResult();
        }

        private SelectDataSourceViewModel PopulateViewModel(SelectDatasourceModel selectDatasourceModel)
        {
            SelectDataSourceViewModel viewModel = new SelectDataSourceViewModel
            {
                SpecificationId = selectDatasourceModel.SpecificationId,
                SpecificationName = selectDatasourceModel.SpecificationName,
                RelationshipId = selectDatasourceModel.RelationshipId,
                DefinitionId = selectDatasourceModel.DefinitionId,
                DefinitionName = selectDatasourceModel.DefinitionName,
                RelationshipName = selectDatasourceModel.RelationshipName
            };

            List<DatasetVersionsViewModel> datasets = new List<DatasetVersionsViewModel>();

            if (!selectDatasourceModel.Datasets.IsNullOrEmpty())
            {
                foreach (DatasetVersions datasetVersionModel in selectDatasourceModel.Datasets)
                {
                    datasets.Add(new DatasetVersionsViewModel
                    {
                        Id = datasetVersionModel.Id,
                        Name = datasetVersionModel.Name,
                        IsSelected = datasetVersionModel.SelectedVersion.HasValue,
                        Versions = datasetVersionModel.Versions.Select(m =>
                            new DatasetVersionItemViewModel(datasetVersionModel.Id, datasetVersionModel.Name, m.Version)
                            {
                                IsSelected = datasetVersionModel.SelectedVersion.HasValue &&
                                             datasetVersionModel.SelectedVersion.Value == m.Version
                            }).ToArraySafe()
                    });
                }
            }

            viewModel.Datasets = datasets;

            return viewModel;
        }
    }
}