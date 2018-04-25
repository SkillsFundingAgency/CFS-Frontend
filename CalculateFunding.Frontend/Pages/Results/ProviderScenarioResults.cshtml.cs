namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Serilog;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;

    public class ProviderScenarioResultsPageModel : PageModel
    {
        private ILogger _logger;
        private ISpecsApiClient _specsApiClient;
        private IMapper _mapper;
        private readonly IResultsApiClient _resultsApiClient;
        private readonly ITestScenarioSearchService _testScenarioSearchService;

        public ProviderScenarioResultsPageModel(ITestScenarioSearchService testScenarioSearchService, IResultsApiClient resultsApiClient, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger)

        {
            _resultsApiClient = resultsApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _testScenarioSearchService = testScenarioSearchService;
            _logger = logger;
        }

        public IEnumerable<SelectListItem> Periods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string PeriodId { get; set; }

        [BindProperty]
        public string SpecificationId { get; set; }

        public string ProviderId { get; set; }

        public string SearchTerm { get; set; }

        //To store provider information
        public ProviderViewModel ProviderInfoModel { get; set; }

        public TestScenarioSearchResultViewModel TestScenarioSearchResults { get; set; }

        public async Task<IActionResult> OnGetAsync(string providerId, int? pageNumber, string searchTerm = null, string periodId = null, string specificationId = null)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ProviderId = providerId;

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = "",
                Filters = new Dictionary<string, string[]>
                {
                    { "providerId", new[] { providerId }},
                    { "specificationId", new[] { specificationId }},
                }
            };

            // Specs, periods and provider info can be in parallel too
            await PopulatePeriods(periodId);

            if (string.IsNullOrWhiteSpace(periodId))
            {
                periodId = Periods?.First().Value;
            }

            PeriodId = periodId;

            await PopulateSpecifications(providerId);

            SpecificationId = specificationId;

            ApiResponse<Provider> apiResponse = await _resultsApiClient.GetProviderByProviderId(providerId);
            
            Provider response = apiResponse.Content;
            // TODO - add a check for StatusCode == OK

            ProviderViewModel providerViewModel = new ProviderViewModel
            {
                Id = response.Id,
                Name = response.Name,
                Urn = response.URN,
                Ukprn = response.UKPRN,
                Upin = response.UPIN,
                LocalAuthority = response.LocalAuthority,
                ProviderType = response.ProviderType,
                ProviderSubtype = response.ProviderSubtype,
                DateOpened = response.DateOpened.HasValue ? response.DateOpened.Value.ToString("dd/MM/yyyy") : "Unknown",
            };

            ProviderInfoModel = providerViewModel;

            if (!string.IsNullOrWhiteSpace(specificationId))
            {
                // TODO this call and the GetProviderByProviderId in parallel
                TestScenarioSearchResults = await _testScenarioSearchService.PerformSearch(searchRequest);
            }

            if (TestScenarioSearchResults == null)
            {
                _logger.Error("Test scenario results content is null");
                // Return something other than null, eg 500
                return null;
            }

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

        private async Task PopulateSpecifications(string providerId)
        {
            var specResponse = await _resultsApiClient.GetSpecifications(providerId);

            if (specResponse.Content != null && specResponse.StatusCode == HttpStatusCode.OK)
            {
                var specifications = specResponse.Content.Where(m => m.Period?.Id == PeriodId);

                Specifications = specifications.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Selected = m.Id == SpecificationId
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Specifications: Status Code = {specResponse.StatusCode}");
            }
        }
    }
}