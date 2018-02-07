using System.Threading.Tasks;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class DatasetsIndexPageModel : PageModel
    {
        private IDatasetSearchService _searchService;

        [BindProperty]
        public string SearchTerm { get; set; }

        public DatasetSearchResultViewModel SearchResults { get; set; }

        public DatasetsIndexPageModel(IDatasetSearchService searchService)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));

            _searchService = searchService;
        }

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
                return new StatusCodeResult(500);
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
                return new StatusCodeResult(500);
            }

            return Page();
        }

    }
}