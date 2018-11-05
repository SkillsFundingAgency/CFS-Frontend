namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;

    public class SpecificationSearchController : Controller
    {
        private ISpecificationSearchService _specificationSearchService;

        public SpecificationSearchController(ISpecificationSearchService specificationSearchService)
        {
            Guard.ArgumentNotNull(specificationSearchService, nameof(specificationSearchService));

            _specificationSearchService = specificationSearchService;
        }

        [HttpPost]
        [Route("api/specifications/search")]
        public async Task<IActionResult> SearchCalculations([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            SpecificationSearchResultViewModel result = await _specificationSearchService.PerformSearch(request);
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
