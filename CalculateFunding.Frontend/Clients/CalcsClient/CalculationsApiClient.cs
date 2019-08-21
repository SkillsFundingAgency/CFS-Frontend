using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Calcs.Models.Code;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Interfaces;
using CalculateFunding.Common.Utility;
using Serilog;

namespace CalculateFunding.Frontend.Clients.CalcsClient
{
    public class CalculationsApiClient : BaseApiClient, ICalculationsApiClient
    {
        public CalculationsApiClient(
            IHttpClientFactory httpClientFactory,
            ILogger logger,
            ICancellationTokenProvider cancellationTokenProvider)
            : base(httpClientFactory, Common.ApiClient.HttpClientKeys.Calculations, logger, cancellationTokenProvider)
        {
        }

        public Task<ApiResponse<Calculation>> GetCalculationById(string calculationId)
        {
            return GetAsync<Calculation>($"calculation-current-version?calculationId={calculationId}");
        }

        public Task<ValidatedApiResponse<Calculation>> EditCalculation(string specificationId, string calculationId, CalculationEditModel calculationEditModel)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(calculationEditModel, nameof(calculationEditModel));

            return ValidatedPostAsync<Calculation, CalculationEditModel>($"calculation-save-version?calculationId={calculationId}", calculationEditModel, CancellationToken.None);
        }

        public Task<ApiResponse<PreviewResponse>> PreviewCompile(PreviewRequest previewRequest)
        {
            return PostAsync<PreviewResponse, PreviewRequest>($"compile-preview", previewRequest);
        }

        public Task<ApiResponse<Calculation>> GetCalculationByCalculationSpecificationId(string calculationSpecificationId)
        {
            return GetAsync<Calculation>(
                $"{calculationSpecificationId}/calculation");
        }



        public async Task<ApiResponse<SearchResults<CalculationSearchResult>>> FindCalculations(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<CalculationSearchResult>> results = await PostAsync<SearchResults<CalculationSearchResult>, SearchQueryRequest>($"calculations-search", request);
            if (results.StatusCode == System.Net.HttpStatusCode.OK)
            {
                ApiResponse<SearchResults<CalculationSearchResult>> result =
                    new ApiResponse<SearchResults<CalculationSearchResult>>(results.StatusCode, results.Content);

                return result;
            }

            return null;
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


            CalculationVersion calcsVersGetModel = new CalculationVersion()
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

        public Task<ApiResponse<IEnumerable<CalculationMetadata>>> GetCalculations(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<IEnumerable<CalculationSummaryModel>>> GetCalculationSummariesForSpecification(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<BuildProject>> GetBuildProjectBySpecificationId(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<byte[]>> GetAssemblyBySpecificationId(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<BuildProject>> UpdateBuildProjectRelationships(string specificationId, DatasetRelationshipSummary datasetRelationshipSummary)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<IEnumerable<CalculationCurrentVersion>>> GetCurrentCalculationsBySpecificationId(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<HttpStatusCode>> CompileAndSaveAssembly(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        Task<ApiResponse<IEnumerable<CalculationStatusCounts>>> ICalculationsApiClient.GetCalculationStatusCounts(SpecificationIdsRequestModel request)
        {
            throw new System.NotImplementedException();
        }
		
        Task<ApiResponse<IEnumerable<CalculationVersion>>> ICalculationsApiClient.GetAllVersionsByCalculationId(string calculationId)
        {
            throw new System.NotImplementedException();
        }

        
        Task<ApiResponse<IEnumerable<Common.ApiClient.Calcs.Models.Code.TypeInformation>>> ICalculationsApiClient.GetCodeContextForSpecification(string specificationId)
        {
            throw new System.NotImplementedException();
        }

        public Task<ApiResponse<bool>> IsCalculationNameValid(string specificationId, string calculationName, string existingCalculationId = null)
        {
            throw new System.NotImplementedException();
        }

        public Task<ValidatedApiResponse<Calculation>> CreateCalculation(string specificationId, CalculationCreateModel calculationCreateModel)
        {
            throw new System.NotImplementedException();
        }
    }
}