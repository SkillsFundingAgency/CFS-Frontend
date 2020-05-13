using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.TemplateBuilder
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TemplateStatus
    {
        Draft = 0,
        Published = 1
    }
}