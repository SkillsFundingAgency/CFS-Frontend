using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class CreateSubPolicyModel : CreatePolicyModel
    {
        [JsonProperty("parentPolicyId")]
        public string ParentPolicyId { get; set; }
    }
}
