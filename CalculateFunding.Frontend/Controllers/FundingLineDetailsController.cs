using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Profiles;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineDetailsController : Controller
    {
        private readonly IPublishingApiClient _publishingApiClient;
        private readonly IProvidersApiClient _providersApiClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly IAuthorizationHelper _authorizationHelper;

        public FundingLineDetailsController(IPublishingApiClient publishingApiClient, IProvidersApiClient providersApiClient,
            ISpecificationsApiClient specificationsApiClient, IAuthorizationHelper authorizationHelper)
        {
            _publishingApiClient = publishingApiClient;
            _providersApiClient = providersApiClient;
            _specificationsApiClient = specificationsApiClient;
            _authorizationHelper = authorizationHelper;
        }

        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}/{fundingLineCode}")]
        public async Task<IActionResult> GetFundingLinePublishedProviderDetails(
            string specificationId,
            string providerId,
            string fundingStreamId,
            string fundingLineCode)
        {
            ApiResponse<FundingLineProfile> fundingLineApiResponse = await _publishingApiClient
                .GetFundingLinePublishedProviderDetails(
                    specificationId,
                    providerId,
                    fundingStreamId,
                    fundingLineCode);

            IActionResult errorResult =
                fundingLineApiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedProviderVersion));
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(fundingLineApiResponse.Content);
        }

        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}/{fundingLineCode}/change-exists")]
        public async Task<IActionResult> PreviousProfileExistsForSpecificationForProviderForFundingLine(
            string specificationId,
            string providerId,
            string fundingStreamId,
            string fundingLineCode)
        {
            ApiResponse<bool> fundingLineApiResponse = await _publishingApiClient
                .PreviousProfileExistsForSpecificationForProviderForFundingLine(
                    specificationId,
                    providerId,
                    fundingStreamId,
                    fundingLineCode);

            IActionResult errorResult =
                fundingLineApiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedProviderVersion));
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(fundingLineApiResponse.Content);
        }

        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}/{fundingLineCode}/changes")]
        public async Task<IActionResult> GetPreviousProfilesForSpecificationForProviderForFundingLine(
            string specificationId,
            string providerId,
            string fundingStreamId,
            string fundingLineCode)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(providerId, nameof(providerId));
            Guard.ArgumentNotNull(fundingLineCode, nameof(fundingLineCode));

            ApiResponse<IEnumerable<FundingLineChange>> fundingLineApiResponse = await _publishingApiClient
                .GetPreviousProfilesForSpecificationForProviderForFundingLine(
                    specificationId,
                    providerId,
                    fundingStreamId,
                    fundingLineCode);

            IActionResult fundingLineErrorResult =
                fundingLineApiResponse.IsSuccessOrReturnFailureResult(nameof(PublishedProviderVersion));
            if (fundingLineErrorResult != null)
            {
                return fundingLineErrorResult;
            }

            ApiResponse<ProviderVersionSearchResult> providerResponse =
                await _providersApiClient.GetCurrentProviderForFundingStream(fundingStreamId, providerId);
            IActionResult providerErrorResult =
                providerResponse.IsSuccessOrReturnFailureResult(nameof(ProviderVersionSearchResult));
            if (providerErrorResult != null)
            {
                return providerErrorResult;
            }

            ApiResponse<SpecificationSummary> specificationResponse = await _specificationsApiClient.GetSpecificationSummaryById(specificationId);
            IActionResult specificationErrorResult =
                specificationResponse.IsSuccessOrReturnFailureResult(nameof(SpecificationSummary));
            if (specificationErrorResult != null)
            {
                return specificationErrorResult;
            }

            SpecificationSummary specification = specificationResponse.Content;

            return Ok(new FundingLineChangesViewModel
            {
                    ProviderName = providerResponse.Content.Name,
                    SpecificationName = specification.Name,
                    FundingPeriodName = specification.FundingPeriod.Name,
                    FundingLineChanges = fundingLineApiResponse.Content
            });
        }

        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}")]
        public async Task<IActionResult> GetCurrentProfileConfig(
        [FromRoute] string specificationId,
            [FromRoute] string providerId,
            [FromRoute] string fundingStreamId)
        {
            ApiResponse<IEnumerable<FundingLineProfile>> fundingLineApiResponse = await _publishingApiClient
                .GetCurrentProfileConfig(
                    specificationId,
                    providerId,
                    fundingStreamId);

            IActionResult errorResult =
                fundingLineApiResponse.IsSuccessOrReturnFailureResult(nameof(GetCurrentProfileConfig));
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(fundingLineApiResponse.Content);
        }

        [HttpGet]
        [Route("api/publishedproviderfundingstructure/{publishedProviderVersionId}")]
        public async Task<IActionResult> GetPublishedProviderFundingStructure(
        [FromRoute] string publishedProviderVersionId)
        {
            string etag = Request.ReadETagHeaderValue();
            ApiResponse<PublishedProviderFundingStructure> fundingLineApiResponse = await _publishingApiClient
                .GetPublishedProviderFundingStructure(publishedProviderVersionId, etag);

            if (fundingLineApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

            IActionResult errorResult =
                fundingLineApiResponse.IsSuccessOrReturnFailureResult(nameof(GetPublishedProviderFundingStructure));
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(fundingLineApiResponse.Content);
        }

        [HttpPost]
        [Route("api/publishedproviderfundinglinedetails/customprofiles")]
        public async Task<IActionResult> ApplyCustomProfile([FromBody] ApplyCustomProfileRequest request)
        {
            if (!ModelState.IsValid)
            {
                return new BadRequestObjectResult(ModelState);
            }

            IEnumerable<FundingStreamPermission> fundingStreamPermissions = await _authorizationHelper.GetUserFundingStreamPermissions(User);

            if (fundingStreamPermissions.All(
                x => x.FundingStreamId == request.FundingStreamId && x.CanApplyCustomProfilePattern == false))
            {
                return new ForbidResult();
            }

            // TODO: Change Backend to return a ValidatedApiResponse instead of just a status code
            HttpStatusCode result = await _publishingApiClient.ApplyCustomProfilePattern(request);

            if (result == HttpStatusCode.BadRequest)
            {
                return new BadRequestObjectResult("One or more validation errors occurred.");
            }

            if (result == HttpStatusCode.NoContent)
            {
                return new NoContentResult();
            }

            return new InternalServerErrorResult($"Unable to apply custom profile - result '{result}'");
        }
    }
}
