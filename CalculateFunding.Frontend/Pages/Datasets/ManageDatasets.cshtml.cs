using CalculateFunding.Common.ApiClient.DataSets;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CalculateFunding.Common.FeatureToggles;

namespace CalculateFunding.Frontend.Pages.Datasets
{


    public class ManageDatasetsPageModel : PageModel
    {
        private IDatasetSearchService _searchService;
        private readonly IDatasetsApiClient _datasetApiClient;
        private readonly IFeatureToggle _featureToggle;

        public ManageDatasetsPageModel(IDatasetSearchService searchService, IDatasetsApiClient datasetApiClient, IFeatureToggle featureToggle)
        {
            Guard.ArgumentNotNull(searchService, nameof(searchService));
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));
            Guard.ArgumentNotNull(featureToggle, nameof(featureToggle));

            _searchService = searchService;
            _datasetApiClient = datasetApiClient;
            _featureToggle = featureToggle;

            ShouldNewManageSourcesPageBeEnabled = _featureToggle.IsNewManageDataSourcesPageEnabled();
        }

        [BindProperty]
        public string SearchTerm { get; set; }

        public DatasetSearchResultViewModel SearchResults { get; set; }

        public DatasetPageBannerOperationType? OperationType { get; set; }

        public PageBannerOperation PageBanner { get; set; }

        public bool ShouldNewManageSourcesPageBeEnabled { get; private set; }

        public async Task<IActionResult> OnGetAsync(int? pageNumber, string searchTerm, DatasetPageBannerOperationType? operationType = null, string operationId = null)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
            };

            SearchTerm = searchTerm;

            OperationType = operationType;

            if (operationType.HasValue)
            {
                if (string.IsNullOrWhiteSpace(operationId))
                {
                    return new PreconditionFailedResult("Operation ID not provided");
                }

                ApiResponse<DatasetVersionResponseViewModel> datasetVersionResponse = await _datasetApiClient.GetCurrentDatasetVersionByDatasetId(operationId);

                IActionResult errorResult = datasetVersionResponse.IsSuccessOrReturnFailureResult("Dataset");

                if (errorResult != null)
                {
                    return errorResult;
                }

                DatasetVersionResponseViewModel version = datasetVersionResponse.Content;

                PageBanner = new PageBannerOperation()
                {
                    EntityName = version.Name,
                    EntityType = "Data Source",
                    OperationId = operationId,
                    DisplayOperationActionSummary = true,
                    CurrentDataSourceRows = version.CurrentDataSourceRows,
                    PreviousDataSourceRows = version.PreviousDataSourceRows,
                    SecondaryActionUrl = $"/datasets/updatedataset?datasetId={operationId}",
                };

                switch (operationType)
                {
                    case DatasetPageBannerOperationType.DatasetCreated:
                        PageBanner.OperationActionSummaryText = "A new data source with " + PageBanner.CurrentDataSourceRows + " data rows uploaded";
                        break;
                    case DatasetPageBannerOperationType.DatasetUpdated:
                        PageBanner.OperationActionSummaryText = "A new version of a data source with " + PageBanner.CurrentDataSourceRows + " data rows uploaded, the previous version contained " + PageBanner.PreviousDataSourceRows + "  data rows";
                        break;
                }
            }

            SearchResults = await _searchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new InternalServerErrorResult("There was an error retrieving data sources from the Search Index.");
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? pageNumber)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                SearchTerm = SearchTerm,
                IncludeFacets = false,
            };

            SearchResults = await _searchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }
    }
}