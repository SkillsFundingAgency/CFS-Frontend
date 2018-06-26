namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class DatasetSchemaListItem : Reference
    {
        [JsonProperty("description")]
        public string Description { get; set; }
    }
}
