using Newtonsoft.Json;

namespace CalculateFunding.Web.ApiClient.Models
{
    public abstract class TestStep
    {
        [JsonProperty("stepType")]
        public TestStepType StepType { get; set; }
    }
}