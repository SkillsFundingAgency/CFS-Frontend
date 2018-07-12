namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using System;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class ProviderSearchResultItem : Reference
    {
        public string Upin { get; set; }

        public string Ukprn { get; set; }

        public string Urn { get; set; }

        public string EstablishmentNumber { get; set; }

        public string ProviderId { get; set; }

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
    }
}
