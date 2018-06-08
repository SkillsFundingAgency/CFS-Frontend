namespace CalculateFunding.Frontend.Clients.SpecsClient
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Core;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Options;
    using Serilog;

    public class SpecsApiClient : AbstractApiClient, ISpecsApiClient
    {
        private readonly CancellationToken _cancellationToken;
        private string _specsPath;

        public SpecsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, IHttpContextAccessor context, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            _specsPath = options.Value.SpecsPath ?? "specs";
            _cancellationToken = context.HttpContext.RequestAborted;
        }

        public Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications()
        {
            return GetAsync<IEnumerable<Specification>>($"{_specsPath}/specifications", _cancellationToken);
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationsSelectedForFunding()
        {
            return GetAsync<IEnumerable<SpecificationSummary>>($"{_specsPath}/specifications-selected-for-funding", _cancellationToken);
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationSummaries()
        {
            return GetAsync<IEnumerable<SpecificationSummary>>($"{_specsPath}/specification-summaries", _cancellationToken);
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecifications(string fundingPeriodId)
        {
            return GetAsync<IEnumerable<SpecificationSummary>>($"{_specsPath}/specifications-by-year?fundingPeriodId={fundingPeriodId}", _cancellationToken);
        }

        public Task<ApiResponse<Specification>> GetSpecificationByName(string specificationName)
        {
            Guard.IsNullOrWhiteSpace(specificationName, nameof(specificationName));

            return GetAsync<Specification>($"{_specsPath}/specification-by-name?specificationName={specificationName}", _cancellationToken);
        }

        public Task<ApiResponse<Specification>> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<Specification>($"{_specsPath}/specification-current-version-by-id?specificationId={specificationId}");
        }

        public Task<ApiResponse<SpecificationSummary>> GetSpecificationSummary(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<SpecificationSummary>($"{_specsPath}/specification-summary-by-id?specificationId={specificationId}");
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationSummaries(IEnumerable<string> specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            if (!specificationIds.Any())
            {
                return Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, Enumerable.Empty<SpecificationSummary>()));
            }

            return PostAsync<IEnumerable<SpecificationSummary>, IEnumerable<string>>($"{_specsPath}/specification-summaries-by-ids", specificationIds);
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetApprovedSpecifications(string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));


            return GetAsync<IEnumerable<SpecificationSummary>>($"{_specsPath}/specifications-by-fundingperiod-and-fundingstream?fundingPeriodId={fundingPeriodId}&fundingStreamId={fundingStreamId}");
        }

        public Task<ValidatedApiResponse<Specification>> CreateSpecification(CreateSpecificationModel specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            return ValidatedPostAsync<Specification, CreateSpecificationModel>($"{_specsPath}/specifications", specification);
        }

        public Task<HttpStatusCode> UpdateSpecification(string specificationId, EditSpecificationModel specification)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(specification, nameof(specification));

            return PutAsync($"{_specsPath}/specification-edit?specificationId={specificationId}", specification);
        }

        public Task<ApiResponse<Policy>> CreatePolicy(CreatePolicyModel policy)
        {
            Guard.ArgumentNotNull(policy, nameof(policy));

            return PostAsync<Policy, CreatePolicyModel>($"{_specsPath}/policies", policy);
        }

        public Task<ValidatedApiResponse<Policy>> UpdateSubPolicy(string specificationId, string subPolicyId, EditSubPolicyModel subPolicy)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(subPolicyId, nameof(subPolicyId));
            Guard.ArgumentNotNull(subPolicy, nameof(subPolicy));

            return ValidatedPutAsync<Policy, EditSubPolicyModel>($"{_specsPath}/policies?specificationId={specificationId}&policyId={subPolicyId} ", subPolicy);
        }

        public Task<ValidatedApiResponse<Policy>> UpdatePolicy(string specificationId, string policyId, EditPolicyModel updatedPolicy)
        {
            Guard.ArgumentNotNull(updatedPolicy, nameof(updatedPolicy));

            return ValidatedPutAsync<Policy, EditPolicyModel>($"{_specsPath}/policies?specificationId={specificationId}&policyId={policyId}", updatedPolicy); 
        }

        public Task<ApiResponse<Calculation>> CreateCalculation(CalculationCreateModel calculation)
        {
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return PostAsync<Calculation, CalculationCreateModel>($"{_specsPath}/calculations", calculation);
        }

        public Task<ValidatedApiResponse<Calculation>> UpdateCalculation(string specificationId, string calculationId, CalculationUpdateModel calculation)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return ValidatedPutAsync<Calculation, CalculationUpdateModel>($"{_specsPath}/calculations?specificationId={specificationId}&calculationId={calculationId}", calculation);
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetFundingPeriods()
        {
            return GetAsync<IEnumerable<Reference>>($"{_specsPath}/get-fundingperiods");
        }

        public Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreams()
        {
            return GetAsync<IEnumerable<FundingStream>>($"{_specsPath}/get-fundingstreams");
        }

        public Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreamsForSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<IEnumerable<FundingStream>>($"{_specsPath}/get-fundingstreams-for-specification?specificationId={specificationId}");
        }

        public Task<ApiResponse<FundingStream>> GetFundingStreamByFundingStreamId(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            return GetAsync<FundingStream>($"{_specsPath}/get-fundingstream-by-id?fundingstreamId={fundingStreamId}");
        }

        public Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(policyName, nameof(policyName));

            PolicyByNameRequestModel model = new PolicyByNameRequestModel { SpecificationId = specificationId, Name = policyName };

            return PostAsync<Policy, PolicyByNameRequestModel>($"{_specsPath}/policy-by-name", model, _cancellationToken);
        }

        public Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationName, nameof(calculationName));

            CalculationByNameRequestModel model = new CalculationByNameRequestModel { SpecificationId = specificationId, Name = calculationName };

            return PostAsync<Calculation, CalculationByNameRequestModel>($"{_specsPath}/calculation-by-name", model, _cancellationToken);
        }

        public Task<ApiResponse<CalculationCurrentVersion>> GetCalculationById(string specificationId, string calculationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            return GetAsync<CalculationCurrentVersion>($"{_specsPath}/calculation-by-id?calculationId={calculationId}&specificationId={specificationId}");
        }

        public async Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<SpecificationDatasourceRelationshipSearchResultItem>> results = await PostAsync<SearchResults<SpecificationDatasourceRelationshipSearchResultItem>, SearchQueryRequest>($"{_specsPath}/specifications-dataset-relationships-search", request);
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

            ApiResponse<SearchResults<SpecificationSearchResultItem>> results = await PostAsync<SearchResults<SpecificationSearchResultItem>, SearchQueryRequest>($"{_specsPath}/specifications-search", request);
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

        public Task<ValidatedApiResponse<PublishStatusResult>> UpdatePublishStatus(string specificationId, PublishStatusEditModel model)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(model, nameof(model));

            return ValidatedPutAsync<PublishStatusResult, PublishStatusEditModel>($"{_specsPath}/specification-edit-status?specificationId={specificationId}", model);
        }

        public Task<HttpStatusCode> SelectSpecificationForFunding(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            
            return PostAsync($"{_specsPath}/select-for-funding?specificationId={specificationId}");
        }
    }
}