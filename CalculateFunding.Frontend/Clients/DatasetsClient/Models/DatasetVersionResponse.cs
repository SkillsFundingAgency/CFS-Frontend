using CalculateFunding.Frontend.Clients.CommonModels;
using Newtonsoft.Json;
using System;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetVersionResponse : Reference
    {
        public string BlobName { get; set; }

        public int Version { get; set; }

        public DateTime LastUpdatedDate { get; set; }

        [JsonProperty("publishStatus")]
        public string Status { get; set; }

        public Reference Definition { get; set; }

        public string Description { get; set; }

        public string Comment { get; set; }

        public Reference Author { get; set; }

        public int CurrentDataSourceRows { get; set; }

        public int PreviousDataSourceRows { get; set; }
    }
}
