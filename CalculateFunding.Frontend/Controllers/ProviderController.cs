﻿using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.FundingDataZone;
using CalculateFunding.Common.ApiClient.FundingDataZone.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
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
        private ISpecificationsApiClient _specificationApiClient;
        private readonly IFundingDataZoneApiClient _fundingDataZoneApiClient;

        public ProviderController(IProvidersApiClient providersApiClient, 
            IResultsApiClient resultsApiClient,
            ISpecificationsApiClient specificationApiClient,
            IFundingDataZoneApiClient fundingDataZoneApiClient)
        {
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(fundingDataZoneApiClient, nameof(fundingDataZoneApiClient));

            _providersApiClient = providersApiClient;
            _resultsApiClient = resultsApiClient;
            _specificationApiClient = specificationApiClient;
            _fundingDataZoneApiClient = fundingDataZoneApiClient;
        }

        [HttpGet]
        [Route("api/provider/getProviderByVersionAndId/{providerVersionId}/{providerId}")]
        public async Task<IActionResult> GetProviderById(string providerVersionId, string providerId)
        {
            Guard.IsNullOrWhiteSpace(providerVersionId, nameof(providerVersionId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            ApiResponse<ProviderVersionSearchResult> response =
                await _providersApiClient.GetProviderByIdFromProviderVersion(providerVersionId, providerId);

            return response.Handle("ProviderVersion",
                onSuccess: x => Ok(x.Content),
                onNotFound: x => NotFound("Provider was not found"));
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

                Facet localAuthorityFacets = searchPagedResult?.Facets?.Where(_ => _.Name == "authority")
                                            ?.FirstOrDefault();

                if (localAuthorityFacets != null)
                {
                    localAuthorityFacets.FacetValues = localAuthorityFacets.FacetValues.OrderBy(_ => _.Name);
                }

                return Ok(searchPagedResult);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
        }


        [HttpPost]
        [Route("api/provider/providerversions/{providerVersionId}/current/search")]
        public async Task<IActionResult> GetProvidersForSpecification(
            [FromRoute] string providerVersionId,
            [FromBody] SearchModel search)
        {
            Guard.IsNullOrWhiteSpace(providerVersionId, nameof(providerVersionId));
            Guard.ArgumentNotNull(search, nameof(search));

            ApiResponse<ProviderVersionSearchResults> result =
                await _providersApiClient.SearchProvidersForSpecification(providerVersionId, search);

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

                Facet localAuthorityFacets = searchPagedResult?.Facets?.Where(_ => _.Name == "authority")
                                            ?.FirstOrDefault();

                if (localAuthorityFacets != null)
                {
                    localAuthorityFacets.FacetValues = localAuthorityFacets.FacetValues.OrderBy(_ => _.Name);
                }

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
                List<string> specificationsToRemove = new List<string>();

                foreach (SpecificationInformation specificationInformation in result.Content)
                {
                    ApiResponse<SpecificationSummary> specificationResult = await _specificationApiClient.GetSpecificationSummaryById(specificationInformation.Id);

                    if (specificationResult.StatusCode == HttpStatusCode.OK)
                    {
                        SpecificationSummary specificationSummary = specificationResult.Content;

                        if (!string.IsNullOrWhiteSpace(specificationSummary.ProviderVersionId))
                        {
                            ApiResponse<ProviderVersionSearchResult> providerResult = await _providersApiClient.GetProviderByIdFromProviderVersion(specificationSummary.ProviderVersionId, providerId);

                            // if the provider no longer in scope of specification then we don't want to give the users the ability to select it from the drop down
                            if (providerResult.StatusCode == HttpStatusCode.NotFound)
                            {
                                specificationsToRemove.Add(specificationSummary.Id);
                            }
                        }
                    }
                    // if the specification no longer in scope then we don't want to give the users the ability to select it from the drop down
                    if (specificationResult.StatusCode == HttpStatusCode.NotFound)                   
                    {
                        specificationsToRemove.Add(specificationInformation.Id);
                    }
                }

                return new OkObjectResult(result.Content.Where(_ => !specificationsToRemove.Contains(_.Id)));
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
        [Route("api/providers/fundingStreams/{fundingStreamId}/{fundingPeriodId}/snapshots")]
        public async Task<IActionResult> GetProviderSnapshotsForFundingStream(string fundingStreamId, string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<ProviderSnapshot>> providerSnapshotsResponse =
                await _fundingDataZoneApiClient.GetProviderSnapshotsForFundingStream(fundingStreamId, fundingPeriodId);

            IActionResult providerSnapshotsErrorResult =
                providerSnapshotsResponse.IsSuccessOrReturnFailureResult("GetFundingStructuresByProviderId");
            if (providerSnapshotsErrorResult != null)
            {
                return providerSnapshotsErrorResult;
            }

            return Ok(providerSnapshotsResponse.Content);
        }

        [HttpGet("api/provider/fundingStreams/{fundingStreamId}/current")]
        public async Task<IActionResult> GetCurrentProviderVersionForFundingStream([FromRoute] string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<CurrentProviderVersionMetadata> currentProviderMetadataResponse =
                await _providersApiClient.GetCurrentProviderMetadataForFundingStream(fundingStreamId);
            IActionResult currentProviderMetadataResult =
                currentProviderMetadataResponse.Handle(
                    "GetCurrentProviderMetadataForFundingStream",
                    onSuccess: x => Ok(x.Content),
                    onNotFound: x => NotFound("No current provider metadata exists for the selected funding stream"));
            if (currentProviderMetadataResult is not OkObjectResult)
            {
                return currentProviderMetadataResult;
            }

            ApiResponse<ProviderVersionMetadata> providerVersionMetadataResponse =
                await _providersApiClient.GetProviderVersionMetadata(currentProviderMetadataResponse.Content.ProviderVersionId);
            IActionResult providerVersionMetadataResult =
                providerVersionMetadataResponse.Handle("GetProviderVersionMetadata",
                    onSuccess: x => Ok(x.Content),
                    onNotFound: x => NotFound("No provider version metadata exists for the selected funding stream"));
            if (providerVersionMetadataResult is not OkObjectResult)
            {
                return providerVersionMetadataResult;
            }

            return Ok(new CurrentProviderVersionForFundingStream
            {
                ProviderSnapshotId = currentProviderMetadataResponse.Content.ProviderSnapshotId,
                Name = providerVersionMetadataResponse.Content.Name,
                ProviderVersionId = currentProviderMetadataResponse.Content.ProviderVersionId,
                TargetDate = providerVersionMetadataResponse.Content.TargetDate,
                Version = providerVersionMetadataResponse.Content.Version,
                Description = providerVersionMetadataResponse.Content.Description,
            });
        }
    }
}