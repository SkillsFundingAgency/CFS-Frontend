namespace CalculateFunding.Frontend.Pages.Scenarios
{
    using System.Net;
    using System.Text.Encodings.Web;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.ApiClient.Specifications.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class EditTestScenarioPageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private IScenariosApiClient _scenariosClient;
        private IMapper _mapper;
        private ILogger _logger;
        private readonly IAuthorizationHelper _authorizationHelper;

        public EditTestScenarioPageModel(ISpecsApiClient specsClient, IScenariosApiClient scenariosApiClient, IMapper mapper, ILogger logger, IAuthorizationHelper authorizationHelper)
        {

            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(scenariosApiClient, nameof(scenariosApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _scenariosClient = scenariosApiClient;
            _mapper = mapper;
            _logger = logger;
            _authorizationHelper = authorizationHelper;
        }

        public string TestScenarioId { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public ScenarioEditViewModel EditScenarioViewModel { get; set; }

        public string DoesUserHavePermissionToSave { get; private set; }

        public async Task<IActionResult> OnGetAsync(string testScenarioId)
        {
            Guard.IsNullOrWhiteSpace(testScenarioId, nameof(testScenarioId));

            TestScenario scenario = await GetCurrentScenario(testScenarioId);

            if (scenario == null)
            {
                _logger.Warning("Test scenario response is null");
                return new NotFoundObjectResult("Test Scenario not found");
            }

            DoesUserHavePermissionToSave = (await _authorizationHelper.DoesUserHavePermission(User, scenario, SpecificationActionTypes.CanEditQaTests)).ToString().ToLowerInvariant();

            SpecificationSummary specResponse = await GetSpecification(scenario.SpecificationId);
            if (specResponse == null)
            {
                return new PreconditionFailedResult("Specification not found");
            }

            EditScenarioViewModel = new ScenarioEditViewModel
            {
                Name = JavaScriptEncoder.Default.Encode(scenario.Name),

                Gherkin = JavaScriptEncoder.Default.Encode(scenario.Gherkin),

                Description = JavaScriptEncoder.Default.Encode(scenario.Description)
            };

            TestScenarioId = testScenarioId;
            SpecificationId = scenario.SpecificationId;
            SpecificationName = specResponse.Name;

            return Page();
        }

        private async Task<TestScenario> GetCurrentScenario(string testScenarioId)
        {
            Guard.IsNullOrWhiteSpace(testScenarioId, nameof(testScenarioId));

            ApiResponse<TestScenario> testScenarioResponse = await _scenariosClient.GetCurrentTestScenarioById(testScenarioId);

            if (testScenarioResponse != null && testScenarioResponse.StatusCode == HttpStatusCode.OK)
            {
                return testScenarioResponse.Content;
            }

            return null;
        }

        private async Task<SpecificationSummary> GetSpecification(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(specificationId);

            if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                return specificationResponse.Content;
            }

            return null;
        }

    }
}