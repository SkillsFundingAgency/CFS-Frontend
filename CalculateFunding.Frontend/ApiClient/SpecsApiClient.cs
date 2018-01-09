using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.CreateModels;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace CalculateFunding.Frontend.ApiClient
{
    public class SpecsApiClient : AbstractApiClient, ISpecsApiClient
    {
        private string _specsPath;
        private readonly CancellationToken _cancellationToken;

        public SpecsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILoggingService logs, IHttpContextAccessor context)
            : base(options, httpClient, logs)
        {
            _specsPath = options.Value.SpecsPath ?? "specs";
            _cancellationToken = context.HttpContext.RequestAborted;
        }

        public Task<ApiResponse<List<Specification>>> GetSpecifications()
        {
            return GetAsync<List<Specification>>($"{_specsPath}/specifications", _cancellationToken);
        }

        public Task<ApiResponse<List<Specification>>> GetSpecifications(string academicYearId)
        {
            return GetAsync<List<Specification>>($"{_specsPath}/specifications-by-year?academicYearId={academicYearId}", _cancellationToken);
        }

        public Task<ApiResponse<Specification>> GetSpecificationByName(string specificationName)
        {
            Guard.IsNullOrWhiteSpace(specificationName, nameof(specificationName));

            return GetAsync<Specification>($"{_specsPath}/specification-by-name?specificationName={specificationName}", _cancellationToken);
        }

        public Task<ApiResponse<Specification>> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<Specification>($"{_specsPath}/specification?specificationId={specificationId}");
        }

        public Task<HttpStatusCode> PostSpecification(CreateSpecificationModel specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            return PostAsync($"{_specsPath}/specifications-create", specification);
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

        public Task<ApiResponse<IEnumerable<Reference>>> GetAcademicYears()
        {
            var years = new[]
            {
                new Reference("1819", "2018/19"),
                new Reference("1718", "2017/18"),
                new Reference("1617", "2016/17")
            };

            var response = new ApiResponse<IEnumerable<Reference>> (HttpStatusCode.OK, years.AsEnumerable());

            return Task.FromResult(response);
            //return GetAsync<Reference[]>($"{_specsPath}/academic-years");
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetFundingStreams()
        {
            return GetAsync<IEnumerable<Reference>>($"{_specsPath}/funding-streams");
        }
    }
}

