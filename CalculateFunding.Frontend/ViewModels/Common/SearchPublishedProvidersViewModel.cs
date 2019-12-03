﻿using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.ViewModels.Common
{
	public class SearchPublishedProvidersViewModel
	{
		public int? PageNumber { get; set; }

		public string SearchTerm { get; set; }

		public string ErrorToggle { get; set; }

		public bool IncludeFacets { get; set; }

		public string FundingPeriodId { get; set; }

		public string FundingStreamId { get; set; }

		public string ProviderType { get; set; }

		public string LocalAuthority { get; set; }

		public string Status { get; set; }

		public int? PageSize { get; set; }

		public int FacetCount { get; set; } = 10;

		public SearchMode SearchMode { get; set; }
	}
}