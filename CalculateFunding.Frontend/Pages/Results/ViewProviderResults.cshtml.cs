namespace CalculateFunding.Frontend.Pages.Results
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ViewProviderResultsPageModel : PageModel
    {
        private IProviderSearchService _providerSearchService;

        private IResultsApiClient _resultsApiClient;

        public ViewProviderResultsPageModel(IResultsApiClient resultsApiClient, IProviderSearchService searchService)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));

            _resultsApiClient = resultsApiClient;
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

            // ApiResponse<ProviderSearchResultViewModel> apiResponse = await GetProviderSearchResultsAsync(searchRequest);

            // ProviderResults = apiResponse.Content;
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

            // ApiResponse<ProviderSearchResultViewModel> apiResponse = await GetProviderSearchResultsAsync(searchRequest);

            // ProviderResults = apiResponse.Content;
            if (ProviderResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        public async Task<ApiResponse<ProviderSearchResultViewModel>> GetProviderSearchResultsAsync(SearchRequestViewModel searchRequest)
        {
            ProviderSearchResultItemViewModel r1 = new ProviderSearchResultItemViewModel
            {
                Id = "1",
                Name = "Kings Norton Girls School",
                Upin = "119621",
                Ukprn = "10033247",
                Urn = "136590",
                EstablishmentNumber = "351369590",
                ProviderType = "Academy",
                ProviderSubType = "Academy",
                LocalAuthority = "Birmingham",
                DateOpened = default(DateTime)
            };

            ProviderSearchResultItemViewModel r2 = new ProviderSearchResultItemViewModel
            {
                Id = "2",
                Name = "Cadbury Sixth Form College",
                Upin = "119621",
                Ukprn = "10033247",
                Urn = "136590",
                EstablishmentNumber = "351369590",
                ProviderType = "Academy",
                ProviderSubType = "Academy",
                LocalAuthority = "Birmingham",
                DateOpened = default(DateTime)
            };

            ProviderSearchResultViewModel searchResults = new ProviderSearchResultViewModel()
            {
                Providers = new List<ProviderSearchResultItemViewModel> { r1, r2 },
                CurrentPage = 1,
                EndItemNumber = 10,
                TotalResults = 10,
                StartItemNumber = 1,
            };

            return await Task.FromResult(new ApiResponse<ProviderSearchResultViewModel>(HttpStatusCode.OK, searchResults));
        }
    }
}