using System.Collections.Generic;
using System.Linq;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
	public class DatasetVersionSearchResultViewModel : SearchResultViewModel
	{
		public DatasetVersionSearchResultViewModel(IEnumerable<DatasetVersionIndex> results, 
			int totalCount, 
			int currentPage, 
			int totalPages, 
			int pageSize) 
			: base(totalCount, currentPage)
		{
			Results = results;
			PagerState = new PagerState(currentPage, totalPages);
			PageSize = pageSize;

			InitializeStartingAndEndingItemNumbers();
		}

		private void InitializeStartingAndEndingItemNumbers()
		{
			if (TotalResults == 0)
			{
				StartItemNumber = 0;
				EndItemNumber = 0;
			}
			else
			{
				StartItemNumber = ((CurrentPage - 1) * PageSize) + 1;
				EndItemNumber = StartItemNumber + PageSize - 1;
			}

			if (EndItemNumber > Results.Count())
			{
				EndItemNumber = Results.Count();
			}
		}

		public IEnumerable<DatasetVersionIndex> Results { get; }

		public int PageSize { get; }
	}
}
