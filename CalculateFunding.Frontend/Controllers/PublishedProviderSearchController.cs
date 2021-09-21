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
using System.Text.Json;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Jobs.Models;
using System;
using Microsoft.AspNetCore.Http;

namespace CalculateFunding.Frontend.Controllers
{
    public class PublishedProviderSearchController : Controller
    {
        private const string ShowAllAllocationTypes = "Show all allocation types";
        private readonly IPublishedProviderSearchService _publishedProviderSearchService;
        private readonly IPublishingApiClient _publishingApiClient;
        private readonly IJobsApiClient _jobsApiClient;

        public PublishedProviderSearchController(IPublishedProviderSearchService publishedProviderSearchService,
            IPublishingApiClient publishingApiClient,
            IJobsApiClient jobsApiClient)
        {
            Guard.ArgumentNotNull(publishedProviderSearchService, nameof(publishedProviderSearchService));
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));
            Guard.ArgumentNotNull(jobsApiClient, nameof(jobsApiClient));

            _publishedProviderSearchService = publishedProviderSearchService;
            _publishingApiClient = publishingApiClient;
            _jobsApiClient = jobsApiClient;
        }

        [HttpPost]
        [Route("api/publishedProviders/search/ids")]
        public async Task<IActionResult> GetProviderIds([FromBody] SearchPublishedProvidersRequest request)
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

            bool fundingTotalUnchanged = false;

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

            if (HttpContext.Request?.Cookies[$"{request.SpecificationId}_SearchRequestViewModel"] != null)
            {
                DateTimeOffset dateTimeOffset = DateTimeOffset.MinValue;

                ApiResponse<IDictionary<string, JobSummary>> latestJobsResponse = await _jobsApiClient.GetLatestJobsForSpecification(request.SpecificationId,
                  "RefreshFundingJob",
                  "ApproveAllProviderFundingJob",
                  "ApproveBatchProviderFundingJob",
                  "PublishAllProviderFundingJob",
                  "PublishBatchProviderFundingJob");

                if (latestJobsResponse?.Content != null)
                {
                    JobSummary latestJob = latestJobsResponse.Content.Values.Where(_ => _ != null).OrderByDescending(_ => _.LastUpdated).FirstOrDefault(_ => _.CompletionStatus == CompletionStatus.Succeeded);

                    if (latestJob != null)
                    {
                        dateTimeOffset = latestJob.LastUpdated;
                    }
                }

                DateTimeOffset timeStamp = JsonSerializer.Deserialize<DateTimeOffset>(HttpContext.Request.Cookies[$"{request.SpecificationId}_TS"]);
                SearchRequestViewModel currentViewModel = JsonSerializer.Deserialize<SearchRequestViewModel>(HttpContext.Request.Cookies[$"{request.SpecificationId}_SearchRequestViewModel"]);

                fundingTotalUnchanged = timeStamp > dateTimeOffset;

                if (fundingTotalUnchanged)
                {
                    fundingTotalUnchanged = currentViewModel.ErrorToggle == searchModel.ErrorToggle &&
                        currentViewModel.SearchTerm == searchModel.SearchTerm &&
                        currentViewModel.Filters.Count == filters.Count &&
                        currentViewModel.Filters.Keys.All(_ => filters.ContainsKey(_) && currentViewModel.Filters[_].SequenceEqual(filters[_]));
                }
            }

            PublishProviderSearchResultViewModel result = await _publishedProviderSearchService.PerformSearch(searchModel, fundingTotalUnchanged ? (double?)double.Parse(HttpContext.Request.Cookies[$"{request.SpecificationId}_FilteredFundingAmount"]) : null);

            if (!fundingTotalUnchanged)
            {
                HttpContext.Response?.Cookies.Append($"{request.SpecificationId}_TS", JsonSerializer.Serialize(DateTimeOffset.Now), new CookieOptions { MaxAge = TimeSpan.FromMinutes(10)});
                HttpContext.Response?.Cookies.Append($"{request.SpecificationId}_FilteredFundingAmount", result.FilteredFundingAmount.ToString(), new CookieOptions { MaxAge = TimeSpan.FromMinutes(10) });
                HttpContext.Response?.Cookies.Append($"{request.SpecificationId}_SearchRequestViewModel", JsonSerializer.Serialize(searchModel), new CookieOptions { MaxAge = TimeSpan.FromMinutes(10) });
            }

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