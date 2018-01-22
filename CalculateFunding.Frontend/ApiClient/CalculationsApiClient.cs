using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Serilog;

namespace CalculateFunding.Frontend.ApiClient
{
    public class CalculationsApiClient : AbstractApiClient, ICalculationsApiClient
    {
        private List<Calculation> _calculations;

        public CalculationsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            _calculations = new List<Calculation>();
            for (int i = 0; i < 605; i++)
            {
                _calculations.Add(new Calculation()
                {
                    Id = $"{i}",
                    Description = $"This is calculation #{i + 1}",
                    Name = $"Calculation {i + 1}",
                    Specification = new Reference("1", "Test spec 1"),
                    Period = new Reference("1819", "2018/2019"),
                });
            }

        }

        public Task<Calculation> GetCalculationById(string draftSavedId)
        {
            return Task.FromResult(_calculations.FirstOrDefault(c => c.Id == draftSavedId));
        }

        public Task<PagedResult<Calculation>> GetCalculations(PagedQueryOptions queryOptions)
        {


            PagedResult<Calculation> result = new PagedResult<Calculation>()
            {
                PageNumber = queryOptions.Page,
                PageSize = queryOptions.PageSize,
                TotalItems = _calculations.Count,
                TotalPages = _calculations.Count / queryOptions.PageSize,

            };

            result.Items = _calculations.Skip((queryOptions.Page - 1) * queryOptions.PageSize).Take(queryOptions.PageSize);

            return Task.FromResult(result);
        }

        public async Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            return (await PostAsync<PreviewResponse, PreviewRequest>("api/v1/engine/preview", request).ConfigureAwait(false));
        }
    }
}

