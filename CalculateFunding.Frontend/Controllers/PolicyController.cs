﻿using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Policies.Models.FundingConfig;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class PolicyController : Controller
    {
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IAuthorizationHelper _authorizationHelper;

        public PolicyController(IPoliciesApiClient policiesApiClient, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _policiesApiClient = policiesApiClient;
            _authorizationHelper = authorizationHelper;
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
        [Route("api/policy/templates/{fundingStreamId}/{fundingPeriodId}")]
        public async Task<IActionResult> GetTemplatesByFundingStreamAndFundingPeriod(string fundingStreamId, string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<PublishedFundingTemplate>> apiResponse =
                await _policiesApiClient.GetFundingTemplates(fundingStreamId, fundingPeriodId);

            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedFundingTemplate));

            return errorResult ?? Ok(apiResponse.Content);
        }

        [HttpGet]
        [Route("api/policy/configuration/{fundingStreamId}/{fundingPeriodId}")]
        public async Task<IActionResult> GetFundingConfiguration(string fundingStreamId, string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            
            ApiResponse<FundingConfiguration> apiResponse = await _policiesApiClient.GetFundingConfiguration(fundingStreamId, fundingPeriodId);
            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(FundingConfiguration));
            if (errorResult != null)
            {
                return errorResult;
            }

            return new OkObjectResult(apiResponse.Content);
        }

        [HttpGet]
        [Route("api/policy/configuration/{fundingStreamId}/{fundingPeriodId}/download-file")]
        public async Task<IActionResult> GetFundingConfigurationDownload(string fundingStreamId, string fundingPeriodId)
        {
            IActionResult fundingConfigurationResult = await GetFundingConfiguration(fundingStreamId, fundingPeriodId);

            if(!(fundingConfigurationResult is OkObjectResult))
            {
                return fundingConfigurationResult;
            }

            string fundingConfigurationJson = ((FundingConfiguration)((OkObjectResult)fundingConfigurationResult).Value).AsJson();

            byte[] configurationBytes = !string.IsNullOrEmpty(fundingConfigurationJson) ?
                                            Encoding.ASCII.GetBytes(fundingConfigurationJson) :
                                            Array.Empty<byte>();

            string filename = $"{fundingStreamId}-{fundingPeriodId}-configuration.json";

            Response.Headers[HeaderNames.ContentDisposition] = new ContentDisposition
            {
                FileName = filename,
                DispositionType = DispositionTypeNames.Inline,
                Inline = true
            }.ToString();

            return new FileContentResult(configurationBytes, "application/json");
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
        [Route("api/policy/fundingstreams/{securityTrimmed}")]
        public async Task<IActionResult> GetFundingStreams(bool securityTrimmed)
        {
            ApiResponse<IEnumerable<FundingStream>> response = await _policiesApiClient.GetFundingStreams();

            if (response.StatusCode == HttpStatusCode.OK)
            {
                IEnumerable<FundingStream> fundingStreams = response.Content.OrderBy(x => x.Name);

                if (securityTrimmed)
                {
                    IEnumerable<Task<FundingStream>> tasks = fundingStreams.Select(async (_) =>
                    {
                        FundingStreamPermission permission = await _authorizationHelper.GetUserFundingStreamPermissions(User, _.Id);
                        return permission != null ? (permission.CanCreateSpecification ? _ : null) : null;
                    });

                    fundingStreams = await Task.WhenAll(tasks);
                }

                return Ok(fundingStreams.Where(_ => _ != null));
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }

        [HttpGet]
        [Route("api/policy/fundingstream-by-id/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingStreamById(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<FundingStream> apiResponse = await _policiesApiClient.GetFundingStreamById(fundingStreamId);

            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedFundingTemplate));

            return errorResult ?? Ok(apiResponse.Content);
        }

        [HttpGet]
        [Route("api/policy/fundingperiods/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingPeriods(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

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

        [HttpGet]
        [Route("api/policy/templates/{fundingStreamId}/{fundingPeriodId}/{templateVersion}/metadata/distinct")]
        public async Task<IActionResult> GetDistinctTemplateMetadataContents(string fundingStreamId, string fundingPeriodId, string templateVersion)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(templateVersion, nameof(templateVersion));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<TemplateMetadataDistinctContents> apiResponse =
                await _policiesApiClient.GetDistinctTemplateMetadataContents(fundingStreamId, fundingPeriodId, templateVersion);

            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(TemplateMetadataDistinctContents));

            return errorResult ?? Ok(apiResponse.Content);
        }

        [HttpGet]
        [Route("api/policy/templates/{fundingStreamId}/{fundingPeriodId}/{templateVersion}/metadata/distinct/funding-lines")]
        public async Task<IActionResult> GetDistinctTemplateMetadataFundingLinesContents(string fundingStreamId, string fundingPeriodId, string templateVersion)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(templateVersion, nameof(templateVersion));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<TemplateMetadataDistinctFundingLinesContents> apiResponse =
                await _policiesApiClient.GetDistinctTemplateMetadataFundingLinesContents(fundingStreamId, fundingPeriodId, templateVersion);

            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(TemplateMetadataDistinctFundingLinesContents));

            return errorResult ?? Ok(apiResponse.Content);
        }

        [HttpGet]
        [Route("api/policy/templates/{fundingStreamId}/{fundingPeriodId}/{templateVersion}/metadata/distinct/calculations")]
        public async Task<IActionResult> GetDistinctTemplateMetadataCalculationsContents(string fundingStreamId, string fundingPeriodId, string templateVersion)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(templateVersion, nameof(templateVersion));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<TemplateMetadataDistinctCalculationsContents> apiResponse =
                await _policiesApiClient.GetDistinctTemplateMetadataCalculationsContents(fundingStreamId, fundingPeriodId, templateVersion);

            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(TemplateMetadataDistinctCalculationsContents));

            return errorResult ?? Ok(apiResponse.Content);
        }
    }
}