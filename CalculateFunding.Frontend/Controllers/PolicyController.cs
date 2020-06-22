using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Policies.Models.FundingConfig;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class PolicyController : Controller
    {
        private readonly IPoliciesApiClient _policiesApiClient;

        public PolicyController(IPoliciesApiClient policiesApiClient)
        {
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            _policiesApiClient = policiesApiClient;
        }

        [HttpGet]
        [Route("api/policy/templates/{fundingStreamId}/{fundingPeriodId}/{templateVersion}")]
        public async Task<IActionResult> GetTemplates(string fundingStreamId, string fundingPeriodId, string templateVersion)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(templateVersion, nameof(templateVersion));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<FundingTemplateContents> apiResponse =
	            await _policiesApiClient.GetFundingTemplate(fundingStreamId, fundingPeriodId, templateVersion);

		    IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(FundingTemplateContents));

		    return errorResult ?? Ok(apiResponse.Content);
        }
        
        [HttpGet]
        [Route("api/policy/fundingperiods")]
        public async Task<IActionResult> GetFundingPeriods()
        {
            ApiResponse<IEnumerable<FundingPeriod>> response = await _policiesApiClient.GetFundingPeriods();

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }

        [HttpGet]
        [Route("api/policy/fundingstreams")]
        public async Task<IActionResult> GetFundingStreams()
        {
            ApiResponse<IEnumerable<FundingStream>> response = await _policiesApiClient.GetFundingStreams();

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content.OrderBy(x => x.Name));
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }

        [HttpGet]
        [Route("api/policy/fundingperiods/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingPeriods(string fundingStreamId)
        {
            Task<ApiResponse<IEnumerable<FundingConfiguration>>> fundingConfigsLookupTask = _policiesApiClient.GetFundingConfigurationsByFundingStreamId(fundingStreamId);

            Task<ApiResponse<IEnumerable<FundingPeriod>>> fundingPeriodsLookupTask = _policiesApiClient.GetFundingPeriods();

            await TaskHelper.WhenAllAndThrow(fundingConfigsLookupTask, fundingPeriodsLookupTask);

            IActionResult fundingConfigsLookupErrorResult = fundingConfigsLookupTask.Result.IsSuccessOrReturnFailureResult(nameof(FundingConfiguration));

            IActionResult fundingPeriodsLookupErrorResult = fundingPeriodsLookupTask.Result.IsSuccessOrReturnFailureResult(nameof(FundingPeriod));

            if (fundingConfigsLookupErrorResult != null)
            {
                return fundingConfigsLookupErrorResult;
            }

            if (fundingPeriodsLookupErrorResult != null)
            {
                return fundingPeriodsLookupErrorResult;
            }

            HashSet<string> fundingPeriodIds =
	            fundingConfigsLookupTask.Result.Content.Select(_ => _.FundingPeriodId)
		            .ToHashSet();

            IEnumerable<Reference> fundingPeriods =
	            fundingPeriodsLookupTask.Result.Content.Where(_ => fundingPeriodIds.Contains(_.Id));

            return new OkObjectResult(fundingPeriods.OrderBy(x => x.Name));
        }
    }
}
