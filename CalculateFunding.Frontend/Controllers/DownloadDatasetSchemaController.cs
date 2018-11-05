using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class DownloadDatasetSchemaController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;

        public DownloadDatasetSchemaController(IDatasetsApiClient datasetApiClient)
        {
            _datasetApiClient = datasetApiClient;
        }

        [HttpGet]
        [Route("api/datasets/download-dataset-schema/{schemaName}")]
        public async Task<IActionResult> Download([FromRoute]string schemaName)
        {
            Guard.IsNullOrWhiteSpace(schemaName, nameof(schemaName));

            DownloadDatasetSchemaRequest downloadDatasetSchemaRequest = new DownloadDatasetSchemaRequest
            {
                DatasetDefinitionName = schemaName
            };

            ApiResponse<DownloadDatasetSchemaResponse> apiResponse = await _datasetApiClient.GetDatasetSchemaUrl(downloadDatasetSchemaRequest);

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.SchemaUrl))
            {
                return Redirect(apiResponse.Content.SchemaUrl);
            }

            return new NotFoundResult();
        }

    }
}
