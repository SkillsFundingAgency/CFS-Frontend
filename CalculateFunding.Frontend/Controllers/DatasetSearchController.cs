namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;

    public class DatasetSearchController : Controller
    {
        private IDatasetSearchService _datasetSearchService;

        public DatasetSearchController(IDatasetSearchService datasetSearchService)
        {
            Guard.ArgumentNotNull(datasetSearchService, nameof(datasetSearchService));

            _datasetSearchService = datasetSearchService;
        }

        [HttpPost]
        [Route("api/datasets/search")]
        public async Task<IActionResult> SearchDatasets([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            DatasetSearchResultViewModel result = await _datasetSearchService.PerformSearch(request);
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
