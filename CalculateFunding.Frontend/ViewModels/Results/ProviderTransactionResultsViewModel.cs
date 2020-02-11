﻿using System.Collections.Generic;
using System.Net;
using CalculateFunding.Common.ApiClient.Publishing.Models;

namespace CalculateFunding.Frontend.ViewModels.Results
{
	public class ProviderTransactionResultsViewModel
	{
		public HttpStatusCode Status { get; set; }
		public List<ProviderTransactionResultsItemViewModel> Results { get; set; }

		public string FundingTotal { get; set; }
		public string LatestStatus { get; set; }
	}
}