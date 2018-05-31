namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;

    public class IndexModel : PageModel
    {
        private readonly ISpecificationSearchService _searchService;

        public IndexModel(ISpecificationSearchService specsSearchService)
        {
            Guard.ArgumentNotNull(specsSearchService, nameof(specsSearchService));

            _searchService = specsSearchService;
        }

        public string SearchTerm { get; set; }

        public SpecificationSearchResultViewModel SearchResults { get; set; }

        public string InitialSearchResults { get; set; }

        public async Task<IActionResult> OnGetAsync(string searchTerm, int? pageNumber)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber ?? 1,
                IncludeFacets = true,
                SearchTerm = searchTerm,
            };

            SearchTerm = searchTerm;

            SearchResults = await _searchService.PerformSearch(searchRequest);

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
