using System.Collections.Generic;
using System.Linq;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
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
        public async Task<IActionResult> SearchDatasets([FromBody]DatasetSearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));
            
            SearchRequestViewModel searchRequest = new SearchRequestViewModel
            {
                Filters = new Dictionary<string, string[]>(),
                ErrorToggle = request.ErrorToggle,
                FacetCount = request.FacetCount,
                IncludeFacets = request.IncludeFacets,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                SearchMode = request.SearchMode,
                SearchTerm = request.SearchTerm
            };

            if (request.FundingStreams?.Length > 0)
            {
                searchRequest.Filters.Add("fundingStreamName", request.FundingStreams.ToArray());
            }
            
            if (request.DataSchemas?.Length > 0)
            {
                searchRequest.Filters.Add("definitionName", request.DataSchemas.ToArray());
            }
            
            DatasetSearchResultViewModel result = await _datasetSearchService.PerformSearch(searchRequest);
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
        [Route("api/datasets/getdatasetversions/{datasetId}")]
        public async Task<IActionResult> GetDatasetVersions(string datasetId, [FromQuery]int pageNumber, [FromQuery]int pageSize)
        {
            Guard.IsNullOrWhiteSpace(datasetId, nameof(datasetId));

            Dictionary<string, string[]> datasetIdFilter = new Dictionary<string, string[]>
                {{"datasetId", new[] {datasetId}}};

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Filters = datasetIdFilter,
                IncludeFacets = true
            };

            DatasetVersionSearchResultViewModel searchResult =
                await _datasetSearchService.PerformSearchDatasetVersion(searchRequest);
            
            if (searchResult != null)
            {
                return new OkObjectResult(searchResult);
            }
            else
            {
                return new InternalServerErrorResult(
                    "There was an error retrieving data sources from the Search Version Index.");
            }
        }
    }
}
