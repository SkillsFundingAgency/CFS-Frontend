using System;
using CalculateFunding.Common.ApiClient.DataSets;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Serilog;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;

namespace CalculateFunding.Frontend.Services
{
    public class DatasetSearchService : IDatasetSearchService
	{
		private readonly IDatasetsApiClient _datasetsClient;
		private readonly IMapper _mapper;
		private readonly ILogger _logger;
        private readonly IFeatureToggle _featureToggle;

        public DatasetSearchService(IDatasetsApiClient datasetsClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
		{
			Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
			Guard.ArgumentNotNull(mapper, nameof(mapper));
			Guard.ArgumentNotNull(logger, nameof(logger));

			_datasetsClient = datasetsClient;
			_mapper = mapper;
			_logger = logger;
            _featureToggle = featureToggle;
        }

		public async Task<DatasetSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
		{
			int pageNumber = Math.Max(1, request.PageNumber.GetValueOrDefault(1));
			int pageSize = request.PageSize.GetValueOrDefault(50);
			
			SearchModel requestOptions = new SearchModel
			{
				PageNumber = pageNumber,
				Top = pageSize,
				SearchTerm = request.SearchTerm,
				IncludeFacets = request.IncludeFacets,
				Filters = request.Filters,
                SearchMode = _featureToggle.IsSearchModeAllEnabled() ? Common.Models.Search.SearchMode.All : Common.Models.Search.SearchMode.Any
            };

			ApiResponse<SearchResults<DatasetIndex>> searchRequestResult = await _datasetsClient.SearchDatasets(requestOptions);
			
			if (searchRequestResult == null)
			{
				_logger.Error("Find datasets HTTP request failed");
				return null;
			}

			SearchResults<DatasetIndex> searchResults = searchRequestResult.Content;
			
			DatasetSearchResultViewModel result = new DatasetSearchResultViewModel
			{
				TotalResults = searchResults.TotalCount,
				CurrentPage = pageNumber,
			};

			List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
			if (searchResults.Facets != null)
			{
				foreach (SearchFacet facet in searchResults.Facets)
				{
					searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
				}
			}

			result.Facets = searchFacets.AsEnumerable();

			List<DatasetSearchResultItemViewModel> itemResults = new List<DatasetSearchResultItemViewModel>();

			foreach (DatasetIndex searchResult in searchResults.Results)
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
				result.StartItemNumber = ((pageNumber - 1) * pageSize) + 1;
				result.EndItemNumber = result.StartItemNumber + pageSize - 1;
			}

			if (result.EndItemNumber > result.TotalResults)
			{
				result.EndItemNumber = result.TotalResults;
			}

			result.PagerState = new PagerState(pageNumber, (int)Math.Ceiling(result.TotalResults/(double)pageSize));

			return result;
		}

		public async Task<DatasetVersionSearchResultViewModel> PerformSearchDatasetVersion(SearchRequestViewModel searchRequest)
		{
			int pageNumber = Math.Max(1, searchRequest.PageNumber.GetValueOrDefault(1));
			int pageSize = searchRequest.PageSize.GetValueOrDefault(50);
			
			SearchModel requestOptions = new SearchModel
			{
				PageNumber = pageNumber,
				Top = pageSize,
				SearchTerm = searchRequest.SearchTerm,
				IncludeFacets = searchRequest.IncludeFacets,
				Filters = searchRequest.Filters,
				SearchMode = _featureToggle.IsSearchModeAllEnabled() ? Common.Models.Search.SearchMode.All : Common.Models.Search.SearchMode.Any
			};
			
			ApiResponse<SearchResults<DatasetVersionIndex>> searchRequestResult = await _datasetsClient.SearchDatasetVersion(requestOptions);

			if (searchRequestResult == null)
			{
				return null;
			}

			SearchResults<DatasetVersionIndex> searchResults = searchRequestResult.Content;

			DatasetVersionSearchResultViewModel datasetVersionSearchResultViewModel = 
				new DatasetVersionSearchResultViewModel(searchResults.Results, searchResults.TotalCount, pageNumber, (int)Math.Ceiling(searchResults.TotalCount/(double)pageSize), pageSize);

			return datasetVersionSearchResultViewModel;
		}
	}
}

