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
                    CalculationSpecification = new Reference($"{i}", $"Calculation {i + 1}"),
                });
            }
        }

        public Task<Calculation> GetCalculationById(string calculationId)
        {
            return Task.FromResult(_calculations.FirstOrDefault(c => c.Id == calculationId));
        }

        public Task<PagedResult<CalculationSearchResultItem>> FindCalculations(PagedQueryOptions queryOptions)
        {
            PagedResult<CalculationSearchResultItem> result = new PagedResult<CalculationSearchResultItem>()
            {
                PageNumber = queryOptions.Page,
                PageSize = queryOptions.PageSize,
                TotalItems = _calculations.Count,
                TotalPages = _calculations.Count / queryOptions.PageSize,

            };

            result.Items = _calculations.Skip((queryOptions.Page - 1) * queryOptions.PageSize).Take(queryOptions.PageSize).Select(c => new CalculationSearchResultItem()
            {
                Id = c.Id,
                Name = c.Name,
                PeriodName = c.Period.Name,
                SpecificationName = c.Specification.Name,
                Status = "Unknown"
            });

            return Task.FromResult(result);
        }
    }
}

