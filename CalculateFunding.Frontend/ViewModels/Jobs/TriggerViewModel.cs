using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Jobs
{
    public class TriggerViewModel
    {
        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("entityId")]
        public string EntityId { get; set; }

        [JsonProperty("entityType")]
        public string EntityType { get; set; }
    }
}