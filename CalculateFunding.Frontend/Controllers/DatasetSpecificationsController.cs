using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class DatasetSpecificationsController : Controller
    {
        private readonly IDatasetsApiClient _datasetApiClient;

        public DatasetSpecificationsController(IDatasetsApiClient datasetApiClient)
        {
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));

            _datasetApiClient = datasetApiClient;
        }

        [HttpGet]
        [Route("api/dataset-specifications/{specificationId}/eligible-specification-references")]
        public async Task<IActionResult> GetEligibleSpecificationsToReference(
            [FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IEnumerable<EligibleSpecificationReference>> response =
                await _datasetApiClient.GetEligibleSpecificationsToReference(specificationId);

            return response.Handle(nameof(EligibleSpecificationReference),
                onSuccess: x => Ok(x.Content));
        }

        [Route("api/dataset-specifications/{specificationId}/published-specification-template-metadata")]
        [HttpGet]
        public async Task<IActionResult> GetPublishedSpecificationTemplateMetadata(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IEnumerable<PublishedSpecificationTemplateMetadata>> apiResponse =
                await _datasetApiClient.GetPublishedSpecificationTemplateMetadata(specificationId);

            return apiResponse.Handle(nameof(PublishedSpecificationTemplateMetadata),
                onSuccess: x => Ok(x.Content));
        }
    }
}