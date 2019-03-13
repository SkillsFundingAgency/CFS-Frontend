namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using CalculateFunding.Common.Models;
    using Newtonsoft.Json;

    public class DatasetSchemaListItems : Reference
    {
        [JsonProperty("description")]
        public string DatasetScemaDescription { get; set; }
    }
}
