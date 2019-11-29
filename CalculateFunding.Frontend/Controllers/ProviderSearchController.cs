using CalculateFunding.Common.Extensions;
using CalculateFunding.Frontend.ViewModels.Calculations;

namespace CalculateFunding.Frontend.Controllers
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using CalculateFunding.Common.ApiClient.Providers.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;

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

        [HttpPost]
        [Route("api/providerversions/getbyfundingstream")]
        public async Task<IActionResult> GetProviderVersionsByFundingStream([FromBody] string fundingStreamId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));

            IEnumerable<ProviderVersionMetadata> result = await _providerSearchService.GetProviderVersionsByFundingStream(fundingStreamId);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new InternalServerErrorResult($"Cannot find provider versions for funding stream:{fundingStreamId}");
            }
        }

        [HttpPost]
        [Route("api/results/searchproviders")]
        public async Task<IActionResult> SearchProviders([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            ProviderSearchResultViewModel result = await _providerSearchService.PerformSearch(request);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new InternalServerErrorResult($"Find providers HTTP request failed");
            }
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
    }
}
