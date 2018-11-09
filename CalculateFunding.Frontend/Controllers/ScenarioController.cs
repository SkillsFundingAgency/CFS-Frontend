using System;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace CalculateFunding.Frontend.Controllers
{
    public class ScenarioController : Controller
    {
        private IScenariosApiClient _scenariosClient;
        private IMapper _mapper;
        private ILogger _logger;
        private readonly IAuthorizationHelper _authorizationHelper;

        public ScenarioController(IScenariosApiClient scenariosClient, IMapper mapper, ILogger logger, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(scenariosClient, nameof(scenariosClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _scenariosClient = scenariosClient;
            _mapper = mapper;
            _logger = logger;
            _authorizationHelper = authorizationHelper;
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/testScenarios")]
        public async Task<IActionResult> CreateTestScenario(string specificationId, [FromBody] ScenarioCreateViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanCreateQaTests))
            {
                return new ForbidResult();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CreateScenarioModel createScenario = _mapper.Map<CreateScenarioModel>(vm);
            createScenario.SpecificationId = specificationId;

            ApiResponse<TestScenario> result = await _scenariosClient.CreateTestScenario(createScenario);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }
            else
            {
                HttpStatusCode statusCode = result.StatusCode;

                _logger.Error("An error occurred while saving scenario. Status code from backend={statusCode} for specification {specificationId}", statusCode, specificationId);

                throw new InvalidOperationException($"An error occurred while saving scenario. Status code={result.StatusCode}");
            }

        }

        /// <summary>
        /// This method saves changes of Name, Description and Gherkin code details of Scenario in 'Edit' mode
        /// </summary>
        /// <param name="specificationId"></param>
        /// <param name="vm"></param>
        /// <returns></returns>
        /// 
        [HttpPut]
        [Route("api/specs/{specificationId}/testscenarios/{testScenarioId}")]

        public async Task<IActionResult> SaveTestScenario(string specificationId, string testScenarioId, [FromBody] ScenarioEditViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanEditQaTests))
            {
                return new ForbidResult();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TestScenarioUpdateModel editScenario = _mapper.Map<TestScenarioUpdateModel>(vm);
            editScenario.SpecificationId = specificationId;
            editScenario.Id = testScenarioId;

            ApiResponse<TestScenario> result = await _scenariosClient.UpdateTestScenario(editScenario);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }
            else
            {
                HttpStatusCode statusCode = result.StatusCode;

                _logger.Error("An error occurred while updating scenario. Status code from backend={statusCode} for specification {specificationId}", statusCode, specificationId);

                throw new InvalidOperationException($"An error occurred while updating scenario. Status code={result.StatusCode}");
            }
        }

    }
}