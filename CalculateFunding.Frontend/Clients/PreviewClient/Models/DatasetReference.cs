using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    public class DatasetReference 
    {
        [JsonProperty("datasetName")]
        public string DatasetName { get; set; }
        [JsonProperty("fieldName")]
        public string FieldName { get; set; }
        [JsonProperty("value")]
        public string Value { get; set; }
    }
}