using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class ScenarioController : Controller
    {
        private IScenariosApiClient _scenariosClient;
        private IMapper _mapper;
        private ILogger _logger;

        public ScenarioController(IScenariosApiClient scenariosClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(scenariosClient, nameof(scenariosClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _scenariosClient = scenariosClient;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPut]
        [Route("api/specs/{specificationId}/scenarios")]
        public async Task<IActionResult> CreateTestScenario(string specificationId, [FromBody] ScenarioCreateViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CreateScenarioModel createScenario = _mapper.Map<CreateScenarioModel>(vm);
            createScenario.SpecificationId = specificationId;

            ApiResponse<Scenario> result = await _scenariosClient.CreateTestScenario(createScenario);

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
    }
}