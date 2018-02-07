using System;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class DatasetSearchResultItemViewModel : ReferenceViewModel
    {
        public string Status { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
