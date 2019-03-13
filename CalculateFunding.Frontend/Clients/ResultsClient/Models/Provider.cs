namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using System;
    using CalculateFunding.Common.Models;
    using Newtonsoft.Json;

    public class Provider : Reference
    {
        public string ProviderType { get; set; }

        public string ProviderSubtype { get; set; }

        [JsonProperty("authority")]
        public string LocalAuthority { get; set; }

        public int? UPIN { get; set; }

        public int? UKPRN { get; set; }

        public int? URN { get; set; }

        [JsonProperty("openDate")]
        public DateTime? DateOpened { get; set; }
    }
}
