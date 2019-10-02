namespace CalculateFunding.Frontend.Pages.Results
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using Common.Utility;
    using Common.ApiClient.Models;
    using Extensions;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Policies.Models;

    public class TestScenarioResultsPageModel : PageModel
    {
        private readonly ITestScenarioResultsService _testScenarioResultsService;
        private readonly IPoliciesApiClient _policiesApiClient;

        public TestScenarioResultsPageModel(ITestScenarioResultsService testScenarioResultsService, IPoliciesApiClient policiesApiClient)
        {
            Guard.ArgumentNotNull(testScenarioResultsService, nameof(testScenarioResultsService));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));

            _testScenarioResultsService = testScenarioResultsService;
            _policiesApiClient = policiesApiClient;
        }

        [BindProperty]
        public string SearchTerm { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string FundingPeriodId { get; set; }

        public string SpecificationId { get; set; }

        public string InitialSearchResults { get; set; }


        public TestScenarioResultViewModel SearchResults { get; set; }


        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, string fundingPeriodId = null, string specificationId = null)
        {
            Task populatePeriodsTask = PopulateFundingPeriods(fundingPeriodId);

            TestScenarioResultRequestViewModel testScenarioResultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                PageNumber = pageNumber,
                FundingPeriodId = fundingPeriodId,
                SearchTerm = searchTerm,
                SpecificationId = specificationId,
            };
            Task<TestScenarioResultViewModel> testScenarioResultsTask = _testScenarioResultsService.PerformSearch(testScenarioResultRequestViewModel);

            await TaskHelper.WhenAllAndThrow(testScenarioResultsTask, populatePeriodsTask);

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriods?.First().Value;
            }

            FundingPeriodId = fundingPeriodId;

            SearchResults = testScenarioResultsTask.Result;
            if (SearchResults == null)
            {
                return new ObjectResult("Search result was null")
                {
                    StatusCode = 500
                };
            }

            PopulateSpecifications(SearchResults.Specifications);

            InitialSearchResults = JsonConvert.SerializeObject(SearchResults, Formatting.Indented, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                StringEscapeHandling = StringEscapeHandling.EscapeHtml
            });

            return Page();
        }

        private async Task PopulateFundingPeriods(string fundingPeriodId = null)
        {
            ApiResponse<IEnumerable<FundingPeriod>> periodsResponse = await _policiesApiClient.GetFundingPeriods();
            if (periodsResponse == null)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: response was null");
            }

            if (periodsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse.StatusCode}");
            }

            IEnumerable<Reference> fundingPeriods = periodsResponse.Content;
            if (periodsResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Content was null");
            }

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

        private void PopulateSpecifications(IEnumerable<ReferenceViewModel> specifications)
        {
            Specifications = specifications.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
            }).ToList().OrderBy(o => o.Text);
        }
    }
}