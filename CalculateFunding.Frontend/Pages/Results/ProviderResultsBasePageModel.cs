using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Pages.Results
{
    public abstract class ProviderResultsBasePageModel : PageModel
    {
        private readonly IResultsApiClient _resultsApiClient;
        private readonly IMapper _mapper;
        private readonly ISpecsApiClient _specsApiClient;
        private readonly ILogger _logger;

        public ProviderResultsBasePageModel(IResultsApiClient resultsApiClient, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger)
        {
            _resultsApiClient = resultsApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
            _logger = logger;
        }

        public ProviderResultsViewModel ViewModel { get; set; }

        public IEnumerable<SelectListItem> Periods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string PeriodId { get; set; }

        public string SpecificationId { get; set; }

        public string ProviderId { get; set; }

        public async Task<IActionResult> OnGetAsync(string providerId, string periodId = null, string specificationId = null)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            await PopulateAsync(providerId, periodId, specificationId);

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string providerId, string periodId = null, string specificationId = null)
        {
            return await OnGetAsync(providerId, periodId, specificationId);
        }

        async Task PopulateAsync(string providerId, string periodId = null, string specificationId = null)
        {
            await PopulatePeriods(periodId);

            if (string.IsNullOrWhiteSpace(periodId))
            {
                periodId = Periods?.First().Value;
            }

            PeriodId = periodId;

            await PopulateSpecifications(providerId, specificationId);

            ProviderId = providerId;

            SpecificationId = specificationId;

            ApiResponse<Provider> apiResponse = await _resultsApiClient.GetProviderByProviderId(providerId);

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Provider information: Status Code = {apiResponse.StatusCode}");
            }

            Provider response = apiResponse.Content;

            ProviderResultsViewModel viewModel = new ProviderResultsViewModel
            {
                ProviderName = response.Name,
                ProviderType = response.ProviderType,
                ProviderSubtype = response.ProviderSubtype,
                LocalAuthority = response.LocalAuthority,
                Upin = response.UPIN,
                Ukprn = response.UKPRN,
                Urn = response.URN,
                DateOpened = response.DateOpened.HasValue ? response.DateOpened.Value.ToString("dd/MM/yyyy") : "Unknown"
            };

            ViewModel = viewModel;

            if (!string.IsNullOrWhiteSpace(specificationId))
            {
                ApiResponse<ProviderResults> providerResponse = await _resultsApiClient.GetProviderResults(providerId, specificationId);

                if (providerResponse.StatusCode == HttpStatusCode.OK && providerResponse.Content != null)
                {
                    PopulateResults(providerResponse);
                }
                else
                {
                    _logger.Warning("There were no providers for the given specification Id " +specificationId);
                }               
            }
        }

        public abstract void PopulateResults(ApiResponse<ProviderResults> providerResponse);

        private async Task PopulatePeriods(string periodId = null)
        {
            var periodsResponse = await _specsApiClient.GetAcademicYears();

            if(periodsResponse.StatusCode != HttpStatusCode.OK )
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

        private async Task PopulateSpecifications(string providerId, string specificationId = null)
        {
            var specResponse = await _resultsApiClient.GetSpecifications(providerId);

            if (specResponse.Content != null && specResponse.StatusCode == HttpStatusCode.OK)
            {
                var specifications = specResponse.Content.Where(m => m.Period?.Id == PeriodId);

                if (string.IsNullOrWhiteSpace(specificationId))
                {
                    specificationId = SpecificationId;
                }

                Specifications = specifications.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Selected = m.Id == specificationId
                }).ToList().OrderBy(o => o.Text);
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Specifications: Status Code = {specResponse.StatusCode}");
            }

        }
    }
}
