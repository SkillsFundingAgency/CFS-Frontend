﻿using CalculateFunding.Common.Models.Search;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class SearchRequestViewModel : SearchRequestBaseModel
    {
        public int? PageNumber { get; set; }

        public string ErrorToggle { get; set; }

        public bool IncludeFacets { get; set; }

        public int? PageSize { get; set; }

        public int FacetCount { get; set; } = 10;

        public SearchMode SearchMode { get; set; }

        public IEnumerable<string> OrderBy { get; set; }
    }
}
