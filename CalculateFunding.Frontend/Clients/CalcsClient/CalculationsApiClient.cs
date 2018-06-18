namespace CalculateFunding.Frontend.Clients.CalcsClient
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Serilog;

    public class CalculationsApiClient : BaseApiClient, ICalculationsApiClient
    {
        public CalculationsApiClient(
            IHttpClientFactory httpClientFactory,
            ILogger logger)
            : base(httpClientFactory, HttpClientKeys.Calculations, logger)
        {
        }

        public Task<ApiResponse<Calculation>> GetCalculationById(string calculationId)
        {
            return GetAsync<Calculation>($"calculation-current-version?calculationId={calculationId}");
        }

        public async Task<PagedResult<CalculationSearchResultItem>> FindCalculations(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<CalculationSearchResultItem>> results = await PostAsync<SearchResults<CalculationSearchResultItem>, SearchQueryRequest>($"calculations-search", request);
            if (results.StatusCode == System.Net.HttpStatusCode.OK)
            {
                PagedResult<CalculationSearchResultItem> result = new SearchPagedResult<CalculationSearchResultItem>(filterOptions, results.Content.TotalCount)
                {
                    Items = results.Content.Results,
                    Facets = results.Content.Facets,
                };

                return result;
            }
            else
            {
                return null;
            }
        }

        public Task<ApiResponse<Calculation>> UpdateCalculation(string calculationId, CalculationUpdateModel calculation)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return PostAsync<Calculation, CalculationUpdateModel>($"calculation-save-version?calculationId={calculationId}", calculation);
        }

        public Task<ApiResponse<PreviewCompileResult>> PreviewCompile(PreviewCompileRequest request)
        {
            return PostAsync<PreviewCompileResult, PreviewCompileRequest>($"compile-preview", request);
        }

        public Task<IEnumerable<Calculation>> GetVersionsByCalculationId(string calculationId)
        {
            return Task.FromResult(Enumerable.Empty<Calculation>());
        }

        public Task<ApiResponse<IEnumerable<CalculationVersion>>> GetAllVersionsByCalculationId(string calculationId)
        {
            return GetAsync<IEnumerable<CalculationVersion>>($"calculation-version-history?calculationId={calculationId}");
        }

        public Task<ApiResponse<IEnumerable<CalculationVersion>>> GetMultipleVersionsByCalculationId(IEnumerable<int> versionIds, string calculationId)
        {
            Guard.ArgumentNotNull(versionIds, nameof(versionIds));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            CalculationVersionsRequestModel calcsVersGetModel = new CalculationVersionsRequestModel()
            {
                Versions = versionIds,
                CalculationId = calculationId,
            };

            return PostAsync<IEnumerable<CalculationVersion>, CalculationVersionsRequestModel>($"calculation-versions", calcsVersGetModel);
        }

        public Task<ApiResponse<IEnumerable<TypeInformation>>> GetCodeContextForSpecification(string specificationId)
        {
            return GetAsync<IEnumerable<TypeInformation>>($"get-calculation-code-context?specificationId={specificationId}");
        }

        public Task<ValidatedApiResponse<PublishStatusResult>> UpdatePublishStatus(string calculationId, PublishStatusEditModel model)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(model, nameof(model));

            return ValidatedPutAsync<PublishStatusResult, PublishStatusEditModel>($"calculation-edit-status?calculationId={calculationId}", model);
        }

        public Task<ApiResponse<IEnumerable<CalculationStatusCounts>>> GetCalculationStatusCounts(SpecificationIdsRequestModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            return PostAsync<IEnumerable<CalculationStatusCounts>, SpecificationIdsRequestModel>($"status-counts", request);
        }
    }
}