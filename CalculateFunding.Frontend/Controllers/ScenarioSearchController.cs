namespace CalculateFunding.Frontend.Controllers
{
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;

    public class ScenarioSearchController : Controller
    {
        private IScenarioSearchService _scenarioSearchService;

        public ScenarioSearchController(IScenarioSearchService scenarioSearchService)
        {
            Guard.ArgumentNotNull(scenarioSearchService, nameof(scenarioSearchService));

            _scenarioSearchService = scenarioSearchService;
        }

        [HttpPost]
        [Route("api/scenarios/search")]
        public async Task<IActionResult> SearchScenarios([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            ScenarioSearchResultViewModel result = await _scenarioSearchService.PerformSearch(request);

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
