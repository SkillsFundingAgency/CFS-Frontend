using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Provider;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ProviderController : Controller
    {
        private IProvidersApiClient _providersApiClient;

        public ProviderController(IProvidersApiClient providersApiClient)
        {
            _providersApiClient = providersApiClient;
        }

        [HttpGet]
        [Route("api/provider/getproviderbyversionandid/{providerVersionId}/{providerId}")]
        public async Task<IActionResult> GetProviderById(string providerVersionId, string providerId)
        {
            ApiResponse<ProviderVersionSearchResult> result = await _providersApiClient.GetProviderByIdFromProviderVersion(providerVersionId, providerId);


            if (result.StatusCode == HttpStatusCode.OK)
            {
                return Ok(result.Content);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
        }

        [HttpPost]
        [Route("api/provider/fundingstreams/{fundingStreamId}/current/search")]
        public async Task<IActionResult> GetProviderByFundingStream(
            [FromRoute]string fundingStreamId,
            [FromBody]SearchModel search)
        {
            ApiResponse<ProviderVersionSearchResults> result =
                await _providersApiClient.SearchCurrentProviderVersionForFundingStream(fundingStreamId, search);

            SearchFilterRequest filterOptions = new SearchFilterRequest
            {
                ErrorToggle = search.ErrorToggle,
                FacetCount = search.FacetCount,
                Filters = search.Filters,
                IncludeFacets = search.IncludeFacets,
                Page = search.PageNumber,
                PageSize = search.Top,
                SearchFields = search.SearchFields,
                SearchMode = (Common.ApiClient.Models.SearchMode)search.SearchMode,
                SearchTerm = search.SearchTerm
            };

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
    }
}