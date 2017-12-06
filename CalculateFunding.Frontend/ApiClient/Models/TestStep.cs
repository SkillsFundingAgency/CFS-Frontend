using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ApiClient.Models
{
    public abstract class TestStep
    {
        [JsonProperty("stepType")]
        public TestStepType StepType { get; set; }
    }
}