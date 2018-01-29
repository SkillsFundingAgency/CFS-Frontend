using System.Threading.Tasks;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
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
        public async Task<IActionResult> SearchCalculations([FromBody] CalculationSearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            CalculationSearchResultViewModel result = await _calculationSearchService.PerformSearch(request);
            if(result != null)
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
