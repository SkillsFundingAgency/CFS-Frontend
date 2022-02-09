using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace CalculateFunding.Frontend.ViewModels.Jobs;

[JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
public class JobCreatedResponse
{
    [JsonProperty("jobId")]
    public string JobId { get; set; }
}