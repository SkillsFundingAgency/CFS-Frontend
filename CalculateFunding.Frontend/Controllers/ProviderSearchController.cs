namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;

    public class ProviderSearchController : Controller
    {
        private IProviderSearchService _providerSearchService;

        public ProviderSearchController(IProviderSearchService providerSearchService)
        {
            Guard.ArgumentNotNull(providerSearchService, nameof(providerSearchService));

            _providerSearchService = providerSearchService;
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
                return new StatusCodeResult(500);
            }
        }
    }
}
