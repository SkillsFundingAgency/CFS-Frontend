using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum DatasetRelationshipType
    {
        Uploaded = 0,
        ReleasedData = 1,
    }
}
