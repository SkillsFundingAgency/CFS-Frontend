using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models.GetModels;
using CalculateFunding.Frontend.Clients.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Serilog;

namespace CalculateFunding.Frontend.Clients.SpecsClient
{
    public class SpecsApiClient : AbstractApiClient, ISpecsApiClient
    {
        private string _specsPath;
        private readonly CancellationToken _cancellationToken;

        public SpecsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, IHttpContextAccessor context, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
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
            _logger.Information("This is from the FE");
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

            return GetAsync<Specification>($"{_specsPath}/specifications?specificationId={specificationId}");
        }

        public Task<HttpStatusCode> PostSpecification(CreateSpecificationModel specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            return PostAsync($"{_specsPath}/specifications", specification);
        }

        public Task<ApiResponse<Policy>> PostPolicy(CreatePolicyModel policy)
        {
            Guard.ArgumentNotNull(policy, nameof(policy));

            return PostAsync<Policy, CreatePolicyModel>($"{_specsPath}/policies", policy);
        }

        public Task<ApiResponse<Calculation>> PostCalculation(CreateCalculationModel calculation)
        {
            Guard.ArgumentNotNull(calculation, nameof(calculation));

            return PostAsync<Calculation, CreateCalculationModel>($"{_specsPath}/calculations", calculation);
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

            var response = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, years.AsEnumerable());

            return Task.FromResult(response);
            //return GetAsync<Reference[]>($"{_specsPath}/academic-years");
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetFundingStreams()
        {
            return GetAsync<IEnumerable<Reference>>($"{_specsPath}/funding-streams");
        }

        public Task<ApiResponse<IEnumerable<Reference>>> GetAllocationLines()
        {
            return GetAsync<IEnumerable<Reference>>($"{_specsPath}/allocation-lines");
        }

        public Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(policyName, nameof(policyName));

            PolicyGetModel model = new PolicyGetModel { SpecificationId = specificationId, Name = policyName };

            return PostAsync<Policy, PolicyGetModel>($"{_specsPath}/policy-by-name", model, _cancellationToken);
        }

        public Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(calculationName, nameof(calculationName));

            CalculationGetModel model = new CalculationGetModel { SpecificationId = specificationId, Name = calculationName };

            return PostAsync<Calculation, CalculationGetModel>($"{_specsPath}/calculation-by-name", model, _cancellationToken);
        }

        public Task<ApiResponse<Calculation>> GetCalculationById(string specificationId, string calculationId)
        {
            Guard.IsNullOrWhiteSpace(calculationId, nameof(calculationId));

            Calculation calc = new Calculation()
            {
                Id = calculationId,
                Description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus metus lacus, vitae rhoncus augue dapibus sed. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus vitae vulputate nunc. Aliquam cursus tellus sodales, ullamcorper nunc non, rutrum sem. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sagittis enim et volutpat ornare. Vivamus ornare nunc nec odio aliquam sagittis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus non nibh enim. Duis id quam at ligula vehicula facilisis. Nulla ligula mauris, pulvinar nec orci et, viverra varius sapien.",
                Name = "Auto generated in specs",
            };

            ApiResponse<Calculation> response = new ApiResponse<Calculation>(HttpStatusCode.OK, calc);

            return Task.FromResult(response);

            // return GetAsync<Calculation>($"{_specsPath}/calculation-by-id?calculationId={calculationId}&specificationId={specificationId}");
        }
    }
}

