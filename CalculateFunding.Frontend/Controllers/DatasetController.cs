namespace CalculateFunding.Frontend.Controllers
{
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
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

        public DatasetController(IDatasetsApiClient datasetApiClient, ILogger logger)
        {
            _datasetApiClient = datasetApiClient;
            _logger = logger;
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

            ValidatedApiResponse<ValidateDatasetResponseModel> apiResponse = await _datasetApiClient.ValidateDataset(vm);

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

                return new InternalServerErrorResult(apiResponse.Content?.Message);
            }

            if (apiResponse.StatusCode == HttpStatusCode.OK && apiResponse.Content != null)
            {
                return Ok(apiResponse.Content);
            }

            return new NoContentResult();
        }
    }
}
