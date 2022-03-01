using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;

namespace CalculateFunding.Frontend.Controllers
{
    public class PublishedProviderSearchController : Controller
    {
        private const string ShowAllAllocationTypes = "Show all allocation types";
        private readonly IPublishedProviderSearchService _publishedProviderSearchService;
        private readonly IPublishingApiClient _publishingApiClient;

        public PublishedProviderSearchController(IPublishedProviderSearchService publishedProviderSearchService,
            IPublishingApiClient publishingApiClient)
        {
            Guard.ArgumentNotNull(publishedProviderSearchService, nameof(publishedProviderSearchService));
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));

            _publishedProviderSearchService = publishedProviderSearchService;
            _publishingApiClient = publishingApiClient;
        }

        [HttpGet]
        [Route("api/publishedProviders/publishedprovider-ids/{specificationId}")]
        public async Task<IActionResult> GetProviderIds([FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<IEnumerable<string>> response = await _publishingApiClient.GetPublishedProviderIds(specificationId);

            IActionResult errorResult = response.IsSuccessOrReturnFailureResult("search");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpPost]
        [Route("api/publishedProviders/search/ids")]
        public async Task<IActionResult> SearchProviderIds([FromBody] SearchPublishedProvidersRequest request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            PublishedProviderIdSearchModel searchModel = new PublishedProviderIdSearchModel
            {
                Filters = ExtractFilters(request),
                SearchTerm = request.SearchTerm,
                SearchFields = request.SearchFields
            };

            ApiResponse<IEnumerable<string>> response = await _publishingApiClient.SearchPublishedProviderIds(searchModel);

            IActionResult errorResult = response.IsSuccessOrReturnFailureResult("search");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(response.Content);
        }

        [HttpPost]
        [Route("api/publishedProviders/search")]
        public async Task<IActionResult> GetProviders([FromBody] SearchPublishedProvidersRequest request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            IDictionary<string, string[]> filters = ExtractFilters(request);

            SearchRequestViewModel searchModel = new SearchRequestViewModel
            {
                SearchTerm = request.SearchTerm,
                PageNumber = request.PageNumber,
                Filters = filters,
                SearchMode = request.SearchMode,
                ErrorToggle = request.ErrorToggle,
                FacetCount = request.FacetCount,
                IncludeFacets = request.IncludeFacets,
                PageSize = request.PageSize ?? 50,
                SearchFields = request.SearchFields,
                FundingStreamId = request.FundingStreamId,
                FundingPeriodId = request.FundingPeriodId
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

            if (!string.IsNullOrWhiteSpace(source.SpecificationId))
            {
                destination.Add("specificationId", new[] { source.SpecificationId });
            }

            if (!string.IsNullOrWhiteSpace(source.FundingPeriodId))
            {
                destination.Add("fundingPeriodId", new[] {source.FundingPeriodId});
            }

            if (!string.IsNullOrWhiteSpace(source.FundingStreamId))
            {
                destination.Add("fundingStreamId", new[] {source.FundingStreamId});
            }

            if (source.ProviderType?.Any() == true)
            {
                destination.Add("providerType", source.ProviderType);
            }

            if (source.Status?.Any() == true)
            {
                destination.Add("fundingStatus", source.Status);
            }

            if (source.ProviderSubType?.Any() == true)
            {
                destination.Add("providerSubType", source.ProviderSubType);
            }

            if (source.HasErrors.HasValue)
            {
                destination.Add("hasErrors", new [] {source.HasErrors.Value ? "true" : "false"});
            }

            if (source.MonthYearOpened?.Any() == true)
            {
                destination.Add("monthYearOpened", source.MonthYearOpened);    
            }

            if (source.Indicative?.Any(_ => _ != ShowAllAllocationTypes) == true)
            {
                destination.Add("indicative", source.Indicative);
            }
            
            return destination;
        }
    }
}