﻿using System;
using CalculateFunding.Common.ApiClient.DataSets;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Serilog;
using CalculateFunding.Common.Models.Search;
using SearchMode = CalculateFunding.Common.Models.Search.SearchMode;

namespace CalculateFunding.Frontend.Services
{
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
            Guard.ArgumentNotNull(request, nameof(request));

	        int pageNumber = Math.Max(1, request.PageNumber.GetValueOrDefault(1));
	        int pageSize = request.PageSize.GetValueOrDefault(50);
	        
	        SearchModel requestOptions = new SearchModel
            {
                PageNumber = pageNumber,
                Top = pageSize,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                SearchMode = request.SearchMode.AsMatchingEnum<SearchMode>(),
                FacetCount = request.FacetCount
            };

	        ApiResponse<SearchResults<DatasetDefinitionIndex>> searchRequestResult = await _datasetsClient.SearchDatasetDefinitions(requestOptions);
            if (searchRequestResult == null)
            {
                _logger.Error("Find datasets HTTP request failed");
                return null;
            }

            SearchResults<DatasetDefinitionIndex> searchResults = searchRequestResult.Content;
            
            DatasetDefinitionSearchResultViewModel result = new DatasetDefinitionSearchResultViewModel
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

            List<DatasetDefinitionSearchResultItemViewModel> itemResults = new List<DatasetDefinitionSearchResultItemViewModel>();

            foreach (DatasetDefinitionIndex searchResult in searchResults.Results)
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
                result.StartItemNumber = ((pageNumber - 1) * pageSize) + 1;
                result.EndItemNumber = result.StartItemNumber + pageSize - 1;
            }

            if (result.EndItemNumber > searchResults.TotalCount)
            {
                result.EndItemNumber = searchResults.TotalCount;
            }

            result.PagerState = new PagerState(pageNumber, (int)Math.Ceiling(searchResults.TotalCount/(double)pageSize), 4);

            return result;
        }
    }
}
