using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
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
        [Route("api/datasets/download-dataset-schema/{schemaId}")]
        public async Task<IActionResult> Download([FromRoute]string schemaId)
        {
            Guard.IsNullOrWhiteSpace(schemaId, nameof(schemaId));

            DatasetSchemaSasUrlRequestModel downloadDatasetSchemaRequest = new DatasetSchemaSasUrlRequestModel
            {
                DatasetDefinitionId = schemaId
            };

            ApiResponse<DatasetSchemaSasUrlResponseModel> apiResponse = await _datasetApiClient.GetDatasetSchemaSasUrl(downloadDatasetSchemaRequest);

            if (apiResponse.StatusCode == HttpStatusCode.OK && !string.IsNullOrWhiteSpace(apiResponse.Content?.SchemaUrl))
            {
                return Redirect(apiResponse.Content.SchemaUrl);
            }

            return new NotFoundResult();
        }

    }
}
