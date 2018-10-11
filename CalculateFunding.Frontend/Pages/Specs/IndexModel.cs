namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;

    public class IndexModel : PageModel
    {
        private readonly ISpecificationSearchService _searchService;
        private readonly ISpecsApiClient _specsClient;

        public IndexModel(ISpecificationSearchService specsSearchService, ISpecsApiClient specsClient)
        {
            Guard.ArgumentNotNull(specsSearchService, nameof(specsSearchService));
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));

            _searchService = specsSearchService;
            _specsClient = specsClient;
        }

        public string SearchTerm { get; set; }

        public SpecificationSearchResultViewModel SearchResults { get; set; }

        public string InitialSearchResults { get; set; }

        public SpecificationPageBannerOperationType? OperationType { get; set; }

        public PageBannerOperation PageBanner { get; set; }

        public async Task<IActionResult> OnGetAsync(string searchTerm = null, int? pageNumber = null, SpecificationPageBannerOperationType? operationType = null, string operationId = null)
        {
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber ?? 1,
                IncludeFacets = true,
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

                ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(operationId);

                IActionResult errorResult = specificationResponse.IsSuccessfulOrReturnFailureResult();

                if (errorResult != null)
                {
                    return errorResult;
                }

                SpecificationSummary specificationSummary = specificationResponse.Content;

                PageBanner = new PageBannerOperation()
                {
                    EntityName = specificationSummary.Name,
                    EntityType = "Specification",
                    OperationId = operationId,
                    ActionText = "Edit",
                    ActionUrl = $"/specs/policies/{specificationSummary.Id}",
                    SecondaryActionUrl = $"/specs/EditSpecification/{specificationSummary.Id}?returnPage=Specifications",
                };

                switch (operationType)
                {
                    case SpecificationPageBannerOperationType.SpecificationCreated:
                        PageBanner.OperationAction = "created";
                        break;
                    case SpecificationPageBannerOperationType.SpecificationUpdated:
                        PageBanner.OperationAction = "edited";
                        break;
                }
            }

            SearchResults = await _searchService.PerformSearch(searchRequest);

            if (SearchResults == null)
            {
                return new InternalServerErrorResult("There was an error retrieving Specifications from the Search Index.");
            }

            InitialSearchResults = JsonConvert.SerializeObject(SearchResults, Formatting.Indented, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                StringEscapeHandling = StringEscapeHandling.EscapeHtml
            });

            return Page();
        }
    }
}
