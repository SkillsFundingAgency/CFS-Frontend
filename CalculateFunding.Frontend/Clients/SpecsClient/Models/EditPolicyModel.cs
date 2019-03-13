namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using CalculateFunding.Common.Models;
    using Newtonsoft.Json;

    public class EditPolicyModel : Reference
    {
        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

    }
}
