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

    public class DatasetSearchService : IDatasetSearchService
    {
        private IDatasetsApiClient _datasetsClient;
        private IMapper _mapper;
        private ILogger _logger;

        public DatasetSearchService(IDatasetsApiClient datasetsClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _datasetsClient = datasetsClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<DatasetSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
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

            PagedResult<DatasetSearchResultItem> searchRequestResult = await _datasetsClient.FindDatasets(requestOptions);
            if (searchRequestResult == null)
            {
                _logger.Error("Find datasets HTTP request failed");
                return null;
            }

            DatasetSearchResultViewModel result = new DatasetSearchResultViewModel
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

            List<DatasetSearchResultItemViewModel> itemResults = new List<DatasetSearchResultItemViewModel>();

            foreach (DatasetSearchResultItem searchResult in searchRequestResult.Items)
            {
                itemResults.Add(_mapper.Map<DatasetSearchResultItemViewModel>(searchResult));
            }

            result.Datasets = itemResults.AsEnumerable();
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
