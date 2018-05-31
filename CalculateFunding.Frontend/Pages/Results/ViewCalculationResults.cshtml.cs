namespace CalculateFunding.Frontend.Pages.Results
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ViewCalculationResultsModel : PageModel
    {
        private ICalculationSearchService _searchService;

        public ViewCalculationResultsModel(ICalculationSearchService searchService)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));
            _searchService = searchService;
        }

        public CalculationSearchResultViewModel SearchResults { get; set; }

        [BindProperty]
        public string SearchTerm { get; set; }

        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
            };

            SearchTerm = searchTerm;

            SearchResults = await _searchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new InternalServerErrorResult("Null results returned when searching calculations");
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? pageNumber)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                SearchTerm = SearchTerm,
                IncludeFacets = false,
            };

            SearchResults = await _searchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new InternalServerErrorResult("Null results returned when searching calculations");
            }

            return Page();
        }
    }
}