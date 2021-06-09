namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class DatasetDefinitionSearchResultItemViewModel : ReferenceViewModel
    {
        public string Description { get; set; }

        public string ProviderIdentifier { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public bool ConverterEligible { get; set; }

        public string LastUpdatedDateDisplay
        {
            get { return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "Unknown"; }
        }

        public string LastUpdatedDateFormatted
        {
            get
            {
                return LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString);
            }
        }
    }
}
