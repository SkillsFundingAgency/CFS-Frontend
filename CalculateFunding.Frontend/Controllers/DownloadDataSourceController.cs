using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace CalculateFunding.Frontend.Controllers
{
    public class DownloadDatasourceController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;
        private readonly ILogger _logger;

        public DownloadDatasourceController(IDatasetsApiClient datasetApiClient, ILogger logger)
        {
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _datasetApiClient = datasetApiClient;
            _logger = logger;
        }

        [HttpGet]
        [Route("api/datasets/download-dataset-file/{datasetid}/{datasetVersion?}")]
        public async Task<IActionResult> DownloadDatasetFile(string datasetId, int? datasetVersion = null)
        {
            Guard.ArgumentNotNull(datasetId, nameof(datasetId));

            // DATA SOURCE NAME_VERSION number_STATUS.xl

            ApiResponse<DatasetDownloadModel> apiResponse = await _datasetApiClient.DownloadDatasetFile(datasetId, datasetVersion?.ToString());

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.Url))
            {
                return Redirect(apiResponse.Content.Url);
            }

            return new NotFoundResult();
        }
        
        [HttpGet]
        [Route("api/datasets/download-merge-file/{datasetid}/{datasetVersion?}")]
        public async Task<IActionResult> DownloadMergeFile(string datasetId, int? datasetVersion = null)
        {
            Guard.ArgumentNotNull(datasetId, nameof(datasetId));

            // DATA SOURCE NAME_VERSION number_STATUS.xl

            ApiResponse<DatasetDownloadModel> apiResponse = await _datasetApiClient.DownloadDatasetMergeFile(datasetId, datasetVersion?.ToString());

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.Url))
            {
                return Redirect(apiResponse.Content.Url);
            }

            return new NotFoundResult();
        }
    }
}
