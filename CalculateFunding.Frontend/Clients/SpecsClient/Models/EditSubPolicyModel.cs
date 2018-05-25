namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;

    public class EditSubPolicyModel 
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        public string ParentPolicyId { get; set; }
    }
}
