namespace CalculateFunding.Frontend.ViewModels.Results
{
    using System;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Newtonsoft.Json;

    public class ProviderSearchResultItemViewModel : ReferenceViewModel
    {
        public int Upin { get; set; }

        public int Ukprn { get; set; }

        public int Urn { get; set; }

        public int EstablishmentNumber { get; set; }

        public string ProviderType { get; set; }

        public string ProviderSubType { get; set; }

        [JsonProperty("authority")]
        public string LocalAuthority { get; set; }

        [JsonProperty("openDate")]
        public DateTime? DateOpened { get; set; }

        public DateTime ConvertDate { get; set; }

        public DateTime LocalAuthorityChangeDate { get; set; }

        public string PreviousLocalAuthority { get; set; }

        [JsonProperty("closeDate")]
        public DateTime? DateClosed { get; set; }

        public string DateOpenedDisplay
        {
            get
            {
                return DateOpened.HasValue ? DateOpened.Value.ToString("dd/MM/yyyy") : "Unknown";
            }
        }
    }
}
