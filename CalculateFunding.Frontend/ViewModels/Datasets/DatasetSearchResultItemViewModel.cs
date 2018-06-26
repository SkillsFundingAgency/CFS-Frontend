namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class DatasetSearchResultItemViewModel : ReferenceViewModel
    {
        public string Description { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdated { get; set; }

        public string LastUpdatedDisplay { get; set; }

        public int Version { get; set; }
    }
}
