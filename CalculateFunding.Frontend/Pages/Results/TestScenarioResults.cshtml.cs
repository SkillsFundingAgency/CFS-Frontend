namespace CalculateFunding.Frontend.Pages.Results
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using Common.Utility;
    using Common.ApiClient.Models;
    using Extensions;
    using Common.ApiClient.Specifications;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;
    using Serilog;
    using CalculateFunding.Common.Models;

    public class TestScenarioResultsPageModel : PageModel
    {

        private readonly ITestScenarioResultsService _testScenarioResultsService;
        private readonly IMapper _mapper;
        private readonly ISpecsApiClient _specsApiClient;
        private readonly ILogger _logger;

        public TestScenarioResultsPageModel(ITestScenarioResultsService testScenarioResultsService, ISpecsApiClient specsApiClient, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(testScenarioResultsService, nameof(testScenarioResultsService));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _testScenarioResultsService = testScenarioResultsService;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _logger = logger;
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
            ApiResponse<IEnumerable<Reference>> periodsResponse = await _specsApiClient.GetFundingPeriods();
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