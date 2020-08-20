using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum CalculationValueTypeViewModel
    {
        Number,
        Percentage,
        Currency,
        Boolean,
        String
    }
}
