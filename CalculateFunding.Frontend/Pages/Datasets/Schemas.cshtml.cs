using System.Threading.Tasks;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class SchemasPageModel : PageModel
    {
        private readonly IDatasetDefinitionSearchService _datasetDefinitionSearchService;

        public string SearchTerm { get; set; }

        public DatasetDefinitionSearchResultViewModel SearchResults { get; set; }

        public string InitialSearchResults { get; set; }

        public SchemasPageModel(IDatasetDefinitionSearchService datasetDefinitionSearchService)
        {
            Guard.ArgumentNotNull(datasetDefinitionSearchService, nameof(datasetDefinitionSearchService));

            _datasetDefinitionSearchService = datasetDefinitionSearchService;
        }

        public async Task<IActionResult> OnGetAsync([FromQuery]string searchTerm = null, [FromQuery] int? page = null)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = page ?? 1,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                PageSize = 50,
            };

            SearchTerm = searchTerm;

            SearchResults = await _datasetDefinitionSearchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new InternalServerErrorResult("Search results returned null from API call");
            }

            InitialSearchResults = JsonConvert.SerializeObject(SearchResults, Formatting.Indented, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
            });

            return Page();
        }
    }
}