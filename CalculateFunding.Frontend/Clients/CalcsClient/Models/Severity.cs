using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum Severity
    {
        Hidden,
        Info,
        Warning,
        Error,
    }
}