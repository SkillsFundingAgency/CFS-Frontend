using CalculateFunding.Common.ApiClient.Providers.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class ProviderSearchController : Controller
    {
        private IProviderSearchService _providerSearchService;
        private readonly ICalculationProviderResultsSearchService _calculationProviderResultsSearchService;

        public ProviderSearchController(
            IProviderSearchService providerSearchService,
            ICalculationProviderResultsSearchService calculationProviderResultsSearchService)
        {
            Guard.ArgumentNotNull(providerSearchService, nameof(providerSearchService));
            Guard.ArgumentNotNull(calculationProviderResultsSearchService, nameof(calculationProviderResultsSearchService));

            _providerSearchService = providerSearchService;
            _calculationProviderResultsSearchService = calculationProviderResultsSearchService;
        }

        [HttpGet]
        [Route("api/providerversions/getbyfundingstream/{fundingStreamId}")]
        public async Task<IActionResult> GetProviderVersionsByFundingStream(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            IEnumerable<ProviderVersionMetadata> result = await _providerSearchService.GetProviderVersionsByFundingStream(fundingStreamId);
            if (result != null)
            {
                return Ok(result);
            }

            return new InternalServerErrorResult($"Cannot find provider versions for funding stream:{fundingStreamId}");
        }

        [HttpPost]
        [Route("api/results/calculation-provider-results-search")]
        public async Task<IActionResult> SearchCalculationProviderResults([FromBody] SearchRequestViewModel request, [FromQuery] string calculationValueType = null)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            CalculationProviderResultSearchResultViewModel searchResults = await _calculationProviderResultsSearchService.PerformSearch(request);

            if (calculationValueType != null)
            {
                CalculationValueTypeViewModel valueType = calculationValueType.AsEnum<CalculationValueTypeViewModel>();

                foreach (CalculationProviderResultSearchResultItemViewModel providerResult in searchResults.CalculationProviderResults)
                {
                    providerResult.SetCalculationResultDisplay(valueType);
                }
            }
             
            CalculationProviderResultSearchResultViewModel result = searchResults;

            if (result != null)
            {
                return Ok(result);
            }

            return new InternalServerErrorResult($"Find provider results HTTP request failed");
        }

        [HttpPost]
        [Route("api/results/calculationproviderresultssearch")]
        public async Task<IActionResult> SearchProviderResultsForCalculation([FromBody]CalculationProviderSearchRequestViewModel viewModel)
        {
            Guard.ArgumentNotNull(viewModel, nameof(viewModel));

            SearchRequestViewModel request = new SearchRequestViewModel
            {
	            Filters = new Dictionary<string, string[]>(),
	            FacetCount = viewModel.FacetCount,
	            IncludeFacets = viewModel.IncludeFacets,
	            PageNumber = viewModel.PageNumber,
	            PageSize = viewModel.PageSize,
	            SearchMode = viewModel.SearchMode,
                SearchFields = viewModel.SearchFields
            };

            if (!string.IsNullOrEmpty(viewModel.SearchTerm))
            {
                request.SearchTerm = viewModel.SearchTerm;
            }

            if (!string.IsNullOrEmpty(viewModel.ErrorToggle))
            {
	            request.ErrorToggle = "Errors";
            }

            if (viewModel.ProviderType != null && viewModel.ProviderType.Any())
            {
                request.Filters.Add("providerType", viewModel.ProviderType);
            }

            if (viewModel.ProviderSubType != null && viewModel.ProviderSubType.Any())
            {
                request.Filters.Add("providerSubType", viewModel.ProviderSubType);
            }

            if (viewModel.ResultsStatus != null && viewModel.ResultsStatus.Any())
            {
                request.Filters.Add("resultsStatus", viewModel.ResultsStatus);
            }

            if (viewModel.ResultsStatus != null && viewModel.LocalAuthority.Any())
            {
	            request.Filters.Add("localAuthority", viewModel.LocalAuthority);
            }

            if (!string.IsNullOrEmpty(viewModel.CalculationId))
            {
				request.Filters.Add("calculationId",new[]
				{
					viewModel.CalculationId
				});
            }

            CalculationProviderResultSearchResultViewModel results = await _calculationProviderResultsSearchService.PerformSearch(request);

            SearchFacetViewModel localAuthorityFacets = results?.Facets?.Where(_ => _.Name == "localAuthority")
                                            ?.FirstOrDefault();

            if(localAuthorityFacets != null)
            {
                localAuthorityFacets.FacetValues = localAuthorityFacets.FacetValues.OrderBy(_ => _.Name);
            }
            
            if (results != null)
            {
                return Ok(results);
            }

            return new InternalServerErrorResult($"Find provider results HTTP request failed");
        }
    }
}
