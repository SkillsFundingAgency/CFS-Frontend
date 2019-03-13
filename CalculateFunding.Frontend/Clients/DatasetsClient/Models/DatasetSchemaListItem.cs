namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using CalculateFunding.Common.Models;
    using Newtonsoft.Json;

    public class DatasetSchemaListItem : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }
    }
}
