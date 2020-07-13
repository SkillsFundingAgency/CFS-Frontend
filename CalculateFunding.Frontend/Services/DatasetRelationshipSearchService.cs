using System.Collections.Concurrent;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.ApiClient.Specifications.Models;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Serilog;

    public class DatasetRelationshipsSearchService : IDatasetRelationshipsSearchService
    {
        private const int PageSize = 20;

        private readonly ISpecificationsApiClient _specsClient;
        private readonly ILogger _logger;

        public DatasetRelationshipsSearchService(ISpecificationsApiClient specsClient, ILogger logger)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _specsClient = specsClient;
            _logger = logger;
        }

        public async Task<SpecificationDatasourceRelationshipSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
	        var filters = request.Filters.IsNullOrEmpty()
		        ? new ConcurrentDictionary<string, string[]>()
		        : request.Filters;
	        if (filters.ContainsKey(""))
	        {
		        filters.Remove("");
	        }

            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = filters
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<SpecificationDatasourceRelationshipSearchResultItem> pagedResult = await _specsClient.FindSpecificationAndRelationships(requestOptions);

            if (pagedResult == null)
            {
                _logger.Error("Find specification data source relationships HTTP request failed");
            }

            int totalPages = pagedResult.TotalItems / pagedResult.PageSize;
            if (pagedResult.TotalItems % pagedResult.PageSize > 0)
            {
                totalPages++;
            }

            int startNumber = ((pagedResult.PageSize * pagedResult.PageNumber) - pagedResult.PageSize) + 1;
            int endNumber = (pagedResult.PageSize * pagedResult.PageNumber);
            if (endNumber > pagedResult.TotalItems)
            {
                endNumber = pagedResult.TotalItems;
            }

            SpecificationDatasourceRelationshipSearchResultViewModel viewModel =
                new SpecificationDatasourceRelationshipSearchResultViewModel
                {
                    Items = pagedResult.Items,
                    PagerState = new PagerState(pagedResult.PageNumber, pagedResult.TotalPages),
                    TotalCount = pagedResult.TotalItems,
                    StartItemNumber = startNumber,
                    EndItemNumber = endNumber
                };

            return viewModel;
        }

        private string BuildCountPhrase(int relationshipCount)
        {
            if (relationshipCount == 0)
            {
                return "No data sources mapped to datasets";
            }
            else if (relationshipCount == 1)
            {
                return "1 data source mapped to dataset";
            }

            return $"{relationshipCount} data sources mapped to datasets";
        }
    }
}
