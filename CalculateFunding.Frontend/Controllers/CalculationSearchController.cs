namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Microsoft.AspNetCore.Mvc;

    public class CalculationSearchController : Controller
    {
        private ICalculationSearchService _calculationSearchService;

        public CalculationSearchController(ICalculationSearchService calculationSearchService)
        {
            Guard.ArgumentNotNull(calculationSearchService, nameof(calculationSearchService));
            _calculationSearchService = calculationSearchService;
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
    }
}
