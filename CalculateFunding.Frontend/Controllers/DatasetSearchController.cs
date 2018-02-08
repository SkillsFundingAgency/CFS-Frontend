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
        private IDatasetSearchService _calculationSearchService;

        public DatasetSearchController(IDatasetSearchService calculationSearchService)
        {
            Guard.ArgumentNotNull(calculationSearchService, nameof(calculationSearchService));
            _calculationSearchService = calculationSearchService;
        }

        [HttpPost]
        [Route("api/datasets/search")]
        public async Task<IActionResult> SearchDatasets([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            DatasetSearchResultViewModel result = await _calculationSearchService.PerformSearch(request);
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
