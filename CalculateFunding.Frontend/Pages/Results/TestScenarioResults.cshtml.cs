namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;
    using Serilog;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;

    public class TestScenarioResultsPageModel : PageModel
    {

        private readonly ITestScenarioResultsService _testScenarioResultsService;
        private readonly IMapper _mapper;
        private readonly ISpecsApiClient _specsApiClient;
        private readonly ILogger _logger;

        public TestScenarioResultsPageModel(ITestScenarioResultsService testScenarioResultsService, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger)
        {
            _testScenarioResultsService = testScenarioResultsService;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _logger = logger;
        }


        [BindProperty]
        public string SearchTerm { get; set; }

        public IEnumerable<SelectListItem> Periods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string PeriodId { get; set; }

        public string SpecificationId { get; set; }

        public string InitialSearchResults { get; set; }


        public TestScenarioResultViewModel SearchResults { get; set; }


        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, string periodId = null, string specificationId = null)
        {
            await PopulatePeriods(periodId);

            if (string.IsNullOrWhiteSpace(periodId))
            {
                periodId = Periods?.First().Value;
            }

            PeriodId = periodId;

            await PopulateSpecifications(periodId);

            TestScenarioResultRequestViewModel testScenarioResultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                PageNumber = pageNumber,
                PeriodId = periodId,
                SearchTerm = searchTerm,
                SpecificationId = specificationId,
            };

            SearchResults = await _testScenarioResultsService.PerformSearch(testScenarioResultRequestViewModel);

            if (SearchResults == null)
            {
                return new StatusCodeResult(500);
            }

            InitialSearchResults = JsonConvert.SerializeObject(SearchResults, Formatting.Indented, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
            });

            return Page();
        }

        private async Task PopulatePeriods(string periodId = null)
        {
            var periodsResponse = await _specsApiClient.GetAcademicYears();

            if (periodsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse.StatusCode}");
            }
            var periods = periodsResponse.Content;

            if (string.IsNullOrWhiteSpace(periodId))
            {
                periodId = PeriodId;
            }

            Periods = periods.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = m.Id == periodId
            }).ToList();
        }

        private async Task PopulateSpecifications(string academicYearId = null)
        {
            var specResponse = await _specsApiClient.GetSpecifications(academicYearId);

            var specifications = specResponse.Content.Where(m => m.AcademicYear?.Id == PeriodId);

            Specifications = specifications.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
            }).ToList().OrderBy(o => o.Text);
        }
    }
}