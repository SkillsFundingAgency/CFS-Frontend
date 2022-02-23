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
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models.FundingConfig;
using CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineDetailsController : Controller
    {
        private readonly IPublishingApiClient _publishingApiClient;
        private readonly IProvidersApiClient _providersApiClient;
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IAuthorizationHelper _authorizationHelper;

        public FundingLineDetailsController(IPublishingApiClient publishingApiClient, IProvidersApiClient providersApiClient,
            ISpecificationsApiClient specificationsApiClient, IPoliciesApiClient policiesApiClient, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _publishingApiClient = publishingApiClient;
            _providersApiClient = providersApiClient;
            _specificationsApiClient = specificationsApiClient;
            _policiesApiClient = policiesApiClient;
            _authorizationHelper = authorizationHelper;
        }

        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}/{fundingPeriodId}/{fundingLineCode}")]
        public async Task<IActionResult> GetFundingLinePublishedProviderDetails(
            string specificationId,
            string providerId,
            string fundingStreamId,
            string fundingLineCode,
            string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(fundingLineCode, nameof(fundingLineCode));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<FundingConfiguration> fundingConfigResponse = await _policiesApiClient.GetFundingConfiguration(fundingStreamId, fundingPeriodId);
            IActionResult fundingConfigErrorResponse =
                fundingConfigResponse.IsSuccessOrReturnFailureResult(nameof(FundingConfiguration));
            if (fundingConfigErrorResponse != null)
            {
                return fundingConfigErrorResponse;
            }

            ApiResponse<FundingLineProfile> fundingLineApiResponse = await _publishingApiClient
                .GetFundingLinePublishedProviderDetails(
                    specificationId,
                    providerId,
                    fundingStreamId,
                    fundingLineCode);

            IActionResult fundingLineApiErrorResponse =
                fundingLineApiResponse.IsSuccessOrReturnFailureResult(nameof(FundingLineProfile));
            if (fundingLineApiErrorResponse != null)
            {
                return fundingLineApiErrorResponse;
            }

            ApiResponse<SpecificationSummary> specificationResponse = await _specificationsApiClient.GetSpecificationSummaryById(specificationId);
            IActionResult specificationErrorResult =
                specificationResponse.IsSuccessOrReturnFailureResult(nameof(SpecificationSummary));
            if (specificationErrorResult != null)
            {
                return specificationErrorResult;
            }

            ApiResponse<ProviderVersionSearchResult> providerResponse =
                await _providersApiClient.GetProviderByIdFromProviderVersion(specificationResponse.Content.ProviderVersionId, providerId);
            IActionResult providerErrorResult =
                providerResponse.IsSuccessOrReturnFailureResult(nameof(ProviderVersionSearchResult));
            if (providerErrorResult != null)
            {
                return providerErrorResult;
            }

            FundingConfiguration fundingConfiguration = fundingConfigResponse.Content;

            FundingLineProfileViewModel fundingLineProfileViewModel = new FundingLineProfileViewModel()
            {
                FundingLineProfile = fundingLineApiResponse.Content,
                EnableUserEditableCustomProfiles = fundingConfiguration.EnableUserEditableCustomProfiles,
                EnableUserEditableRuleBasedProfiles = fundingConfiguration.EnableUserEditableRuleBasedProfiles,
                ContractedProvider = IsContractedProvider(fundingConfiguration, providerResponse.Content)
            };

            return Ok(fundingLineProfileViewModel);
        }

        private bool IsContractedProvider(FundingConfiguration fundingConfiguration, ProviderVersionSearchResult providerVersionSearchResult)
        {
            IEnumerable<string> contractedTypes = fundingConfiguration.OrganisationGroupings
                .Where(_ => _.GroupingReason == GroupingReason.Contracting)
                .SelectMany(s => s.ProviderTypeMatch)
                .Select(s => s.ProviderType);

            return contractedTypes.Contains(providerVersionSearchResult.ProviderType);
        }


        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}/{fundingLineCode}/change-exists")]
        public async Task<IActionResult> PreviousProfileExistsForSpecificationForProviderForFundingLine(
            string specificationId,
            string providerId,
            string fundingStreamId,
            string fundingLineCode)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(fundingLineCode, nameof(fundingLineCode));

            ApiResponse<bool> fundingLineApiResponse = await _publishingApiClient
                .PreviousProfileExistsForSpecificationForProviderForFundingLine(
                    specificationId,
                    providerId,
                    fundingStreamId,
                    fundingLineCode);

            if (fundingLineApiResponse.StatusCode == HttpStatusCode.OK)
            {
                return Ok(fundingLineApiResponse.Content);
            }

            return new InternalServerErrorResult($"An error occurred when checking for previous profiles.");
        }

        [HttpGet]
        [Route("api/publishedproviderfundinglinedetails/{specificationId}/{providerId}/{fundingStreamId}/{fundingLineCode}/{providerVersionId}/changes")]
        public async Task<IActionResult> GetPreviousProfilesForSpecificationForProviderForFundingLine(
            string specificationId,
            string providerId,
            string fundingStreamId,
            string fundingLineCode,
            string providerVersionId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(fundingLineCode, nameof(fundingLineCode));
            Guard.IsNullOrWhiteSpace(providerVersionId, nameof(providerVersionId));

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
                await _providersApiClient.GetProviderByIdFromProviderVersion(providerVersionId, providerId);
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
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

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

        [HttpPost]
        [Route("api/publishedProviderFundingLineDetails/customProfiles")]
        public async Task<IActionResult> ApplyCustomProfile([FromBody] ApplyCustomProfileRequest request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

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

            NoValidatedContentApiResponse result = await _publishingApiClient.ApplyCustomProfilePattern(request);

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.ModelState);
            }

            if (result.StatusCode == HttpStatusCode.InternalServerError)
            {
                return new InternalServerErrorResult($"Unable to apply custom profile. An error has occurred.'");
            }

            return StatusCode((int)result.StatusCode);
        }
    }
}
