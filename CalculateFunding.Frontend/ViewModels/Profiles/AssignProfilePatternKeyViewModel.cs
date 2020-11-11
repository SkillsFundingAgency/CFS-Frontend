using CalculateFunding.Common.ApiClient.Publishing.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Profiles
{
    public class AssignProfilePatternKeyViewModel
    {
        [JsonProperty("fundingStreamId")]
        public string FundingStreamId { get; set; }

        [JsonProperty("fundingPeriodId")]
        public string FundingPeriodId { get; set; }

        [JsonProperty("providerId")]
        public string ProviderId { get; set; }

        [JsonProperty("profilePatternKey")]
        public ProfilePatternKey ProfilePatternKey { get; set; }
    }
}
