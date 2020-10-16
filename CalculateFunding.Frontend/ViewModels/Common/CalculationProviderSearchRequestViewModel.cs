using System.Collections.Generic;
using CalculateFunding.Common.Models.Search;

namespace CalculateFunding.Frontend.ViewModels.Common
{
	public class CalculationProviderSearchRequestViewModel
	{
		public int? PageNumber { get; set; }

		public string SearchTerm { get; set; }

		public string ErrorToggle { get; set; }

		public bool IncludeFacets { get; set; }

		public string[] ProviderType { get; set; }

		public string[] ProviderSubType { get; set; }

		public string[] ResultsStatus { get; set; }

		public string[] LocalAuthority { get; set; }

		public int? PageSize { get; set; }

		public int FacetCount { get; set; } = 10;

		public SearchMode SearchMode { get;  set; }

		public string CalculationValueType { get; set; }

		public string CalculationId { get; set; }

        public IEnumerable<string> SearchFields { get; set; }
	}
}