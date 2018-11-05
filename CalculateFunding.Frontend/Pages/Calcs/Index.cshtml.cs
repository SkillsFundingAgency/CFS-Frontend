namespace CalculateFunding.Frontend.Pages.Calcs
{
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class IndexPageModel : PageModel
    {
        private ICalculationsApiClient _calculationsApiClient;
        private ICalculationSearchService _searchService;

        public IndexPageModel(ICalculationsApiClient calculationsApiClient, ICalculationSearchService searchService)
        {
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            Guard.ArgumentNotNull(searchService, nameof(searchService));

            _calculationsApiClient = calculationsApiClient;
            _searchService = searchService;
        }

        public CalculationSearchResultViewModel SearchResults { get; set; }

        public Calculation DraftSavedCalculation { get; set; }

        public Calculation PublishedCalculation { get; set; }

        [BindProperty]
        public string SearchTerm { get; set; }

        public async Task<IActionResult> OnGetAsync(int? pageNumber, string draftSavedId, string publishedId, string searchTerm)
        {
            if (!string.IsNullOrWhiteSpace(draftSavedId))
            {
                DraftSavedCalculation = (await this._calculationsApiClient.GetCalculationById(draftSavedId)).Content;
            }

            if (!string.IsNullOrWhiteSpace(publishedId))
            {
                PublishedCalculation = (await this._calculationsApiClient.GetCalculationById(publishedId)).Content;
            }

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