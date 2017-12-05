using Newtonsoft.Json;

namespace CalculateFunding.Web.ApiClient.Models
{
    public class AllocationLine
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("productFolders")]
        public ProductFolder[] ProductFolders { get; set; }
    }
}