using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    public class ScenarioViewModel : ReferenceViewModel
    {
        [JsonProperty("current")]
        public CurrentScenarioVersionViewModel CurrentVersion { get; set; }

        [JsonProperty("specification")]
        public SpecificationSummaryViewModel Specification { get; set; }
    }
}
