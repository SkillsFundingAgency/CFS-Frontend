using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
	public class DatasetHistoryModel : PageModel
	{
		private readonly IDatasetSearchService _searchService;

		public string DatasetId { get; set; }

		public DatasetVersionSearchResultModel Current { get; set; }

		public DatasetVersionSearchResultViewModel DatasetSearchResultViewModel { get; set; }

		public DatasetHistoryModel(IDatasetSearchService searchService)
		{
			_searchService = searchService;
		}

		public async Task<IActionResult> OnGetAsync(string datasetId, int pageNumber = 1, int pageSize = 20)
		{
			Guard.IsNullOrWhiteSpace(datasetId, nameof(datasetId));

			DatasetId = datasetId;

			Dictionary<string, string[]> datasetIdFilter = new Dictionary<string, string[]>{{"datasetId", new[] { datasetId }}};

			SearchRequestViewModel searchRequest = new SearchRequestViewModel()
			{
				PageNumber = pageNumber,
				PageSize = pageSize,
				Filters = datasetIdFilter,
				IncludeFacets = false
			};

			SearchRequestViewModel searchRequestForCurrent = new SearchRequestViewModel()
			{
				PageNumber = 1,
				PageSize = 1,
				Filters = datasetIdFilter,
				IncludeFacets = false,
				
			};

			DatasetVersionSearchResultViewModel searchResult = await _searchService.PerformSearchDatasetVersion(searchRequest);
			DatasetVersionSearchResultViewModel currentSearchResult = (await _searchService.PerformSearchDatasetVersion(searchRequestForCurrent));

			if (searchResult?.Results?.AnyWithNullCheck() == true && currentSearchResult?.Results?.AnyWithNullCheck() == true)
			{
				Current = currentSearchResult.Results.First();

				DatasetSearchResultViewModel = searchResult;

				return Page();
			}
			else
			{
				return new InternalServerErrorResult("There was an error retrieving data sources from the Search Version Index.");
			}			
		}
	}
}