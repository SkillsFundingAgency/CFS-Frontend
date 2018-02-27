namespace CalculateFunding.Frontend.Pages.Results
{
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
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;

    public class ProviderCalcsResultsPageModel : PageModel
    {
        private readonly IResultsApiClient _resultsApiClient;
        private readonly IMapper _mapper;
        private readonly ISpecsApiClient _specsApiClient;

        public ProviderCalcsResultsPageModel(IResultsApiClient resultsApiClient, ISpecsApiClient specsApiClient, IMapper mapper)
        {
            _resultsApiClient = resultsApiClient;
            _mapper = mapper;
            _specsApiClient = specsApiClient;
        }

        public ProviderResultsViewModel ViewModel { get; set; }

        public IEnumerable<SelectListItem> Periods { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        [BindProperty]
        public string PeriodId { get; set; }

        [BindProperty]
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
                periodId = Periods.First().Value;
            }

            PeriodId = periodId;

            await PopulateSpecifications(providerId, specificationId);

            ProviderId = providerId;

            SpecificationId = specificationId;

            ApiResponse<Provider> apiResponse = await _resultsApiClient.GetProviderByProviderId(providerId);

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

            if (!string.IsNullOrWhiteSpace(specificationId))
            {
                ApiResponse<ProviderResults> providerResponse = await _resultsApiClient.GetProviderResults(providerId, specificationId);

                if(providerResponse.StatusCode == HttpStatusCode.OK && providerResponse.Content != null)
                {
                    viewModel.CalculationItems = providerResponse.Content.CalculationResults.Select(m =>
                        new CalculationItemResult
                        {
                            Calculation = m.Calculation.Name,
                            SubTotal = m.Value.HasValue ? m.Value.Value : 0
                        }
                    );
                }
            }

            ViewModel = viewModel;
        }

        private async Task PopulatePeriods(string periodId = null)
        {
            var periodsResponse = await _specsApiClient.GetAcademicYears();
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

            var specifications = specResponse.Content.Where(m => m.Period.Id == PeriodId);

            if (string.IsNullOrWhiteSpace(specificationId))
            {
                specificationId = SpecificationId;
            }

            Specifications = specifications.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = m.Id == specificationId
            }).ToList();

        }


    }
}