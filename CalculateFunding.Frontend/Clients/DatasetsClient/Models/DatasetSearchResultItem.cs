namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using System;
    using CalculateFunding.Common.ApiClient.Models;
    using Newtonsoft.Json;

    public class DatasetSearchResultItem : Reference
    {
        public string Description { get; set; }

        public string Status { get; set; }

        [JsonProperty("lastUpdatedDate")]
        public DateTime LastUpdated { get; set; }

        public int Version { get; set; }
    }
}
