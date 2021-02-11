using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    public class CalculationProviderResultsSearchService : ICalculationProviderResultsSearchService
    {
        private readonly IResultsApiClient _resultsClient;
        private readonly ICalculationsApiClient _calculationsApiClient;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;

        public CalculationProviderResultsSearchService(
            IResultsApiClient resultsApiClient,
            ICalculationsApiClient calculationsApiClient,
            IMapper mapper,
            ILogger logger)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _resultsClient = resultsApiClient;
            _calculationsApiClient = calculationsApiClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CalculationProviderResultSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            int pageNumber = request.PageNumber.GetValueOrDefault(1);
            int pageSize = request.PageSize.GetValueOrDefault(50);

            ApiResponse<CalculationProviderResultSearchResults> searchRequestResult = await _resultsClient.SearchCalculationProviderResults(new SearchModel
            {
                PageNumber = pageNumber,
                Top = pageSize,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                ErrorToggle = string.IsNullOrWhiteSpace(request.ErrorToggle) ? (bool?)null : (request.ErrorToggle == "Errors"),
                Filters = request.Filters,
                SearchFields = request.SearchFields
            });

            if (searchRequestResult?.Content == null)
            {
                _logger.Error("Find providers HTTP request failed");
                return null;
            }

            CalculationProviderResultSearchResults calculationProviderResultSearchResults = searchRequestResult.Content;

            CalculationProviderResultSearchResultViewModel result = new CalculationProviderResultSearchResultViewModel
            {
                TotalResults = calculationProviderResultSearchResults.TotalCount,
                CurrentPage = pageNumber,
                TotalErrorResults = calculationProviderResultSearchResults.TotalErrorCount
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();

            if (calculationProviderResultSearchResults.Facets != null)
            {
                foreach (Facet facet in calculationProviderResultSearchResults.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<CalculationProviderResultSearchResultItemViewModel> itemResults = new List<CalculationProviderResultSearchResultItemViewModel>();

            Dictionary<string, CalculationValueTypeViewModel> calcTypes = new Dictionary<string, CalculationValueTypeViewModel>();

            foreach (CalculationProviderResultSearchResult searchresult in calculationProviderResultSearchResults.Results)
            {
                CalculationProviderResultSearchResultItemViewModel vmResult = _mapper.Map<CalculationProviderResultSearchResultItemViewModel>(searchresult);
                if (!calcTypes.ContainsKey(searchresult.CalculationId))
                {
                    ApiResponse<Common.ApiClient.Calcs.Models.Calculation> calcResult = await _calculationsApiClient.GetCalculationById(searchresult.CalculationId);
                    if (calcResult == null || calcResult.Content == null || calcResult.StatusCode != System.Net.HttpStatusCode.OK)
                    {
                        throw new InvalidOperationException($"Unable to get calculation details for calculation ID '{searchresult.CalculationId}'");
                    }

                    CalculationValueTypeViewModel calculationValueTypeViewModel = _mapper.Map<CalculationValueTypeViewModel>(calcResult.Content.ValueType);
                    calcTypes.Add(searchresult.CalculationId, calculationValueTypeViewModel);
                }

                vmResult.SetCalculationResultDisplay(calcTypes[searchresult.CalculationId]);
                itemResults.Add(vmResult);
            }

            result.CalculationProviderResults = itemResults.AsEnumerable();

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

            if (result.EndItemNumber > calculationProviderResultSearchResults.TotalCount)
            {
                result.EndItemNumber = calculationProviderResultSearchResults.TotalCount;
            }

            result.PagerState = new PagerState(pageNumber, (int)Math.Ceiling(calculationProviderResultSearchResults.TotalCount / (double)pageSize), 4);

            return result;
        }
    }
}
