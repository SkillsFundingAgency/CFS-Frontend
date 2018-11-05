namespace CalculateFunding.Frontend.Clients.SpecsClient
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Http;
    using Serilog;

    public class SpecsApiClient : BaseApiClient, ISpecsApiClient
    {
        private readonly IFeatureToggle _featureToggle;

        public SpecsApiClient(IHttpClientFactory httpClientFactory, ILogger logger, IHttpContextAccessor contextAccessor, IFeatureToggle featureToggle)
           : base(httpClientFactory, HttpClientKeys.Specifications, logger, contextAccessor)
        {
            _featureToggle = featureToggle;
        }

        public Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications()
        {
            return GetAsync<IEnumerable<Specification>>("specifications");
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationsSelectedForFunding()
        {
            return GetAsync<IEnumerable<SpecificationSummary>>("specifications-selected-for-funding");
        }

        public async Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationsSelectedForFundingByPeriod(string fundingPeriodId)
        {
            return await GetAsync<IEnumerable<SpecificationSummary>>($"specifications-selected-for-funding-by-period?fundingPeriodId={fundingPeriodId}");
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationSummaries()
        {
            return GetAsync<IEnumerable<SpecificationSummary>>("specification-summaries");
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecifications(string fundingPeriodId)
        {
            return GetAsync<IEnumerable<SpecificationSummary>>($"specifications-by-year?fundingPeriodId={fundingPeriodId}");
        }

        public Task<ApiResponse<Specification>> GetSpecificationByName(string specificationName)
        {
            Guard.IsNullOrWhiteSpace(specificationName, nameof(specificationName));

            return GetAsync<Specification>($"specification-by-name?specificationName={specificationName}");
        }

        public Task<ApiResponse<Specification>> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<Specification>($"specification-current-version-by-id?specificationId={specificationId}");
        }

        public Task<ApiResponse<SpecificationSummary>> GetSpecificationSummary(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<SpecificationSummary>($"specification-summary-by-id?specificationId={specificationId}");
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationSummaries(IEnumerable<string> specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            if (!specificationIds.Any())
            {
                return Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));
            }

            return PostAsync<IEnumerable<SpecificationSummary>, IEnumerable<string>>("specification-summaries-by-ids", specificationIds);
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetApprovedSpecifications(string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));


            return GetAsync<IEnumerable<SpecificationSummary>>($"specifications-by-fundingperiod-and-fundingstream?fundingPeriodId={fundingPeriodId}&fundingStreamId={fundingStreamId}");
        }

        public Task<ValidatedApiResponse<Specification>> CreateSpecification(CreateSpecificationModel specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            return ValidatedPostAsync<Specification, CreateSpecificationModel>("specifications", specification);
        }

        public Task<HttpStatusCode> UpdateSpecification(string specificationId, EditSpecificationModel specification)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(specification, nameof(specification));

            return PutAsync($"specification-edit?specificationId={specificationId}", specification);
        }

        public Task<ApiResponse<Policy>> CreatePolicy(CreatePolicyModel policy)
        {
            Guard.ArgumentNotNull(policy, nameof(policy));

            return PostAsync<Policy, CreatePolicyModel>("policies", policy);
        }

        public Task<ValidatedApiResponse<Policy>> UpdateSubPolicy(string specificationId, string subPolicyId, EditSubPolicyModel subPolicy)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(subPolicyId, nameof(subPolicyId));
            Guard.ArgumentNotNull(subPolicy, nameof(subPolicy));

            return ValidatedPutAsync<Policy, EditSubPolicyModel>($"policies?specificationId={specificationId}&policyId={subPolicyId} ", subPolicy);
        }

        public Task<ValidatedApiResponse<Policy>> UpdatePolicy(string specificationId, string policyId, EditPolicyModel updatedPolicy)
        {
            Guard.ArgumentNotNull(updatedPolicy, nameof(updatedPolicy));

            return ValidatedPutAsync<Policy, EditPolicyModel>($"policies?specificationId={specificationId}&policyId={policyId}", updatedPolicy);
        }

        public Task<ApiResponse<Calculation>> CreateCalculation(CalculationCreateModel calculation)
        {
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return PostAsync<Calculation, CalculationCreateModel>("calculations", calculation);
        }

        public Task<ValidatedApiResponse<Calculation>> UpdateCalculation(string specificationId, string calculationId, CalculationUpdateModel calculation)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return ValidatedPutAsync<Calculation, CalculationUpdateModel>($"calculations?specificationId={specificationId}&calculationId={calculationId}", calculation);
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetFundingPeriods()
        {
            return GetAsync<IEnumerable<Reference>>("get-fundingperiods");
        }

        public Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreams()
        {
            return GetAsync<IEnumerable<FundingStream>>("get-fundingstreams");
        }

        public Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreamsForSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<FundingStream>>($"get-fundingstreams-for-specification?specificationId={specificationId}");
        }

        public Task<ApiResponse<FundingStream>> GetFundingStreamByFundingStreamId(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            return GetAsync<FundingStream>($"get-fundingstream-by-id?fundingstreamId={fundingStreamId}");
        }

        public Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(policyName, nameof(policyName));

            PolicyByNameRequestModel model = new PolicyByNameRequestModel { SpecificationId = specificationId, Name = policyName };

            return PostAsync<Policy, PolicyByNameRequestModel>("policy-by-name", model);
        }

        public Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationName, nameof(calculationName));

            CalculationByNameRequestModel model = new CalculationByNameRequestModel { SpecificationId = specificationId, Name = calculationName };

            return PostAsync<Calculation, CalculationByNameRequestModel>("calculation-by-name", model);
        }

        public Task<ApiResponse<CalculationCurrentVersion>> GetCalculationById(string specificationId, string calculationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            return GetAsync<CalculationCurrentVersion>($"calculation-by-id?calculationId={calculationId}&specificationId={specificationId}");
        }

        public async Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<SpecificationDatasourceRelationshipSearchResultItem>> results = await PostAsync<SearchResults<SpecificationDatasourceRelationshipSearchResultItem>, SearchQueryRequest>("specifications-dataset-relationships-search", request);
            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<SpecificationDatasourceRelationshipSearchResultItem> result = new SearchPagedResult<SpecificationDatasourceRelationshipSearchResultItem>(filterOptions, results.Content.TotalCount)
                {
                    Items = results.Content.Results
                };

                return result;
            }
            else
            {
                return null;
            }
        }

        public async Task<PagedResult<SpecificationSearchResultItem>> FindSpecifications(SearchFilterRequest filterOptions)
        {
            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<SpecificationSearchResultItem>> results = await PostAsync<SearchResults<SpecificationSearchResultItem>, SearchQueryRequest>("specifications-search", request);
            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<SpecificationSearchResultItem> result = new SearchPagedResult<SpecificationSearchResultItem>(filterOptions, results.Content.TotalCount)
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

        public async Task<ValidatedApiResponse<PublishStatusResult>> UpdatePublishStatus(string specificationId, PublishStatusEditModel model)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(model, nameof(model));

            return await ValidatedPutAsync<PublishStatusResult, PublishStatusEditModel>($"specification-edit-status?specificationId={specificationId}", model);
        }

        public async Task<HttpStatusCode> SelectSpecificationForFunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await PostAsync($"select-for-funding?specificationId={specificationId}");
        }

        public async Task<ApiResponse<SpecificationCalculationExecutionStatusModel>> RefreshPublishedResults(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (_featureToggle.IsAllocationLineMajorMinorVersioningEnabled())
            {
                return await PostAsync<SpecificationCalculationExecutionStatusModel, string>($"refresh-published-results?specificationId={specificationId}", specificationId);
            }
            else
            {
                return await PostAsync<SpecificationCalculationExecutionStatusModel, string>($"refresh-published-results?specificationIds={specificationId}", specificationId);
            }
        }

        public async Task<ApiResponse<SpecificationCalculationExecutionStatusModel>> CheckPublishResultStatus(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await PostAsync<SpecificationCalculationExecutionStatusModel, string>($"check-publish-result-status?specificationId={specificationId}", specificationId);
        }
    }
}