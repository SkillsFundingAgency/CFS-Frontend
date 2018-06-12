
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.CommonModels
{
    public class PublishStatusEditModel
    {
        [JsonProperty("publishStatus")]
        public PublishStatus PublishStatus { get; set; }
    }
}
