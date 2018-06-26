
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.Clients.CommonModels
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum PublishStatus
    {
        Draft,
        Approved,
        Updated,
        Archived
    }
}
