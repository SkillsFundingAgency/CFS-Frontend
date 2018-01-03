using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
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

        public Task<ApiResponse<Specification>> GetBudget(string id)
        {
            return GetAsync<Specification>($"{_specsPath}/budgets?budgetId={id}");
        }

        public Task<HttpStatusCode> PostBudget(Specification budget)
        {
            return PostAsync($"{_specsPath}/budgets", budget);
        }

        public Task<HttpStatusCode> PostProduct(string budgetId, Product product)
        {
            return PostAsync($"{_specsPath}/products?budgetId={budgetId}", product);
        }

        public Task<ApiResponse<Product>> GetProduct(string budgetId, string productId)
        {
            return GetAsync<Product>($"{_specsPath}/products?budgetId={budgetId}&productId={productId}");
        }

        public Task<ApiResponse<Specification[]>> GetBudgets()
        {
            return GetAsync<Specification[]>($"{_specsPath}/budgets");
        }
    }
}

