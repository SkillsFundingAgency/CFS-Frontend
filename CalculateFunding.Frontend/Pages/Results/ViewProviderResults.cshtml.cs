namespace CalculateFunding.Frontend.Pages.Results
{
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ViewProviderResultsPageModel : PageModel
    {
        private IProviderSearchService _providerSearchService;

        public ViewProviderResultsPageModel(IProviderSearchService searchService)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));

            _providerSearchService = searchService;
        }

        [BindProperty]
        public string SearchTerm { get; set; }

        public ProviderSearchResultViewModel ProviderResults { get; set; }

        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
            };

            SearchTerm = searchTerm;

            ProviderResults = await _providerSearchService.PerformSearch(searchRequest);

            if (ProviderResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? pageNumber, string searchTerm)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                SearchTerm = SearchTerm,
                IncludeFacets = true,
            };

            SearchTerm = searchTerm;

            ProviderResults = await _providerSearchService.PerformSearch(searchRequest);

            if (ProviderResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }
    }
}