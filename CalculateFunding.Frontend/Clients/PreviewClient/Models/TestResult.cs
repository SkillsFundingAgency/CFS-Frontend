using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TestResult
    {
        Inconclusive,
        Failed,
        Passed,
        Ignored
    }
}