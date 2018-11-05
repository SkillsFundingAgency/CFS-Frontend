namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;

    public class DatasetRelationshipsSearchController : Controller
    {
        private IDatasetRelationshipsSearchService _searchService;

        public DatasetRelationshipsSearchController(IDatasetRelationshipsSearchService searchService)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));

            _searchService = searchService;
        }

        [HttpPost]
        [Route("api/datasetrelationships/search")]
        public async Task<IActionResult> SearchDatasetRelationships([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            SpecificationDatasourceRelationshipSearchResultViewModel result = await _searchService.PerformSearch(request);
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
