namespace CalculateFunding.Frontend.Pages.Scenarios
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
   // using Serilog;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;

    public class IndexModel : PageModel
    {
        private readonly IScenarioSearchService _scenarioSearchservice;

        private readonly ISpecsApiClient _specsClient;

       // private readonly IMapper _mapper;

      //  private readonly ILogger _logger;

        public IndexModel(ISpecsApiClient specsClient, IScenarioSearchService scenariosSearchService)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
         //   Guard.ArgumentNotNull(mapper, nameof(mapper));
         //   Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(scenariosSearchService, nameof(scenariosSearchService)); 

            _specsClient = specsClient;
         //   _mapper = mapper;
         //  _logger = logger;
            _scenarioSearchservice = scenariosSearchService;
        }

        public IEnumerable<SelectListItem> Periods { get; set; }

        [BindProperty]
        public string SearchTerm { get; set; }

        [BindProperty]
        public string PeriodId { get; set; }

        [BindProperty]
        public IEnumerable<SelectListItem> Specifications { get; set; }

        public ScenarioSearchResultViewModel ScenarioResults { get; set; }   

        //public async Task<IActionResult> OnGet(int? pageNumber, string searchTerm)
        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, string periodId= null, string specificationId=null )
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                Filters = new Dictionary<string, string[]> { { "periodId", new[] { periodId } } }
            };

            SearchTerm = searchTerm;

            //await PopulateAsync( periodId, specificationId);
            await PopulatePeriods();
           
            //ScenarioResults =   GetSearchResults();

            ScenarioResults = await _scenarioSearchservice.PerformSearch(searchRequest);

            if (ScenarioResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();

        }

     
        //public async Task<IActionResult> OnPostAsync( int? pageNumber,)
        //{
        //    //return await OnGetAsync( periodId, specificationId);

        //    await PopulatePeriods();

        //    SearchRequestViewModel searchRequest = new SearchRequestViewModel()
        //    {
        //        PageNumber = pageNumber,
        //        SearchTerm = SearchTerm,
        //        IncludeFacets = false,
        //        Filters = new Dictionary<string, string[]> { { "periodId", new[] { PeriodId } } }
        //    };

        //   ScenarioResults = await _sce

        //}


        async Task PopulateAsync(string periodId, string specificationId)
        {
            await PopulatePeriods(periodId);

            if (string.IsNullOrWhiteSpace(periodId))
            {
                periodId = Periods.First().Value;             
            }

            PeriodId = periodId;

            await PopulateSpecifications(periodId);



            //ApiResponse<ScenarioSearchResults> ScenarioResponse = await _scenariosApiClient.GetScenarioResults(periodId, specificationId);

            //if (ScenarioResponse.StatusCode == HttpStatusCode.OK && ScenarioResponse.Content != null)
            //{
            //     ScenarioResults = ScenarioResponse.Content;
            //}
            //else
            //{
            //    _logger.Warning("There were no scenarios for the given specification Id " + specificationId);
            //}
          

            //ScenarioResults = GetSearchResults();  // currently feeding with temporary data
            
        }





        //public void  OnPostAsync(int? pageNumber, string searchTerm)
        //{
        //    SearchRequestViewModel searchRequest = new SearchRequestViewModel()
        //    {
        //        PageNumber = pageNumber,
        //        SearchTerm = SearchTerm,
        //        IncludeFacets = true,
        //    };

        //    SearchTerm = searchTerm;

        //   // ProviderResults = await _providerSearchService.PerformSearch(searchRequest);

        //    // ApiResponse<ProviderSearchResultViewModel> apiResponse = await GetProviderSearchResultsAsync(searchRequest);

        //    // ProviderResults = apiResponse.Content;
        //    //if (ProviderResults == null)
        //    //{
        //    //    return new StatusCodeResult(500);
        //    //}

        //    //return Page();
        //}

        private async Task PopulatePeriods(string periodId = null)
        {
            var periodsResponse = await _specsClient.GetAcademicYears();
            IEnumerable<Reference> periods = periodsResponse.Content;

            Reference period = periods.FirstOrDefault();
            if (period != null)
            {
                PeriodId = period.Id;
            }


            //if (string.IsNullOrWhiteSpace(periodId))
            //{
            //    periodId = PeriodId;
            //}

            //Periods = periods.Select(m => new SelectListItem
            //{
            //    Value = m.Id,
            //    Text = m.Name,
            //    Selected = m.Id == periodId
            //}).ToList();
        }

        public async Task PopulateSpecifications(string periodId)
        {
            ApiResponse<IEnumerable<Specification>> apiResponse = await _specsClient.GetSpecifications(periodId);

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Specification information: Status Code = {apiResponse.StatusCode}");
            }

            var specifications = apiResponse.Content.Where(m => m.AcademicYear.Id == periodId);

            // var specifications =  GetSpecificationsAsync(); // This is temporary populating method

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
                Scenarios = new List<ScenarioSearchResultItemViewModel>{ t1, t2}.AsEnumerable()
            };

            return results;
        }

    }
}