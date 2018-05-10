namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;

    public class DatasetRelationshipsPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetRelationshipsSearchService _datasetRelationshipsSearchService;

        public DatasetRelationshipsPageModel(ISpecsApiClient specsClient, IDatasetRelationshipsSearchService datasetRelationshipsSearchService)
        {
            _specsClient = specsClient;
            _datasetRelationshipsSearchService = datasetRelationshipsSearchService;
        }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        [BindProperty]
        public string FundingPeriodId { get; set; }

        [BindProperty]
        public string SearchTerm { get; set; }

        public SpecificationDatasourceRelationshipSearchResultViewModel SearchResults { get; set; }

        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, string fundingPeriodId = null)
        {
            await PopulatePeriods(fundingPeriodId);

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriods.First().Value;
            }

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                Filters = new Dictionary<string, string[]> { { "periodId", new[] { fundingPeriodId } } }
            };

            SearchTerm = searchTerm;

            SearchResults = await _datasetRelationshipsSearchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? pageNumber)
        {
            await PopulatePeriods();

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                SearchTerm = SearchTerm,
                IncludeFacets = false,
                Filters = new Dictionary<string, string[]> { { "periodId", new[] { FundingPeriodId } } }
            };

            SearchResults = await _datasetRelationshipsSearchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        private async Task PopulatePeriods(string fundingPeriodId = null)
        {
            var periodsResponse = await _specsClient.GetFundingPeriods();
            var fundingPeriods = periodsResponse.Content;

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriodId;
            }

            FundingPeriods = fundingPeriods.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = m.Id == fundingPeriodId
            }).ToList();
        }
    }
}