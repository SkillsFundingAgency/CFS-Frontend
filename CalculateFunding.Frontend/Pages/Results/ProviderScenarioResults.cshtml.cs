namespace CalculateFunding.Frontend.Pages.Results
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Policies.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Providers.Models.Search;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.ApiClient.Specifications.Models;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Serilog;

    public class ProviderScenarioResultsPageModel : PageModel
    {
        private ILogger _logger;
        private ISpecsApiClient _specsApiClient;
        private IPoliciesApiClient _policiesApiClient;
        private IMapper _mapper;
        private readonly IResultsApiClient _resultsApiClient;
        private readonly IProvidersApiClient _providersApiClient;
        private readonly ITestScenarioSearchService _testScenarioSearchService;

        public ProviderScenarioResultsPageModel(
            ITestScenarioSearchService testScenarioSearchService,
            IResultsApiClient resultsApiClient,
            IProvidersApiClient providersApiClient,
            IMapper mapper,
            ISpecsApiClient specsApiClient,
            IPoliciesApiClient policiesApiClient,
            ILogger logger)

        {
            Guard.ArgumentNotNull(testScenarioSearchService, nameof(testScenarioSearchService));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _testScenarioSearchService = testScenarioSearchService;
            _resultsApiClient = resultsApiClient;
            _providersApiClient = providersApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _policiesApiClient = policiesApiClient;
            _logger = logger;
        }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string FundingPeriodId { get; set; }

        [BindProperty]
        public string SpecificationProviderVersion { get; set; }

        public string ProviderId { get; set; }

        public string SearchTerm { get; set; }

        public int Passed { get; set; } = 0;

        public int Failed { get; set; } = 0;

        public int Ignored { get; set; } = 0;

        public decimal TestCoverage { get; set; } = 0;

        //To store provider information
        public ProviderViewModel ProviderInfoModel { get; set; }

        public TestScenarioSearchResultViewModel TestScenarioSearchResults { get; set; }

        public string SpecificationId => SpecificationProviderVersion?.Split("_")[0];

        public string ProviderVersionId => SpecificationProviderVersion?.Split("_").Count() > 1
            ? SpecificationProviderVersion?.Split("_")[1]
            : null;

        public async Task<IActionResult> OnGetAsync(string providerId, int? pageNumber, string searchTerm = null, string fundingPeriodId = null, string specificationProviderVersion = null)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            SpecificationProviderVersion = specificationProviderVersion;

            ProviderId = providerId;

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = "",
                Filters = new Dictionary<string, string[]>
                {
                    { "providerId", new[] { providerId }},
                    { "specificationId", new[] { SpecificationId }},
                }
            };

            Task populatePeriodsTask = PopulateFundingPeriods(fundingPeriodId);

            Task<ApiResponse<ProviderVersionSearchResult>> apiResponseTask = _providersApiClient.GetProviderByIdFromMaster(providerId);

            await TaskHelper.WhenAllAndThrow(populatePeriodsTask, apiResponseTask);
        
            FundingPeriodId = fundingPeriodId;

            await PopulateSpecifications(providerId, SpecificationId);

            ApiResponse<ProviderVersionSearchResult> apiResponse = apiResponseTask.Result;

            if (apiResponse != null && apiResponse.StatusCode == HttpStatusCode.OK && apiResponse.Content != null)
            {
                ProviderVersionSearchResult response = apiResponse.Content;

                ProviderViewModel providerViewModel = _mapper.Map<ProviderViewModel>(apiResponse.Content);

                ProviderInfoModel = providerViewModel;
            }
            else
            {
                _logger.Error("Provider response content is null");
                return new StatusCodeResult(500);
            }

            if (!string.IsNullOrWhiteSpace(SpecificationId))
            {
                TestScenarioSearchResults = await _testScenarioSearchService.PerformSearch(searchRequest);
                if (TestScenarioSearchResults != null)
                {
                    Passed = TestScenarioSearchResults.TestScenarios.Where(c => c.TestResult == "Passed").Count();
                    Failed = TestScenarioSearchResults.TestScenarios.Where(c => c.TestResult == "Failed").Count();
                    Ignored = TestScenarioSearchResults.TestScenarios.Where(c => c.TestResult == "Ignored").Count();

                    int totalRecords = Passed + Failed + Ignored;
                    if (totalRecords > 0)
                    {
                        TestCoverage = Math.Round((decimal)(Passed + Failed) / totalRecords * 100, 1);
                    }
                }
            }

            return Page();
        }

        private async Task PopulateFundingPeriods(string fundingPeriodId = null)
        {
            ApiResponse<IEnumerable<FundingPeriod>> periodsResponse = await _policiesApiClient.GetFundingPeriods();

            if (periodsResponse == null || periodsResponse.StatusCode != HttpStatusCode.OK || periodsResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse?.StatusCode}");
            }
            IEnumerable<Reference> fundingPeriods = periodsResponse.Content;

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriodId;
            }

            FundingPeriods = fundingPeriods.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = m.Id == fundingPeriodId
            }).ToList().OrderBy(s => s.Text);
        }

        private async Task PopulateSpecifications(string providerId, string specificationId)
        {
            ApiResponse<IEnumerable<string>> specResponse = await _resultsApiClient.GetSpecificationIdsForProvider(providerId);

            if (specResponse.Content != null && specResponse.StatusCode == HttpStatusCode.OK)
            {
                IEnumerable<string> specificationIds = specResponse.Content;

                Dictionary<string, SpecificationSummary> specificationSummaries = new Dictionary<string, SpecificationSummary>();

                if (specificationIds.Any())
                {
                    ApiResponse<IEnumerable<SpecificationSummary>> specificationSummaryLookup = await _specsApiClient.GetSpecificationSummaries(specificationIds);
                    if (specificationSummaryLookup == null)
                    {
                        throw new InvalidOperationException("Specification Summary Lookup returned null");
                    }

                    if (specificationSummaryLookup.StatusCode != HttpStatusCode.OK)
                    {
                        throw new InvalidOperationException($"Specification Summary lookup returned HTTP Status code {specificationSummaryLookup.StatusCode}");
                    }

                    if (!specificationSummaryLookup.Content.IsNullOrEmpty())
                    {
                        foreach (SpecificationSummary specSummary in specificationSummaryLookup.Content)
                        {
                            specificationSummaries.Add(specSummary.Id, specSummary);
                        }
                    }
                }

                List<SelectListItem> selectListItems = new List<SelectListItem>();

                foreach (string specId in specificationIds)
                {
                    string specName = specId;
                    string specValue = specId;

                    if (specificationSummaries.ContainsKey(specId))
                    {
                        specValue = $"{specId}_{specificationSummaries[specId].ProviderVersionId}";

                        if (specificationSummaries[specId].FundingPeriod.Id != FundingPeriodId)
                        {
                            continue;
                        }

                        specName = specificationSummaries[specId].Name;
                    }
                    else
                    {
                        continue;
                    }

                    selectListItems.Add(new SelectListItem
                    {
                        Value = specValue,
                        Text = specName,
                        Selected = specId == specificationId
                    });
                }

                Specifications = selectListItems.OrderBy(o => o.Text);
            }
            else
            {
                throw new InvalidOperationException($"Unable to retrieve provider result Specifications: Status Code = {specResponse.StatusCode}");
            }

        }
    }
}