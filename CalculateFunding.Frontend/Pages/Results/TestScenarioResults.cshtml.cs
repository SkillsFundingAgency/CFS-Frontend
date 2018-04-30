namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
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

        public IEnumerable<SelectListItem> Periods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string PeriodId { get; set; }

        public string SpecificationId { get; set; }

        public string InitialSearchResults { get; set; }


        public TestScenarioResultViewModel SearchResults { get; set; }


        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, string periodId = null, string specificationId = null)
        {
            Task populatePeriodsTask = PopulatePeriods(periodId);

            TestScenarioResultRequestViewModel testScenarioResultRequestViewModel = new TestScenarioResultRequestViewModel()
            {
                PageNumber = pageNumber,
                PeriodId = periodId,
                SearchTerm = searchTerm,
                SpecificationId = specificationId,
            };
            Task<TestScenarioResultViewModel> testScenarioResultsTask = _testScenarioResultsService.PerformSearch(testScenarioResultRequestViewModel);

            await TaskHelper.WhenAllAndThrow(testScenarioResultsTask, populatePeriodsTask);

            if (string.IsNullOrWhiteSpace(periodId))
            {
                periodId = Periods?.First().Value;
            }

            PeriodId = periodId;

            SearchResults =  testScenarioResultsTask.Result;
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
            });

            return Page();
        }

        private async Task PopulatePeriods(string periodId = null)
        {
            ApiResponse<IEnumerable<Reference>> periodsResponse = await _specsApiClient.GetAcademicYears();
            if(periodsResponse == null)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: response was null");
            }

            if (periodsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse.StatusCode}");
            }

            IEnumerable<Reference> periods = periodsResponse.Content;
            if (periodsResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Content was null");
            }

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