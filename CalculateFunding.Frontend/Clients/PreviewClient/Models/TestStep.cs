namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    using Newtonsoft.Json;

    public abstract class TestStep
    {
        [JsonProperty("stepType")]
        public TestStepType StepType { get; set; }
    }
}