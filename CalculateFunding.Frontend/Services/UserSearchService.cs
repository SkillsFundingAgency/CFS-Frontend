using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.ViewModels.Common;
using Serilog;
using CalculateFunding.Common.Models.Search;
using SearchMode = CalculateFunding.Common.Models.Search.SearchMode;
using CalculateFunding.Frontend.ViewModels.Users;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.ApiClient.Users;

namespace CalculateFunding.Frontend.Services
{
    public class UserSearchService : IUserSearchService
	{
		private readonly IUsersApiClient _usersClient;
		private readonly IMapper _mapper;
		private readonly ILogger _logger;

        public UserSearchService(IUsersApiClient usersClient, IMapper mapper, ILogger logger)
		{
			Guard.ArgumentNotNull(usersClient, nameof(usersClient));
			Guard.ArgumentNotNull(mapper, nameof(mapper));
			Guard.ArgumentNotNull(logger, nameof(logger));

            _usersClient = usersClient;
			_mapper = mapper;
			_logger = logger;
        }

		public async Task<UserSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
		{
            Guard.ArgumentNotNull(request, nameof(request));

			int pageNumber = Math.Max(1, request.PageNumber ?? 1);
			int pageSize = request.PageSize ?? 50;

			SearchModel requestOptions = new SearchModel
			{
				PageNumber = pageNumber,
				Top = pageSize,
				SearchTerm = request.SearchTerm,
				IncludeFacets = request.IncludeFacets,
				Filters = request.Filters,
                SearchMode = SearchMode.All
            };

			ApiResponse<SearchResults<UserIndex>> searchRequestResult = await _usersClient.SearchUsers(requestOptions);

			if (searchRequestResult == null)
			{
				_logger.Error("Find users HTTP request failed");
				return null;
			}

			SearchResults<UserIndex> searchResults = searchRequestResult.Content;

            UserSearchResultViewModel result = new UserSearchResultViewModel
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

			List<UserSearchResultItemViewModel> itemResults = new List<UserSearchResultItemViewModel>();

			foreach (UserIndex searchResult in searchResults.Results)
			{
				itemResults.Add(_mapper.Map<UserSearchResultItemViewModel>(searchResult));
			}

			result.Users = itemResults.AsEnumerable();
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
    }
}
