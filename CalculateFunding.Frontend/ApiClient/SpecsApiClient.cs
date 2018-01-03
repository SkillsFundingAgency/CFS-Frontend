using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;

namespace CalculateFunding.Frontend.ApiClient
{
    public class SpecsApiClient : AbstractApiClient, ISpecsApiClient
    {
        private string _specsPath;

        public SpecsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILoggingService logs)
            : base(options, httpClient, logs)
        {
            _specsPath = options.Value.SpecsPath ?? "/api/specs";
        }

        public Task<ApiResponse<List<Specification>>> GetSpecifications()
        {
            return GetAsync<List<Specification>>($"{_specsPath}/specifications");
        }

        public Task<ApiResponse<Specification>> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<Specification>($"{_specsPath}/budgets?budgetId={specificationId}");
        }

        public Task<HttpStatusCode> PostSpecification(Specification specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            return PostAsync($"{_specsPath}/budgets", specification);
        }

        public Task<HttpStatusCode> PostProduct(string specificationId, Product product)
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
    }
}

