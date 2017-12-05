using Newtonsoft.Json;

namespace Allocations.Web.ApiClient.Models
{
    public abstract class TestStep
    {
        [JsonProperty("stepType")]
        public TestStepType StepType { get; set; }
    }
}