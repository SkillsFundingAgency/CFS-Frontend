using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Clients.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Serilog;

namespace CalculateFunding.Frontend.Clients.CalcsClient
{
    public class CalculationsApiClient : AbstractApiClient, ICalculationsApiClient
    {
        private List<CalculationSearchResult> _calculations;

        public CalculationsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            _calculations = new List<CalculationSearchResult>();
            for (int i = 0; i < 605; i++)
            {
                _calculations.Add(new CalculationSearchResult()
                {
                    Id = $"{i}",
                    Description = $"This is calculation #{i + 1}",
                    Name = $"Calculation {i + 1}",
                    SpecificationName = "Test spec 1",
                    SpecificationId = "1",
                    PeriodName = "2018/2019",
                });
            }
        }

        public Task<Calculation> GetCalculationById(string calculationId)
        {
            CalculationSearchResult csr = _calculations.FirstOrDefault(c => c.Id == calculationId);
            Calculation result = null;
            if (csr != null)
            {
                result = new Calculation()
                {
                    Description = csr.Description,
                    Id = csr.Id,
                    Name = csr.Name,
                    Period = new Reference("1", csr.PeriodName),
                    Specification = new Reference(csr.SpecificationId, csr.SpecificationName),
                };
            }
            return Task.FromResult(result);
        }

        public Task<PagedResult<CalculationSearchResult>> FindCalculations(PagedQueryOptions queryOptions)
        {
            PagedResult<CalculationSearchResult> result = new PagedResult<CalculationSearchResult>()
            {
                PageNumber = queryOptions.Page,
                PageSize = queryOptions.PageSize,
                TotalItems = _calculations.Count,
                TotalPages = _calculations.Count / queryOptions.PageSize,

            };

            result.Items = _calculations.Skip((queryOptions.Page - 1) * queryOptions.PageSize).Take(queryOptions.PageSize);

            return Task.FromResult(result);
        }
    }
}

