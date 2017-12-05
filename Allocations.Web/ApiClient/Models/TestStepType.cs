using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Web.ApiClient.Models
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