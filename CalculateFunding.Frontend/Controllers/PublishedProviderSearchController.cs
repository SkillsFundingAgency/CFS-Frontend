using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.Controllers
{
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;

    public class PublishedProviderSearchController : Controller
    {
        private IPublishedProviderSearchService _publishedProviderSearchService;

        public PublishedProviderSearchController(IPublishedProviderSearchService publishedProviderSearchService)
        {
            Guard.ArgumentNotNull(publishedProviderSearchService, nameof(publishedProviderSearchService));

            _publishedProviderSearchService = publishedProviderSearchService;
        }

        [HttpPost]
        [Route("api/publishedprovider/searchpublishedproviders")]
        public async Task<IActionResult> GetProviderVersionsByFundingStream([FromBody] SearchPublishedProvidersViewModel viewModel)
        {
            Guard.ArgumentNotNull(viewModel, nameof(viewModel));

			IDictionary<string, string[]> filters = new Dictionary<string, string[]>();

			if (!string.IsNullOrEmpty(viewModel.LocalAuthority) && !string.IsNullOrWhiteSpace(viewModel.LocalAuthority))
			{
				filters.Add("localAuthority", new []{viewModel.LocalAuthority});
			}
			if (!string.IsNullOrEmpty(viewModel.FundingPeriodId) && !string.IsNullOrWhiteSpace(viewModel.FundingPeriodId))
			{
				filters.Add("fundingPeriodId", new []{viewModel.FundingPeriodId });
			}
			if (!string.IsNullOrEmpty(viewModel.FundingStreamId) && !string.IsNullOrWhiteSpace(viewModel.FundingStreamId))
			{
				filters.Add("fundingStreamId", new []{viewModel.FundingStreamId});
			}
			if (!string.IsNullOrEmpty(viewModel.ProviderType) && !string.IsNullOrWhiteSpace(viewModel.ProviderType))
			{
				filters.Add("providerType", new []{viewModel.ProviderType });
			}
			if (!string.IsNullOrEmpty(viewModel.Status) && !string.IsNullOrWhiteSpace(viewModel.Status))
			{
				filters.Add("fundingStatus", new []{viewModel.Status });
			}


            SearchRequestViewModel request = new SearchRequestViewModel
            {
	            SearchTerm = viewModel.SearchTerm,
				PageNumber = viewModel.PageNumber,
				Filters = filters,
				SearchMode = viewModel.SearchMode,
				ErrorToggle = viewModel.ErrorToggle,
				FacetCount = viewModel.FacetCount,
				IncludeFacets = viewModel.IncludeFacets,
				PageSize = viewModel.PageSize
            };

            PublishProviderSearchResultViewModel result = await _publishedProviderSearchService.PerformSearch(request);

            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new InternalServerErrorResult($"Cannot find it");
            }
        }
    }
}
