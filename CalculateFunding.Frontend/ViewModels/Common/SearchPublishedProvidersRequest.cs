﻿using System.Collections.Generic;
using CalculateFunding.Common.Models.Search;

namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class SearchPublishedProvidersRequest : IFilterPublishedProviders
    {
        public int? PageNumber { get; set; }

        public string SearchTerm { get; set; }

        public string ErrorToggle { get; set; }

        public bool IncludeFacets { get; set; }

        public string SpecificationId { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingStreamId { get; set; }

        public string[] ProviderType { get; set; }

        public string[] ProviderSubType { get; set; }

        public string[] LocalAuthority { get; set; }
        
        public bool? HasErrors { get; set; }

        public string[] Status { get; set; }

        public int? PageSize { get; set; }

        public int FacetCount { get; set; } = 10;

        public SearchMode SearchMode { get; set; }

        public IEnumerable<string> SearchFields { get; set; }
    }
}