using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.Profiles
{
    [JsonConverter(typeof (StringEnumConverter))]
    public enum ProfileConfigurationTypeViewModel
    {
        RuleBased,
        Custom,   
    }
}