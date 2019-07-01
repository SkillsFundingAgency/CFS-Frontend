namespace CalculateFunding.Frontend.Pages.Results
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
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
    using CalculateFunding.Common.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Providers.Models.Search;

    public class ProviderScenarioResultsPageModel : PageModel
    {
        private ILogger _logger;
        private ISpecsApiClient _specsApiClient;
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
            ILogger logger)

        {
            Guard.ArgumentNotNull(testScenarioSearchService, nameof(testScenarioSearchService));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _testScenarioSearchService = testScenarioSearchService;
            _resultsApiClient = resultsApiClient;
            _providersApiClient = providersApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
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

        public string SpecificationId
        {
            get
            {
                return SpecificationProviderVersion?.Split("_")[0];
            }
        }

        public string ProviderVersionId
        {
            get
            {
                return SpecificationProviderVersion?.Split("_").Count() > 1 ? SpecificationProviderVersion?.Split("_")[1] : null;
            }
        }

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

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriods?.First().Value;
            }

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
            ApiResponse<IEnumerable<Reference>> periodsResponse = await _specsApiClient.GetFundingPeriods();

            if (periodsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse.StatusCode}");
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
            }).ToList();
        }

        private async Task PopulateSpecifications(string providerId, string specificationId)
        {
            ApiResponse<IEnumerable<string>> specResponse = await _resultsApiClient.GetSpecificationIdsForProvider(providerId);

            if (specResponse.Content != null && specResponse.StatusCode == HttpStatusCode.OK)
            {
                IEnumerable<string> specificationIds = specResponse.Content;

                Dictionary<string, Clients.SpecsClient.Models.SpecificationSummary> specificationSummaries = new Dictionary<string, Clients.SpecsClient.Models.SpecificationSummary>();

                if (specificationIds.Any())
                {
                    ApiResponse<IEnumerable<Clients.SpecsClient.Models.SpecificationSummary>> specificationSummaryLookup = await _specsApiClient.GetSpecificationSummaries(specificationIds);
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
                        foreach (Clients.SpecsClient.Models.SpecificationSummary specSummary in specificationSummaryLookup.Content)
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