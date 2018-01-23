using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TestStepType
    {
        GivenSourceField,
        ThenProductValue,
        ThenSourceField,
        ThenExceptionNotThrown
    }
}