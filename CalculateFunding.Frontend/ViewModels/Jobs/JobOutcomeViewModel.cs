using CalculateFunding.Common.ApiClient.Jobs.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Jobs
{
    public class JobOutcomeViewModel
    {
        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("type")]
        public OutcomeType Type { get; set; }

        [JsonProperty("jobType")]
        public string JobType { get; set; }

        [JsonProperty("isSuccessful")]
        public bool IsSuccessful { get; set; }
    }
}