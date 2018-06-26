namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class DatasetSchemaListItems : Reference
    {
        [JsonProperty("description")]
        public string DatasetScemaDescription { get; set; }
    }
}
