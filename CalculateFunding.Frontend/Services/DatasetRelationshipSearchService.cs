namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Serilog;

    public class DatasetRelationshipsSearchService : IDatasetRelationshipsSearchService
    {
        private const int PageSize = 20;

        private readonly ISpecsApiClient _specsClient;
        private readonly ILogger _logger;

        public DatasetRelationshipsSearchService(ISpecsApiClient specsClient, ILogger logger)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _specsClient = specsClient;
            _logger = logger;
        }

        public async Task<SpecificationDatasourceRelationshipSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = false,
                Filters = request.Filters,
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

            SpecificationDatasourceRelationshipSearchResultViewModel viewModel = new SpecificationDatasourceRelationshipSearchResultViewModel();

            viewModel.TotalResults = pagedResult.TotalItems;
            viewModel.CurrentPage = pagedResult.PageNumber;

            IList<SpecificationDatasourceRelationshipSearchResultItemViewModel> itemResults = new List<SpecificationDatasourceRelationshipSearchResultItemViewModel>();

            foreach (SpecificationDatasourceRelationshipSearchResultItem item in pagedResult.Items)
            {
                itemResults.Add(new SpecificationDatasourceRelationshipSearchResultItemViewModel
                {
                    SpecificationId = item.Id,
                    SpecificationName = item.Name,
                    CountPhrase = BuildCountPhrase(item.RelationshipCount)
                });
            }

            IEnumerable<SpecificationDatasourceRelationshipSearchResultItemViewModel> sortedResults = itemResults.OrderBy(f => f.SpecificationName);

            viewModel.SpecRelationships = sortedResults.ToList();

            if (viewModel.TotalResults == 0)
            {
                viewModel.StartItemNumber = 0;
                viewModel.EndItemNumber = 0;
            }
            else
            {
                viewModel.StartItemNumber = ((requestOptions.Page - 1) * requestOptions.PageSize) + 1;
                viewModel.EndItemNumber = viewModel.StartItemNumber + requestOptions.PageSize - 1;
            }

            if (viewModel.EndItemNumber > pagedResult.TotalItems)
            {
                viewModel.EndItemNumber = pagedResult.TotalItems;
            }

            viewModel.PagerState = new PagerState(requestOptions.Page, pagedResult.TotalPages, 4);

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
