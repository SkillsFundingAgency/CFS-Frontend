﻿using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class TestEngineController : Controller
    {
        private readonly ITestEngineApiClient _testEngineApiClient;
        private readonly IMapper _mapper;
        private readonly ITestResultsSearchService _testResultsSearchService;

        public TestEngineController(ITestEngineApiClient testEngineApiClient, IMapper mapper, ITestResultsSearchService testResultsSearchService)
        {
            Guard.ArgumentNotNull(testEngineApiClient, nameof(testEngineApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(testResultsSearchService, nameof(testResultsSearchService));

            _testEngineApiClient = testEngineApiClient;
            _mapper = mapper;
            _testResultsSearchService = testResultsSearchService;
        }

        [HttpPost]
        [Route("api/specs/{specificationId}/scenario-compile")]
        public async Task<IActionResult> CompileTestScenario(string specificationId, [FromBody] ScenarioCompileViewModel vm)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
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

        [HttpPost]
        [Route("api/tests/search-providers-results")]
        public async Task<IActionResult> SearchProviders([FromBody] SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            ProviderTestsSearchResultViewModel result = await _testResultsSearchService.PerformProviderTestResultsSearch(request);

            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }

        [HttpGet]
        [Route("api/specs/{specificationId}/providertestcounts/{providerId}")]
        public async Task<IActionResult> GetTestResultCountsForSpecificationAndProvider([FromRoute]string specificationId, [FromRoute] string providerId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<ResultCounts> countResponse = await _testEngineApiClient.GetTestScenarioCountsForProviderForSpecification(specificationId, providerId);
            IActionResult errorResult = countResponse.IsSuccessOrReturnFailureResult("Test Scenario Counts");

            if (errorResult == null)
            {
                ResultCountsViewModel result = _mapper.Map<ResultCountsViewModel>(countResponse.Content);
                return Ok(result);
            }
            else
            {
                return errorResult;
            }
        }

        [HttpPost]
        [Route("api/tests/get-testscenario-result-counts-for-specifications")]
        public async Task<IActionResult> GetTestScenarioCountsForSpecifications([FromBody] SpecificationIdsRequestModel specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            ApiResponse<IEnumerable<SpecificationTestScenarioResultCounts>> response = await _testEngineApiClient.GetTestScenarioCountsForSpecifications(specificationIds);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }
            else
            {
                throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
            }
        }
    }
}
