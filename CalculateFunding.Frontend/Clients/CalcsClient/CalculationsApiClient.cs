using System;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Serilog;

namespace CalculateFunding.Frontend.Clients.CalcsClient
{
    public class CalculationsApiClient : AbstractApiClient, ICalculationsApiClient
    {
        private string _calcsPath = "calcs";

        public CalculationsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            _calcsPath = options.Value.CalcsPath ?? "calcs";
        }

        public Task<ApiResponse<Calculation>> GetCalculationById(string calculationId)
        {
            return GetAsync<Calculation>($"{_calcsPath}/calculation-current-version?calculationId={calculationId}");
        }

        public async Task<PagedResult<CalculationSearchResultItem>> FindCalculations(PagedQueryOptions queryOptions)
        {
            CalculationSearchRequest request = new CalculationSearchRequest()
            {
                PageNumber = queryOptions.Page,
                Top = queryOptions.PageSize,
            };

            ApiResponse<CalculationSearchResults> results = await PostAsync<CalculationSearchResults, CalculationSearchRequest>($"{_calcsPath}/calculations-search", request);
            if (results.StatusCode == System.Net.HttpStatusCode.OK)
            {
                PagedResult<CalculationSearchResultItem> result = new PagedResult<CalculationSearchResultItem>()
                {
                    Items = results.Content.Results,
                    PageNumber = queryOptions.Page,
                    PageSize = queryOptions.PageSize,
                    TotalItems = results.Content.TotalCount,
                };

                if (results.Content.TotalCount == 0)
                {
                    result.TotalPages = 0;
                }
                else
                {
                    result.TotalPages = (int)Math.Ceiling((decimal)results.Content.TotalCount / queryOptions.PageSize);
                }
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

            return PostAsync<Calculation, CalculationUpdateModel>($"{_calcsPath}/calculation-save-version?calculationId={calculationId}", calculation);
        }

        public Task<ApiResponse<PreviewCompileResult>> PreviewCompile(PreviewCompileRequest request)
        {
            return PostAsync<PreviewCompileResult, PreviewCompileRequest>($"{_calcsPath}/compile-preview", request);
        }
    }
}

