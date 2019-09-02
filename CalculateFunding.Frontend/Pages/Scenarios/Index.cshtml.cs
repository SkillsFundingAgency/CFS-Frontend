namespace CalculateFunding.Frontend.Pages.Scenarios
{
    // using Serilog;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using PolicyModels = Common.ApiClient.Policies.Models;

    public class IndexModel : PageModel
    {
        private readonly IScenarioSearchService _scenarioSearchservice;

        private readonly ISpecsApiClient _specsClient;

        private readonly IPoliciesApiClient _policiesApiClient;

        public IndexModel(ISpecsApiClient specsClient, IPoliciesApiClient policiesApiClient, IScenarioSearchService scenariosSearchService)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(scenariosSearchService, nameof(scenariosSearchService));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));

            _specsClient = specsClient;
            _scenarioSearchservice = scenariosSearchService;
            _policiesApiClient = policiesApiClient;
        }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        [BindProperty]
        public string SearchTerm { get; set; }

        [BindProperty]
        public string FundingPeriodId { get; set; }

        [BindProperty]
        public IEnumerable<SelectListItem> Specifications { get; set; }

        public ScenarioSearchResultViewModel ScenarioResults { get; set; }

        //public async Task<IActionResult> OnGet(int? pageNumber, string searchTerm)
        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, string fundingPeriodId = null, string specificationId = null)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                Filters = new Dictionary<string, string[]> { { "fundingPeriodId", new[] { fundingPeriodId } } }
            };

            SearchTerm = searchTerm;

            await PopulateFundingPeriods();

            ScenarioResults = await _scenarioSearchservice.PerformSearch(searchRequest);

            if (ScenarioResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        async Task PopulateAsync(string fundingPeriodId, string specificationId)
        {
            await PopulateFundingPeriods(fundingPeriodId);

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriods.First().Value;
            }

            FundingPeriodId = fundingPeriodId;

            await PopulateSpecifications(fundingPeriodId);
        }


        private async Task PopulateFundingPeriods(string fundingPeriodId = null)
        {
            ApiResponse<IEnumerable<PolicyModels.FundingPeriod>> periodsResponse = await _policiesApiClient.GetFundingPeriods();

            if (periodsResponse.StatusCode.Equals(HttpStatusCode.OK) && periodsResponse.Content != null)
            {
                IEnumerable<Reference> fundingPeriods = periodsResponse.Content;

                Reference fundingPeriod = fundingPeriods.FirstOrDefault();

                if (fundingPeriod != null)
                {
                    FundingPeriodId = fundingPeriod.Id;
                }
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive funding period information: Status Code = {periodsResponse.StatusCode}");

            }
        }

        public async Task PopulateSpecifications(string fundingPeriodId)
        {
            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specsClient.GetSpecifications(fundingPeriodId);

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Specification information: Status Code = {apiResponse.StatusCode}");
            }

            IEnumerable<SpecificationSummary> specifications = apiResponse.Content.Where(m => m.FundingPeriod.Id == fundingPeriodId);

            Specifications = specifications.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name
            }).ToList();
        }

        private ScenarioSearchResultViewModel GetSearchResults()
        {
            ScenarioSearchResultItemViewModel t1 = new ScenarioSearchResultItemViewModel
            {
                Id = "1",
                Name = "NOR 2.1a",
                SpecificationName = "General Annual Grant 17/18",
                Description = "Check if census and estimate academies have a positive number of pupils on roll",
                Status = "Draft",
                LastUpdatedDateDisplay = "20 Jan 2018"

            };

            ScenarioSearchResultItemViewModel t2 = new ScenarioSearchResultItemViewModel
            {
                Id = "2",
                Name = "SBS 3.1",
                SpecificationName = "General Annual Grant 17/18",
                Description = "Check SBS funding tolerances between the APT and Store are within £1",
                Status = "Draft",
                LastUpdatedDateDisplay = "7 Jan 2018"

            };

            ScenarioSearchResultViewModel results = new ScenarioSearchResultViewModel()
            {
                Scenarios = new List<ScenarioSearchResultItemViewModel> { t1, t2 }.AsEnumerable()
            };

            return results;
        }

    }
}