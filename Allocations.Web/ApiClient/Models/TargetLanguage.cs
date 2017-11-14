using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Allocations.Web.ApiClient.Models
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TargetLanguage
    {
        CSharp,
        VisualBasic
    }
}