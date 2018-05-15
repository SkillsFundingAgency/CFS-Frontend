namespace CalculateFunding.Frontend.Clients.SpecsClient
{
    using System.Collections.Generic;
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

        public Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications(string fundingPeriodId)
        {
            return GetAsync<IEnumerable<Specification>>($"{_specsPath}/specifications-by-year?fundingPeriodId={fundingPeriodId}", _cancellationToken);
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

        public Task<HttpStatusCode> CreateSpecification(CreateSpecificationModel specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            return PostAsync($"{_specsPath}/specifications", specification);
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

        public Task<ApiResponse<Calculation>> CreateCalculation(CreateCalculationModel calculation)
        {
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return PostAsync<Calculation, CreateCalculationModel>($"{_specsPath}/calculations", calculation);
        }

        public Task<HttpStatusCode> CreateProduct(string specificationId, Product product)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(product, nameof(product));

            return PostAsync($"{_specsPath}/products?budgetId={specificationId}", product);
        }

        public Task<ApiResponse<Product>> GetProduct(string specificationId, string productId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(productId, nameof(productId));

            return GetAsync<Product>($"{_specsPath}/products?budgetId={specificationId}&productId={productId}");
        }

        public Task<ApiResponse<Specification[]>> GetBudgets()
        {
            return GetAsync<Specification[]>($"{_specsPath}/budgets");
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

        public Task<ApiResponse<Calculation>> GetCalculationById(string specificationId, string calculationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            return GetAsync<Calculation>($"{_specsPath}/calculation-by-id?calculationId={calculationId}&specificationId={specificationId}");
        }

        public async Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<SpecificationDatasourceRelationshipSearchResultItem>> results = await PostAsync<SearchResults<SpecificationDatasourceRelationshipSearchResultItem>, SearchQueryRequest>($"{_specsPath}/specifications-search", request);
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
    }
}