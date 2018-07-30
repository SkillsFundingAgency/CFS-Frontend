namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Serilog;

    public class DatasetDefinitionSearchService : IDatasetDefinitionSearchService
    {
        private IDatasetsApiClient _datasetsClient;
        private IMapper _mapper;
        private ILogger _logger;

        public DatasetDefinitionSearchService(IDatasetsApiClient datasetsClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _datasetsClient = datasetsClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<DatasetDefinitionSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<DatasetDefinitionSearchResultItem> searchRequestResult = await _datasetsClient.FindDatasetDefinitions(requestOptions);
            if (searchRequestResult == null)
            {
                _logger.Error("Find datasets HTTP request failed");
                return null;
            }

            DatasetDefinitionSearchResultViewModel result = new DatasetDefinitionSearchResultViewModel
            {
                TotalResults = searchRequestResult.TotalItems,
                CurrentPage = searchRequestResult.PageNumber,
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (searchRequestResult.Facets != null)
            {
                foreach (SearchFacet facet in searchRequestResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<DatasetDefinitionSearchResultItemViewModel> itemResults = new List<DatasetDefinitionSearchResultItemViewModel>();

            foreach (DatasetDefinitionSearchResultItem searchResult in searchRequestResult.Items)
            {
                itemResults.Add(_mapper.Map<DatasetDefinitionSearchResultItemViewModel>(searchResult));
            }

            result.DatasetDefinitions = itemResults.AsEnumerable();
            if (result.TotalResults == 0)
            {
                result.StartItemNumber = 0;
                result.EndItemNumber = 0;
            }
            else
            {
                result.StartItemNumber = ((requestOptions.Page - 1) * requestOptions.PageSize) + 1;
                result.EndItemNumber = result.StartItemNumber + requestOptions.PageSize - 1;
            }

            if (result.EndItemNumber > searchRequestResult.TotalItems)
            {
                result.EndItemNumber = searchRequestResult.TotalItems;
            }

            result.PagerState = new PagerState(requestOptions.Page, searchRequestResult.TotalPages, 4);

            return result;
        }
    }
}
