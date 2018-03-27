
namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using Newtonsoft.Json;

    public class TestSpecificationSummary : Reference
    {
        [JsonProperty("period")]
        public Reference Period { get; set; }
    }
}
