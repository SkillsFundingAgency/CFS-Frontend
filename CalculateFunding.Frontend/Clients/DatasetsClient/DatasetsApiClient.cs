using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Serilog;

namespace CalculateFunding.Frontend.Clients.DatasetsClient
{
    public class DatasetsApiClient : AbstractApiClient, IDatasetsApiClient
    {
        private string _datasetsPath = "datasets";

        public DatasetsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient,
            ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            Guard.ArgumentNotNull(options, nameof(options));

            _datasetsPath = options.Value.DatasetPath ?? "datasets";
        }

        public Task<PagedResult<DatasetSearchResultItem>> FindDatasets(SearchFilterRequest filterOptions)
        {
            PagedResult<DatasetSearchResultItem> result = new PagedResult<DatasetSearchResultItem>()
            {
                TotalPages = 1,
                TotalItems = 3,
                PageSize = 50,
                PageNumber = 1,
            };

            List<DatasetSearchResultItem> items = new List<DatasetSearchResultItem>();
            items.Add(new DatasetSearchResultItem()
            {
                Id = "1",
                LastUpdated = DateTime.Now.AddHours(-1),
                Name = "APT Adjusted Factors Test",
                Status = "Draft",
            });

            items.Add(new DatasetSearchResultItem()
            {
                Id = "2",
                LastUpdated = DateTime.Now.AddHours(-2),
                Name = "APT Adjusted Factors Test Asif",
                Status = "Published",
            });

            items.Add(new DatasetSearchResultItem()
            {
                Id = "3",
                LastUpdated = DateTime.Now.AddHours(-3),
                Name = "AP Adjusted Factors New Data",
                Status = "Updated",
            });

            result.Items = items;
            List<SearchFacet> facets = new List<SearchFacet>();
            facets.Add(new SearchFacet()
            {
                Name = "dataSchema",
                FacetValues = new List<SearchFacetValue>() { new SearchFacetValue() {  Name = "Schema 1", Count = 5}, new SearchFacetValue(){ Name = "Schema two", Count = 2 }
            }
            });

            facets.Add(new SearchFacet()
            {
                Name = "specification",
                FacetValues = new List<SearchFacetValue>() { new SearchFacetValue() {  Name = "Spec 1", Count = 50}, new SearchFacetValue(){ Name = "Spec 52", Count = 25 }
            }
            });

            facets.Add(new SearchFacet()
            {
                Name = "periodName",
                FacetValues = new List<SearchFacetValue>() { new SearchFacetValue() {  Name = "2017/18", Count = 2}, new SearchFacetValue(){ Name = "2018/2019", Count = 1 }
            }
            });

            facets.Add(new SearchFacet()
            {
                Name = "status",
                FacetValues = new List<SearchFacetValue>() { new SearchFacetValue() {  Name = "Draft", Count = 1}, new SearchFacetValue(){ Name = "Published", Count = 1 }, new SearchFacetValue(){ Name = "Updated", Count = 1 }
            }
            });

            result.Facets = facets;

            return Task.FromResult(result);
        }

        public Task<ApiResponse<IEnumerable<DatasetDefinition>>> GetListOfDatasetSchemaDefinitions()
        {
            return GetAsync<IEnumerable<DatasetDefinition>>($"{_datasetsPath}/"); //Write the actual backend path
        }

    }
}
