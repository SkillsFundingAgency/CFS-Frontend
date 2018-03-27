using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class ScenarioController : Controller
    {
        private IScenariosApiClient _scenariosClient;
        private IMapper _mapper;

        public ScenarioController(IScenariosApiClient scenariosClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(scenariosClient, nameof(scenariosClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _scenariosClient = scenariosClient;
            _mapper = mapper;
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
                throw new InvalidOperationException($"An error occurred while saving scenario. Status code={result.StatusCode}");
            }

        }
    }
}