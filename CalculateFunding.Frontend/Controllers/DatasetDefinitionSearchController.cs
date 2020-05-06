

namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.Utility;
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
        public async Task<IActionResult> SearchDatasetDefinitions(SearchRequestViewModel request)
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

        [HttpGet]
        [Route("api/dataset-definitions/search")]
        public async Task<IActionResult> SearchDatasetDefinitions(int pageNumber, bool includeFacets, int pageSize, string searchTerm = "")
        {
            Guard.ArgumentNotNull(pageNumber, nameof(pageNumber));
            Guard.ArgumentNotNull(pageSize, nameof(pageSize));

            var request = new SearchRequestViewModel
            {
                PageNumber = pageNumber,
                IncludeFacets = includeFacets,
                SearchTerm = searchTerm,
                PageSize = pageSize,
                SearchMode = SearchMode.All
            };
            
            
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
