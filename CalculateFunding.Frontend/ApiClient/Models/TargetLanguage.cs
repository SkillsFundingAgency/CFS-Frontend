using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TargetLanguage
    {
        CSharp,
        VisualBasic
    }
}