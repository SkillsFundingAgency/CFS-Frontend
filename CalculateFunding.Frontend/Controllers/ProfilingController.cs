using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Profiling;
using CalculateFunding.Common.ApiClient.Profiling.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Profiles;
using CalculateFunding.Frontend.ViewModels.Publish;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;

namespace CalculateFunding.Frontend.Controllers
{
    public class ProfilingController : Controller
    {
        private readonly IProfilingApiClient _profilingApiClient;
        private readonly IPublishingApiClient _publishingApiClient;

        public ProfilingController(IProfilingApiClient profilingApiClient,
            IPublishingApiClient publishingApiClient)
        {
            Guard.ArgumentNotNull(profilingApiClient, nameof(profilingApiClient));
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));

            _profilingApiClient = profilingApiClient;
            _publishingApiClient = publishingApiClient;
        }

        [HttpPost("api/profiling/preview")]
        public async Task<IActionResult> PreviewProfileChange([FromBody] ProfilePreviewRequestViewModel requestViewModel)
        {
            Guard.ArgumentNotNull(requestViewModel, nameof(requestViewModel));

            ApiResponse<IEnumerable<ProfileTotal>> profilePreview = await _publishingApiClient.PreviewProfileChange(new ProfilePreviewRequest
            {
                ConfigurationType = requestViewModel.ConfigurationType.AsMatchingEnum<Common.ApiClient.Publishing.Models.ProfileConfigurationType>(),
                ProviderId = requestViewModel.ProviderId,
                SpecificationId = requestViewModel.SpecificationId,
                FundingLineCode = requestViewModel.FundingLineCode,
                FundingPeriodId = requestViewModel.FundingPeriodId,
                FundingStreamId = requestViewModel.FundingStreamId,
                ProfilePatternKey = requestViewModel.ProfilePatternKey
            });

            IActionResult errorResult = profilePreview.IsSuccessOrReturnFailureResult(nameof(FundingStreamPeriodProfilePattern));

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(profilePreview.Content);
        }

        [HttpGet]
        [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/fundingLineId/{fundingLineId}")]
        public async Task<IActionResult> GetProfilingInstalments(
            string fundingStreamId,
            string fundingPeriodId,
            string fundingLineId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));
            Guard.ArgumentNotNull(fundingLineId, nameof(fundingLineId));

            ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>> apiResponse =
                await _profilingApiClient.GetProfilePatternsForFundingStreamAndFundingPeriod(fundingStreamId,
                    fundingPeriodId);

            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(nameof(FundingStreamPeriodProfilePattern));
            if (errorResult != null)
            {
                return errorResult;
            }

            IEnumerable<FundingStreamPeriodProfilePattern> fundingStreamPeriodProfilePatterns =
                apiResponse.Content;

            List<ProfilePeriodPattern> profilePatterns = fundingStreamPeriodProfilePatterns
                .Where(p => p.FundingLineId == fundingLineId)
                .SelectMany(p => p.ProfilePattern).ToList();

            return Ok(!profilePatterns.Any()
                ? new List<ProfilingInstallment>()
                : MapToProfilingInstallment(profilePatterns));
        }

        [HttpGet]
        [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/all")]
        public async Task<IActionResult> GetProfilePatterns(
            string fundingStreamId,
            string fundingPeriodId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<FundingStreamPeriodProfilePattern>> apiResponse =
                await _profilingApiClient.GetProfilePatternsForFundingStreamAndFundingPeriod(fundingStreamId,
                    fundingPeriodId);

            IActionResult errorResult =
                apiResponse.IsSuccessOrReturnFailureResult(nameof(FundingStreamPeriodProfilePattern));
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(apiResponse.Content);
        }

        [HttpGet]
        [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/fundingLineId/{fundingLineId}/fullpattern")]
        public async Task<IActionResult> GetProfilePatternByStreamPeriodAndLine(
            string fundingStreamId,
            string fundingPeriodId,
            string fundingLineId)
        {
            return await GetProfilePatternByStreamPeriodLineAndKey(fundingStreamId, fundingPeriodId, fundingLineId, null);
        }

        [HttpGet]
        [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/fundingLineId/{fundingLineId}/profilePatternKey/{profilePatternKey}/fullpattern")]
        public async Task<IActionResult> GetProfilePatternByStreamPeriodLineAndKey(
            string fundingStreamId,
            string fundingPeriodId,
            string fundingLineId,
            string profilePatternKey)
        {
            IActionResult profilingResult = await GetProfilePatterns(fundingStreamId, fundingPeriodId);

            if (!(profilingResult is OkObjectResult))
            {
                return profilingResult;
            }

            List<FundingStreamPeriodProfilePattern> profilePatterns = (List<FundingStreamPeriodProfilePattern>)(((OkObjectResult)profilingResult).Value);
            FundingStreamPeriodProfilePattern profilePattern = profilePatterns.Where(_ => _.FundingLineId == fundingLineId && 
                                ((string.IsNullOrEmpty(profilePatternKey) && string.IsNullOrEmpty(_.ProfilePatternKey)) || _.ProfilePatternKey == profilePatternKey)).FirstOrDefault();

            if(profilePattern == null)
            {
                return NotFound();
            }

            return Ok(profilePattern);
        }

        [HttpGet]
        [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/fundingLineId/{fundingLineId}/fullpattern/download-file")]
        public async Task<IActionResult> GetProfilePatternByStreamPeriodAndLineDownload(
            string fundingStreamId,
            string fundingPeriodId,
            string fundingLineId)
        {
            return await GetProfilePatternByStreamPeriodLineAndKeyDownload(fundingStreamId, fundingPeriodId, fundingLineId, null);
        }

        [HttpGet]
        [Route("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/fundingLineId/{fundingLineId}/profilePatternKey/{profilePatternKey}/fullpattern/download-file")]
        public async Task<IActionResult> GetProfilePatternByStreamPeriodLineAndKeyDownload(
            string fundingStreamId,
            string fundingPeriodId,
            string fundingLineId,
            string profilePatternKey)
        {
            IActionResult profilingResult = await GetProfilePatternByStreamPeriodLineAndKey(fundingStreamId, fundingPeriodId, fundingLineId, profilePatternKey);

            if (!(profilingResult is OkObjectResult))
            {
                return profilingResult;
            }

            FundingStreamPeriodProfilePattern profilePattern = (FundingStreamPeriodProfilePattern)(((OkObjectResult)profilingResult).Value);
            string profilePatternJson = profilePattern.AsJson();

            byte[] profilePatternBytes = !string.IsNullOrEmpty(profilePatternJson) ?
                                            Encoding.ASCII.GetBytes(profilePatternJson) :
                                            Array.Empty<byte>();

            string profilePatternKeyString = profilePattern.ProfilePatternKey == null ? string.Empty : $"-{profilePattern.ProfilePatternKey}";
            string filename = $"{fundingPeriodId}-{fundingStreamId}-{fundingLineId}{profilePatternKeyString}.json";

            Response.Headers[HeaderNames.ContentDisposition] = new ContentDisposition
            {
                FileName = filename,
                DispositionType = DispositionTypeNames.Inline,
                Inline = true
            }.ToString();

            return new FileContentResult(profilePatternBytes, "application/json");
        }

        [HttpPost("api/profiling/patterns/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/provider/{providerId}")]
        public async Task<IActionResult> AssignProfilePatternKeyToPublishedProvider(
            [FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId,
            [FromRoute] string providerId,
            [FromBody] ProfilePatternKey profilePatternKey)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));
            Guard.ArgumentNotNull(providerId, nameof(providerId));
            Guard.ArgumentNotNull(profilePatternKey, nameof(profilePatternKey));

            HttpStatusCode apiResponse =
                await _publishingApiClient.AssignProfilePatternKeyToPublishedProvider(
                    fundingStreamId, fundingPeriodId, providerId, profilePatternKey);

            return StatusCode((int)apiResponse);
        }

        private static List<ProfilingInstallment> MapToProfilingInstallment(
            IEnumerable<ProfilePeriodPattern> profilePatterns) =>
            profilePatterns
                .Select(profilingTotal =>
                    new ProfilingInstallment(
                        profilingTotal.PeriodYear,
                        profilingTotal.Period,
                        profilingTotal.Occurrence,
                        0,
                        profilingTotal.PeriodType.ToString()))
                .ToList();
    }
}