using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;

namespace CalculateFunding.Frontend.Controllers
{
    public class PublishedProviderSearchController : Controller
    {
        private IPublishedProviderSearchService _publishedProviderSearchService;
        private readonly IPublishingApiClient _publishingApiClient;

        public PublishedProviderSearchController(IPublishedProviderSearchService publishedProviderSearchService,
            IPublishingApiClient publishingApiClient)
        {
            Guard.ArgumentNotNull(publishedProviderSearchService, nameof(publishedProviderSearchService));

            _publishedProviderSearchService = publishedProviderSearchService;
            _publishingApiClient = publishingApiClient;
        }

        [HttpPost]
        [Route("api/publishedprovider/search/ids")]
        public async Task<IActionResult> GetProviderIds([FromBody] SearchPublishedProvidersRequest request)
        {
            PublishedProviderIdSearchModel searchModel = new PublishedProviderIdSearchModel
            {
                Filters = ExtractFilters(request),
                SearchTerm = request.SearchTerm,
                SearchFields = request.SearchFields
            };

            ApiResponse<IEnumerable<string>> response = await _publishingApiClient.SearchPublishedProviderIds(searchModel);

            var errorResult = response.IsSuccessOrReturnFailureResult("search");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpPost]
        [Route("api/publishedprovider/search")]
        public async Task<IActionResult> GetProviders([FromBody] SearchPublishedProvidersRequest request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            SearchRequestViewModel searchModel = new SearchRequestViewModel
            {
                SearchTerm = request.SearchTerm,
                PageNumber = request.PageNumber,
                Filters = ExtractFilters(request),
                SearchMode = request.SearchMode,
                ErrorToggle = request.ErrorToggle,
                FacetCount = request.FacetCount,
                IncludeFacets = request.IncludeFacets,
                PageSize = request.PageSize,
                SearchFields = request.SearchFields
            };

            PublishProviderSearchResultViewModel result = await _publishedProviderSearchService.PerformSearch(searchModel);

            if (result != null)
            {
                return Ok(result);
            }

            return new InternalServerErrorResult("Cannot find it");
        }

        private Dictionary<string, string[]> ExtractFilters(IFilterPublishedProviders source)
        {
            Dictionary<string, string[]> destination = new Dictionary<string, string[]>();

            if (source.LocalAuthority != null && source.LocalAuthority.Length > 0)
            {
                destination.Add("localAuthority", source.LocalAuthority);
            }

            if (!string.IsNullOrWhiteSpace(source.FundingPeriodId))
            {
                destination.Add("fundingPeriodId", new[] {source.FundingPeriodId});
            }

            if (!string.IsNullOrWhiteSpace(source.FundingStreamId))
            {
                destination.Add("fundingStreamId", new[] {source.FundingStreamId});
            }

            if (source.ProviderType != null && source.ProviderType.Length > 0)
            {
                destination.Add("providerType", source.ProviderType);
            }

            if (source.Status != null && source.Status.Length > 0)
            {
                destination.Add("fundingStatus", source.Status);
            }

            if (source.ProviderSubType != null && source.ProviderSubType.Length > 0)
            {
                destination.Add("providerSubType", source.ProviderSubType);
            }

            if (source.HasErrors.HasValue)
            {
                destination.Add("hasErrors", new [] {source.HasErrors.Value ? "true" : "false"});
            }
            
            return destination;
        }
    }
}