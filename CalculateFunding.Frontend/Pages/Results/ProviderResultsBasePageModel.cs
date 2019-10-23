﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Serilog;

namespace CalculateFunding.Frontend.Pages.Results
{
    public abstract class ProviderResultsBasePageModel : PageModel
    {
        private readonly IResultsApiClient _resultsApiClient;
        private readonly IProvidersApiClient _providersApiClient;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IMapper _mapper;
        private readonly ISpecsApiClient _specsApiClient;
        private readonly ILogger _logger;

        protected ProviderResultsBasePageModel(IResultsApiClient resultsApiClient,
            IProvidersApiClient providersApiClient,
            IPoliciesApiClient policiesApiClient,
            IMapper mapper,
            ISpecsApiClient specsApiClient,
            ILogger logger)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));

            _resultsApiClient = resultsApiClient;
            _providersApiClient = providersApiClient;
            _policiesApiClient = policiesApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _logger = logger;
        }

        public ProviderResultsViewModel ViewModel { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }



        [BindProperty]
        public string FundingPeriodId { get; set; }

        public string SpecificationProviderVersion { get; set; }

        public string ProviderId { get; set; }

        public string SpecificationId => SpecificationProviderVersion?.Split("_")[0];

        public string ProviderVersionId => SpecificationProviderVersion?.Split("_").Count() > 1
            ? SpecificationProviderVersion?.Split("_")[1]
            : null;

        public async Task<IActionResult> OnGetAsync(string providerId, string fundingPeriodId = null, string specificationProviderVersion = null)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            await PopulateAsync(providerId, fundingPeriodId, specificationProviderVersion);

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string providerId, string fundingPeriodId = null, string specificationProviderVersion = null)
        {
            return await OnGetAsync(providerId, fundingPeriodId, specificationProviderVersion);
        }

        private async Task PopulateAsync(string providerId, string fundingPeriodId = null, string specificationProviderVersion = null)
        {
            await PopulatePeriods(fundingPeriodId);

            FundingPeriodId = fundingPeriodId;

            SpecificationProviderVersion = specificationProviderVersion;

            await PopulateSpecifications(providerId, SpecificationId);

            ProviderId = providerId;

            string targetDate = string.Empty;
            int? version = null;

            ApiResponse<ProviderVersionSearchResult> apiResponse;

            if (string.IsNullOrWhiteSpace(ProviderVersionId))
            {
                apiResponse = await _providersApiClient.GetProviderByIdFromMaster(providerId);
            }
            else
            {
                apiResponse = await _providersApiClient.GetProviderByIdFromProviderVersion(ProviderVersionId, providerId);
                ApiResponse<ProviderVersionMetadata> apiResponseMetaData = await _providersApiClient.GetProviderVersionMetadata(ProviderVersionId);

                if (apiResponseMetaData?.Content != null)
                {
                    targetDate = apiResponseMetaData?.Content.TargetDate.LocalDateTime.ToShortDateString();
                    version = apiResponseMetaData?.Content.Version;
                }
            }

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Provider information: Status Code = {apiResponse.StatusCode}");
            }

            ProviderVersionSearchResult response = apiResponse.Content;

            ProviderResultsViewModel viewModel = new ProviderResultsViewModel
            {
                TargetDate = targetDate,
                Version = version,
                ProviderName = response.Name,
                ProviderType = response.ProviderType,
                ProviderSubtype = response.ProviderSubType,
                LocalAuthority = response.Authority,
                Upin = string.IsNullOrWhiteSpace(response.UPIN) ? 0 : Convert.ToInt32(response.UPIN),
                Ukprn = string.IsNullOrWhiteSpace(response.UKPRN) ? 0 : Convert.ToInt32(response.UKPRN),
                Urn = string.IsNullOrWhiteSpace(response.URN) ? 0 : Convert.ToInt32(response.URN),
                DateOpened = response.DateOpened.HasValue ? response.DateOpened.Value.ToString("dd/MM/yyyy") : "Unknown",
                DateClosed = response.DateClosed.HasValue ? response.DateClosed.Value.ToString("dd/MM/yyyy") : "Unknown",
                TrustStatus = response.TrustStatus,
                Successor = response.Successor,
                ReasonEstablishmentClosed = response.ReasonEstablishmentClosed,
                ReasonEstablishmentOpened = response.ReasonEstablishmentOpened,
                PhaseOfEducation = response.PhaseOfEducation,
                Status = response.Status,
                LegalName = response.LegalName,
                CrmAccountId = response.CrmAccountId,
                NavVendorNo = response.NavVendorNo,
                LaCode = response.LaCode,
                ProviderProfileIdType = response.ProviderProfileIdType,
                DfeEstablishmentNumber = response.DfeEstablishmentNumber,
                EstablishmentNumber = response.EstablishmentNumber,
                TrustName = response.TrustName,
                TrustCode = response.TrustCode,
                Town = response.Town,
                Postcode = response.Postcode
            };

            ViewModel = viewModel;

            if (!string.IsNullOrWhiteSpace(SpecificationId))
            {
                ApiResponse<ProviderResult> providerResponse = await GetProviderResult(providerId, SpecificationId);

                if (providerResponse.StatusCode == HttpStatusCode.OK && providerResponse.Content != null)
                {
                    PopulateResults(providerResponse);
                }
                else
                {
                    _logger.Warning("There were no providers for the given specification Id " + SpecificationId);
                }
            }
        }

        public virtual async Task<ApiResponse<ProviderResult>> GetProviderResult(string providerId, string specificationId)
        {
            return await _resultsApiClient.GetProviderResults(providerId, SpecificationId);
        }

        public abstract void PopulateResults(ApiResponse<ProviderResult> providerResponse);

        private async Task PopulatePeriods(string fundingPeriodId = null)
        {
            ApiResponse<IEnumerable<FundingPeriod>> periodsResponse = await _policiesApiClient.GetFundingPeriods();

            if (periodsResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Unable to retreive Periods: Status Code = {periodsResponse.StatusCode}");
            }
            IEnumerable<FundingPeriod> fundingPeriods = periodsResponse.Content;

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = FundingPeriodId;
            }

            FundingPeriods = fundingPeriods.Select(m => new SelectListItem
	            {
		            Value = m.Id,
		            Text = m.Name,
		            Selected = m.Id == fundingPeriodId
	            }).OrderBy(s => s.Text)
	            .ToList();
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
                        Selected = specId == specificationId,
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
