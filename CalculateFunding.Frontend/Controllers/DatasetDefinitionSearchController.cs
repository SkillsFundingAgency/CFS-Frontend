namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;

    public class DatasetDefinitionSearchController : Controller
    {
        private IDatasetDefinitionSearchService _datasetDefinitionSearchService;

        public DatasetDefinitionSearchController(IDatasetDefinitionSearchService datasetDefinitionSearchService)
        {
            Guard.ArgumentNotNull(datasetDefinitionSearchService, nameof(datasetDefinitionSearchService));

            _datasetDefinitionSearchService = datasetDefinitionSearchService;
        }

        [HttpPost]
        [Route("api/dataset-definitions/search")]
        public async Task<IActionResult> SearchDatasetDefinitions([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            DatasetDefinitionSearchResultViewModel result = await _datasetDefinitionSearchService.PerformSearch(request);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
