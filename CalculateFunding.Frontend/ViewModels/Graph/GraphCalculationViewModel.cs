using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Graph
{
    public class GraphCalculationViewModel
    {
        [JsonProperty("calculationid")]
        public string CalculationId { get; set; }
        public string SpecificationId { get; set; }
        public string CalculationName { get; set; }
        public string CalculationType { get; set; }
        public string FundingStream { get; set; }
    }
}
