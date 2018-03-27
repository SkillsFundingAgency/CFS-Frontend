using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class TestEngineController : Controller
    {
        private readonly ITestEngineApiClient _testEngineApiClient;
        private readonly IMapper _mapper;

        public TestEngineController(ITestEngineApiClient testEngineApiClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(testEngineApiClient, nameof(testEngineApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _testEngineApiClient = testEngineApiClient;
            _mapper = mapper;
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/scenario-compile")]
        public async Task<IActionResult> CompileTestScenario(string specificationId, [FromBody] ScenarioCompileViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ScenarioCompileModel compileModel = _mapper.Map<ScenarioCompileModel>(vm);
            compileModel.SpecificationId = specificationId;

            ApiResponse<IEnumerable<ScenarioCompileError>> result = await _testEngineApiClient.CompileScenario(compileModel);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while compiling scenario test. Status code={result.StatusCode}");
            }

        }
    }
}
