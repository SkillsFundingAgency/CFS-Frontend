using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.FundingDataZone;
using CalculateFunding.Common.ApiClient.FundingDataZone.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Provider;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ProviderController : Controller
    {
        private IProvidersApiClient _providersApiClient;
        private IResultsApiClient _resultsApiClient;
        private readonly IFundingDataZoneApiClient _fundingDataZoneApiClient;

        public ProviderController(IProvidersApiClient providersApiClient, IResultsApiClient resultsApiClient,
            IFundingDataZoneApiClient fundingDataZoneApiClient)
        {
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(fundingDataZoneApiClient, nameof(fundingDataZoneApiClient));

            _providersApiClient = providersApiClient;
            _resultsApiClient = resultsApiClient;
            _fundingDataZoneApiClient = fundingDataZoneApiClient;
        }

        [HttpGet]
        [Route("api/provider/getproviderbyversionandid/{providerVersionId}/{providerId}")]
        public async Task<IActionResult> GetProviderById(string providerVersionId, string providerId)
        {
            Guard.IsNullOrWhiteSpace(providerVersionId, nameof(providerVersionId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<ProviderVersionSearchResult> result =
                await _providersApiClient.GetProviderByIdFromProviderVersion(providerVersionId, providerId);


            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            if (result.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Provider was not found");
            }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
        }

        [HttpPost]
        [Route("api/provider/fundingstreams/{fundingStreamId}/current/search")]
        public async Task<IActionResult> GetProviderByFundingStream(
            [FromRoute] string fundingStreamId,
            [FromBody] SearchModel search)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(search, nameof(search));

            ApiResponse<ProviderVersionSearchResults> result =
                await _providersApiClient.SearchCurrentProviderVersionForFundingStream(fundingStreamId, search);

            if (result.StatusCode == HttpStatusCode.OK)
            {
                int totalPages = result.Content.TotalCount / search.Top;
                if (result.Content.TotalCount % search.Top > 0)
                {
                    totalPages++;
                }

                int startNumber = ((search.Top * search.PageNumber) - search.Top) + 1;
                int endNumber = (search.Top * search.PageNumber);
                if (endNumber > result.Content.TotalCount)
                {
                    endNumber = result.Content.TotalCount;
                }

                PagedProviderVersionSearchResults searchPagedResult = new PagedProviderVersionSearchResults
                {
                    Facets = result.Content.Facets,
                    Items = result.Content.Results,
                    TotalCount = result.Content.TotalCount,
                    PagerState = new PagerState(search.PageNumber, totalPages),
                    StartItemNumber = startNumber,
                    EndItemNumber = endNumber
                };

                return Ok(searchPagedResult);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
        }

        [HttpGet]
        [Route("/api/provider/getproviderresults/{providerId}")]
        public async Task<IActionResult> GetProviderResults(string providerId)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<IEnumerable<SpecificationInformation>> result = 
                await _resultsApiClient.GetSpecificationsWithProviderResultsForProviderId(providerId);
            
            if (result.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(result.Content);
            }
            
            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            if (result.StatusCode == HttpStatusCode.InternalServerError)
            {
                return new InternalServerErrorResult("There was an error processing your request. Please try again.");
            }

            return StatusCode((int)result.StatusCode);
        }

        [HttpGet]
        [Route("api/providers/fundingStreams/{fundingStreamId}/snapshots")]
        public async Task<IActionResult> GetProviderSnapshotsForFundingStream(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<ProviderSnapshot>> providerSnapshotsResponse = 
                await _fundingDataZoneApiClient.GetProviderSnapshotsForFundingStream(fundingStreamId);

            IActionResult providerSnapshotsErrorResult =
                providerSnapshotsResponse.IsSuccessOrReturnFailureResult("GetFundingStructuresByProviderId");
            if (providerSnapshotsErrorResult != null)
            {
                return providerSnapshotsErrorResult;
            }

            return Ok(providerSnapshotsResponse.Content);
        }
    }
}