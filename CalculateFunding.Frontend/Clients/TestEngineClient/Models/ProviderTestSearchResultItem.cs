using CalculateFunding.Common.ApiClient.Models;
using Newtonsoft.Json;
using System;

namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class ProviderTestSearchResultItem : Reference
    {
        [JsonProperty("providerName")]
        public new string Name { get; set; }

        public int? Upin { get; set; }

        public int? Ukprn { get; set; }

        public int? Urn { get; set; }

        public int? EstablishmentNumber { get; set; }

        public string ProviderId { get; set; }

        public string ProviderType { get; set; }

        public string ProviderSubType { get; set; }

        public string LocalAuthority { get; set; }

        [JsonProperty("openDate")]
        public DateTime? DateOpened { get; set; }

        public DateTime ConvertDate { get; set; }

        public DateTime LocalAuthorityChangeDate { get; set; }

        public string PreviousLocalAuthority { get; set; }

        [JsonProperty("closeDate")]
        public DateTime? DateClosed { get; set; }

        public string TestResult { get; set; }

        [JsonProperty("lastUpdatedDate")]
        public DateTime? LastUpdatedDate { get; set; }
    }
}
