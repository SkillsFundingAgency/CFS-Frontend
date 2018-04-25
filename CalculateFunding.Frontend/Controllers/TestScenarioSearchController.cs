using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class TestScenarioSearchController : Controller
    {
        private ITestScenarioSearchService _testScenarioSearchService;

        public TestScenarioSearchController(ITestScenarioSearchService testScenarioSearchService)
        {
            Guard.ArgumentNotNull(testScenarioSearchService, nameof(testScenarioSearchService));
            _testScenarioSearchService = testScenarioSearchService;
        }

        [HttpPost]
        [Route("api/tests/testscenario-search")]

        public async Task<IActionResult> SearchTestScenarios([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            TestScenarioSearchResultViewModel result = await _testScenarioSearchService.PerformSearch(request);
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
