using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models.CreateModels
{
    public class CreateSubPolicyModel : CreatePolicyModel
    {
        [JsonProperty("parentPolicyId")]
        public string ParentPolicyId { get; set; }
    }
}
