namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using Newtonsoft.Json;

    public class CreateSubPolicyModel : CreatePolicyModel
    {
        [JsonProperty("parentPolicyId")]
        public string ParentPolicyId { get; set; }
    }
}
