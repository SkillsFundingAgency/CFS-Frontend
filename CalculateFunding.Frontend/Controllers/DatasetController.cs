namespace CalculateFunding.Frontend.Controllers
{
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;
    using Serilog;

    public class DatasetController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public DatasetController(IDatasetsApiClient datasetApiClient, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _datasetApiClient = datasetApiClient;
            _logger = logger;
            _mapper = mapper;
        }

        [HttpPost]
        [Route("api/datasets")]
        async public Task<IActionResult> SaveDataset([FromBody]CreateDatasetViewModel vm)
        {
            Guard.ArgumentNotNull(vm, nameof(vm));

            ValidatedApiResponse<NewDatasetVersionResponseModel> response = await _datasetApiClient.CreateDataset(new CreateNewDatasetModel
            {
                Name = vm.Name,
                DefinitionId = vm.DataDefinitionId,
                Description = vm.Description,
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
                    int statusCode = (int)response.StatusCode;

                    _logger.Error($"Error when posting data set with status code: {statusCode}");

                    return new StatusCodeResult(statusCode);
                }
            }

            return new OkObjectResult(response.Content);
        }

        [HttpPut]
        [Route("api/datasets/{datasetId}")]
        async public Task<IActionResult> UpdateDatasetVersion([FromRoute] string datasetId, [FromBody]DatasetUpdateViewModel vm)
        {
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<NewDatasetVersionResponseModel> response = await _datasetApiClient.UpdateDatasetVersion(new DatasetVersionUpdateModel
            {
                DatasetId = datasetId,
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
                    int statusCode = (int)response.StatusCode;

                    _logger.Error("Error when posting data set with status code: {statusCode}", statusCode);

                    return new InternalServerErrorResult($"Error when posting data set with status code: {statusCode}");
                }
            }

            return new OkObjectResult(response.Content);
        }

        [HttpPost]
        [Route("api/datasets/validate-dataset")]
        async public Task<IActionResult> ValidateDataset([FromBody]ValidateDatasetModel vm)
        {
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<DatasetValidationStatusModel> apiResponse = await _datasetApiClient.ValidateDataset(vm);

            if (apiResponse == null)
            {
                _logger.Warning("Validate Dataset API response was null");
                return new InternalServerErrorResult("Validate Dataset API response was null");
            }

            if (!apiResponse.StatusCode.IsSuccess())
            {
                _logger.Warning("Failed to validate dataset with status code: {statusCode}", apiResponse.StatusCode);

                if (apiResponse.StatusCode == HttpStatusCode.BadRequest && !apiResponse.ModelState.Values.IsNullOrEmpty())
                {
                    return new BadRequestObjectResult(apiResponse.ModelState);
                }

                return new InternalServerErrorResult("Validate Dataset API response failed with status code: {statusCode}" + apiResponse.StatusCode);
            }

            DatasetValidationStatusViewModel result = _mapper.Map<DatasetValidationStatusViewModel>(apiResponse.Content);

            return new OkObjectResult(result);
        }

        [HttpGet]
        [Route("api/dataset-validate-status/{operationId}")]
        public async Task<IActionResult> GetDatasetValidateStatus([FromRoute]string operationId)
        {
            if (string.IsNullOrWhiteSpace(operationId))
            {
                return new BadRequestObjectResult("Missing operationId");
            }

            ApiResponse<DatasetValidationStatusModel> statusResponse = await _datasetApiClient.GetDatasetValidateStatus(operationId);
            if (statusResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Validation status not found");
            }
            else if (statusResponse.StatusCode == HttpStatusCode.OK)
            {
                DatasetValidationStatusViewModel result = _mapper.Map<DatasetValidationStatusViewModel>(statusResponse.Content);
                return new OkObjectResult(result);
            }
            else
            {
                _logger.Error($"{nameof(GetDatasetValidateStatus)} returned unexpected HTTP status {statusResponse.StatusCode}");
                return new InternalServerErrorResult("Unable to query Validate Status");
            }
        }
    }
}
