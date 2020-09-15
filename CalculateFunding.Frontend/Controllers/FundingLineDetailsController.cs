using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineDetailsController : Controller
    {
        private readonly IPublishingApiClient _publishingApiClient;

        public FundingLineDetailsController(IPublishingApiClient publishingApiClient)
        {
            _publishingApiClient = publishingApiClient;
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
            ApiResponse<IEnumerable<FundingLineChange>> fundingLineApiResponse = await _publishingApiClient
                .GetPreviousProfilesForSpecificationForProviderForFundingLine(
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
    }
}
