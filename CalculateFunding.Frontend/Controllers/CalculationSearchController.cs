using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class CalculationSearchController : Controller
    {
        private readonly ICalculationSearchService _calculationSearchService;

        public CalculationSearchController(ICalculationSearchService calculationSearchService)
        {
            Guard.ArgumentNotNull(calculationSearchService, nameof(calculationSearchService));
            _calculationSearchService = calculationSearchService;
        }

        [HttpGet("api/specifications/{specificationId}/calculations/calculationType/{calculationType}")]
        public async Task<IActionResult> SearchCalculationsForSpecification([FromRoute] string specificationId,
	        [FromRoute] CalculationType calculationType,
	        [FromQuery] PublishStatus? status,
	        [FromQuery] string searchTerm,
	        [FromQuery] int? page)
        {
	        return Ok(await _calculationSearchService.PerformSearch(specificationId,
		        calculationType,
		        status,
		        searchTerm,
		        page));
        }

        [HttpPost]
        [Route("api/calculations/search")]
        public async Task<IActionResult> SearchCalculations([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            request.FacetCount = 50;

            CalculationSearchResultViewModel result = await _calculationSearchService.PerformSearch(request);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }

        [HttpPost]
        [Route("api/calculations/getcalculationsforspecification")]
        public async Task<IActionResult> GetAdditionalCalculationsForSpecification([FromBody] CalculationSearchRequestViewModel viewModel)
        {
			Guard.IsNullOrWhiteSpace(viewModel.SpecificationId, nameof(viewModel.SpecificationId));
			Guard.ArgumentNotNull(viewModel.CalculationType, nameof(viewModel.CalculationType));

			SearchRequestViewModel request = new SearchRequestViewModel
			{
				FacetCount = 50,
				Filters = new Dictionary<string, string[]>
				{
					{"specificationId", new[] {viewModel.SpecificationId}}, 
					{"status", new[] {viewModel.Status}}, 
					{"calculationType", new[] {viewModel.CalculationType}}
				},
				PageNumber = viewModel.PageNumber,
				PageSize = 50,
                OrderBy = viewModel.OrderBy
            };

			if (!string.IsNullOrEmpty(viewModel.SearchTerm))
			{
				request.SearchTerm = viewModel.SearchTerm;
			}

			CalculationSearchResultViewModel result = await _calculationSearchService.PerformSearch(request);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
