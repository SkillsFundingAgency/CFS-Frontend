namespace CalculateFunding.Frontend.Pages.Results
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class CalculationProviderResultsPageModel : PageModel
    {
        private readonly IMapper _mapper;
        private readonly ICalculationProviderResultsSearchService _resultsSearchService;
        private readonly ICalculationsApiClient _calculationsApiClient;
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly ILogger _logger;

        public CalculationProviderResultsPageModel(
            ICalculationProviderResultsSearchService resultsSearchService,
            ICalculationsApiClient calculationsApiClient,
            ISpecsApiClient specsApiClient,
            IMapper mapper,
            IDatasetsApiClient datasetsClient,
            ILogger logger)
        {
            Guard.ArgumentNotNull(resultsSearchService, nameof(resultsSearchService));
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _mapper = mapper;
            _resultsSearchService = resultsSearchService;
            _calculationsApiClient = calculationsApiClient;
            _specsClient = specsApiClient;
            _datasetsClient = datasetsClient;
            _logger = logger;
        }

        [BindProperty]
        public string SearchTerm { get; set; }

        public CalculationProviderResultSearchResultViewModel CalculationProviderResults { get; set; }

        public ViewModels.Calculations.CalculationViewModel Calculation { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public SpecificationSummaryViewModel Specification { get; set; }

        public Task<IActionResult> OnGetAsync(string calculationId, int? pageNumber, string searchTerm)
        {
            return Populate(calculationId, pageNumber, searchTerm);
        }

        public async Task<IActionResult> OnPostAsync(string calculationId, int? pageNumber, string searchTerm)
        {
            return await Populate(calculationId, pageNumber, searchTerm);
        }

        async Task PopulateCalculation(string calculationId)
        {
            ApiResponse<Clients.CalcsClient.Models.Calculation> calculation = await _calculationsApiClient.GetCalculationById(calculationId);

            if (calculation != null || calculation.StatusCode == System.Net.HttpStatusCode.OK)
            {
                Calculation = _mapper.Map<ViewModels.Calculations.CalculationViewModel>(calculation.Content);
            }
        }

        async Task PerformSearch(string calculationId, int? pageNumber, string searchTerm)
        {

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber ?? 1,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                Filters = new Dictionary<string, string[]> { { "calculationId", new[] { calculationId } } }
            };

            CalculationProviderResults = await _resultsSearchService.PerformSearch(searchRequest);
        }

        async Task<IActionResult> Populate(string calculationId, int? pageNumber, string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            await PopulateCalculation(calculationId);

            if (Calculation == null)
            {
                _logger.Error($"Failed to find calculation for id {calculationId}");

                return new NotFoundResult();
            }

            Task<ApiResponse<SpecificationSummary>> specLookupTask = _specsClient.GetSpecificationSummary(Calculation.SpecificationId);
            Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> datasetSchemaTask = _datasetsClient.GetAssignedDatasetSchemasForSpecification(Calculation.SpecificationId);

            await TaskHelper.WhenAllAndThrow(specLookupTask, datasetSchemaTask);

            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = datasetSchemaTask.Result; ;

            if (datasetSchemaResponse == null || (!datasetSchemaResponse.StatusCode.IsSuccess() || datasetSchemaResponse.Content == null))
            {
                _logger.Error("A Problem occcured getting assigned dataset schemas");

                return new StatusCodeResult(500);
            }

            ApiResponse<SpecificationSummary> specResponse = specLookupTask.Result;

            if (specResponse == null || (!specResponse.StatusCode.IsSuccess() || specResponse.Content == null))
            {
                _logger.Warning("Unable to retrieve Specification Summary with Spec ID '{SpecificationId}' for Calculation ID '{Id}", Calculation.SpecificationId, Calculation.Id);

                return new InternalServerErrorResult($"Unable to retrieve Specification Summary with Spec ID '{Calculation.SpecificationId}' for Calculation ID '{Calculation.Id}");
            }

            Specification = _mapper.Map<SpecificationSummaryViewModel>(specResponse.Content);

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsSetAsProviderData);

            if (HasProviderDatasetsAssigned)
            {
                await PerformSearch(calculationId, pageNumber, searchTerm);

                if (CalculationProviderResults == null)
                {
                    _logger.Error("Null calculation provider results were returned from the search api");

                    return new StatusCodeResult(500);
                }

                SearchTerm = searchTerm;
            }

            return Page();
        }
    }
}