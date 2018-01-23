using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    public abstract class TestStep
    {
        [JsonProperty("stepType")]
        public TestStepType StepType { get; set; }
    }
}