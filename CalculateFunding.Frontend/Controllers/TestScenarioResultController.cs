namespace CalculateFunding.Frontend.Controllers
{
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;

    public class TestScenarioResultController : Controller
    {
        private ITestScenarioResultsService _testScenarioResultsService;

        public TestScenarioResultController(ITestScenarioResultsService testScenarioResultsService)
        {
            Guard.ArgumentNotNull(testScenarioResultsService, nameof(testScenarioResultsService));

            _testScenarioResultsService = testScenarioResultsService;
        }

        [HttpPost]
        [Route("api/results/testscenarios")]
        public async Task<IActionResult> SearchTestScenarios([FromBody] TestScenarioResultRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            TestScenarioResultViewModel result = await _testScenarioResultsService.PerformSearch(request);

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