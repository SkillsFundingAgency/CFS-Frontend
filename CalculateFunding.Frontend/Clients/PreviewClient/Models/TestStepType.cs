using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
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