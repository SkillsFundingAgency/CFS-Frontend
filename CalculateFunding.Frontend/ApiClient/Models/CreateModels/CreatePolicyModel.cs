using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models.CreateModels
{
    public class CreatePolicyModel
    {
        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("namw")]
        public string Name { get; set; }
    }
}
