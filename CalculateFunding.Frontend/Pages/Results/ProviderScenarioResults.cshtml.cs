namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Extensions;
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

        public ProviderScenarioResultsPageModel(
            ITestScenarioSearchService testScenarioSearchService,
            IResultsApiClient resultsApiClient,
            IMapper mapper,
            ISpecsApiClient specsApiClient,
            ILogger logger)

        {
            Guard.ArgumentNotNull(testScenarioSearchService, nameof(testScenarioSearchService));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _testScenarioSearchService = testScenarioSearchService;
            _resultsApiClient = resultsApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _logger = logger;
        }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string FundingPeriodId { get; set; }

        [BindProperty]
        public string SpecificationId { get; set; }

        public string ProviderId { get; set; }

        public string SearchTerm { get; set; }

        public int Passed { get; set; } = 0;

        public int Failed { get; set; } = 0;

        public int Ignored { get; set; } = 0;

        public decimal TestCoverage { get; set; } = 0;

        //To store provider information
        public ProviderViewModel ProviderInfoModel { get; set; }

        public TestScenarioSearchResultViewModel TestScenarioSearchResults { get; set; }

        public async Task<IActionResult> OnGetAsync(string providerId, int? pageNumber, string searchTerm = null, string fundingPeriodId = null, string specificationId = null)
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

            Task populatePeriodsTask = PopulateFundingPeriods(fundingPeriodId);

            Task<ApiResponse<Provider>> apiResponseTask = _resultsApiClient.GetProviderByProviderId(providerId);


            await TaskHelper.WhenAllAndThrow(populatePeriodsTask, apiResponseTask);

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriods?.First().Value;
            }

            FundingPeriodId = fundingPeriodId;

            await PopulateSpecifications(providerId);

            SpecificationId = specificationId;

            ApiResponse<Provider> apiResponse = apiResponseTask.Result;

            if (apiResponse != null && apiResponse.StatusCode == HttpStatusCode.OK && apiResponse.Content != null)
            {
                Provider response = apiResponse.Content;

                ProviderViewModel providerViewModel = _mapper.Map<ProviderViewModel>(apiResponse.Content);

                ProviderInfoModel = providerViewModel;
            }
            else
            {
                _logger.Error("Provider response content is null");
                return new StatusCodeResult(500);
            }

            if (!string.IsNullOrWhiteSpace(specificationId))
            {
                TestScenarioSearchResults = await _testScenarioSearchService.PerformSearch(searchRequest);
                if(TestScenarioSearchResults != null)
                {
                    Passed = TestScenarioSearchResults.TestScenarios.Where(c=>c.TestResult == "Passed").Count();
                    Failed = TestScenarioSearchResults.TestScenarios.Where(c => c.TestResult == "Failed").Count();
                    Ignored = TestScenarioSearchResults.TestScenarios.Where(c => c.TestResult == "Ignored").Count();

                    int totalRecords = Passed + Failed + Ignored;
                    if(totalRecords > 0)
                    {
                        TestCoverage = Math.Round((decimal)(Passed + Failed) / totalRecords * 100, 1);
                    }
                }
            }

            return Page();
        }

        private async Task PopulateFundingPeriods(string fundingPeriodId = null)
        {
            var periodsResponse = await _specsApiClient.GetFundingPeriods();

            if (periodsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse.StatusCode}");
            }
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

        private async Task PopulateSpecifications(string providerId)
        {
            var specResponse = await _resultsApiClient.GetSpecificationIdsForProvider(providerId);

            if (specResponse.Content != null && specResponse.StatusCode == HttpStatusCode.OK)
            {
                var specifications = specResponse.Content.Where(m => m == FundingPeriodId);

                // TODO - lookup specification names
                Specifications = specifications.Select(m => new SelectListItem
                {
                    Value = m,
                    Text = m,
                    Selected = m == SpecificationId
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Specifications: Status Code = {specResponse.StatusCode}");
            }
        }
    }
}