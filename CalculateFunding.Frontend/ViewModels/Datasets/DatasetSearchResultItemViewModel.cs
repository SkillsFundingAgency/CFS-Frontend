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

        public string ChangeNote { get; set; }

        public string LastUpdatedByName { get; set; }

        public string DefinitionName { get; set; }

        public string FundingStreamId { get; set; }
    }
}
