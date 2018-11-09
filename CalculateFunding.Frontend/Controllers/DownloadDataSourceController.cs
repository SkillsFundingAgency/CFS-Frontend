namespace CalculateFunding.Frontend.Controllers
{
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc;
    using Serilog;

    public class DownloadDatasourceController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;
        private readonly ILogger _logger;

        public DownloadDatasourceController(IDatasetsApiClient datasetApiClient, ILogger logger)
        {
            _datasetApiClient = datasetApiClient;
            _logger = logger;
        }

        [HttpGet]
        [Route("api/datasets/download-dataset-file/{datasetid}")]
        public async Task<IActionResult> Download(string datasetId)
        {
            Guard.ArgumentNotNull(datasetId, nameof(datasetId));

            // DATA SOURCE NAME_VERSION number_STATUS.xl

            ApiResponse<DownloadDatasourceModel> apiResponse = await _datasetApiClient.GetDatasourceDownload(datasetId);

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.Url))
            {
                return Redirect(apiResponse.Content.Url);
            }

            return new NotFoundResult();
        }
    }
}
