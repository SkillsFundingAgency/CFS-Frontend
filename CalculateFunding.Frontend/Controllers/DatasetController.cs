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

            ValidatedApiResponse<CreateNewDatasetResponseModel> response = await _datasetApiClient.PostDataset(new CreateNewDatasetModel
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

        [HttpPost]
        [Route("api/datasets/validate-dataset")]
        async public Task<IActionResult> ValidateDataset([FromBody]ValidateDatasetModel vm)
        {
            Guard.ArgumentNotNull(vm, nameof(vm));

            ApiResponse<ValidateDatasetResponseModel> apiResponse = await _datasetApiClient.ValidateDataset(vm);

            if (!apiResponse.StatusCode.IsSuccess())
            {
                _logger.Error($"Failed to validate dataset with status code: {(int)apiResponse.StatusCode}");
                

                return new StatusCodeResult((int)apiResponse.StatusCode);
            }

            if (apiResponse.StatusCode == HttpStatusCode.OK && apiResponse.Content != null)
                return new OkObjectResult(apiResponse.Content);

            return new NoContentResult();
        }
    }
}
