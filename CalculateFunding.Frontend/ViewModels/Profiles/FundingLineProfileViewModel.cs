using CalculateFunding.Common.ApiClient.Publishing.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Profiles
{
    public class FundingLineProfileViewModel
    {
        [JsonProperty("fundingLineProfile")]
        public FundingLineProfile FundingLineProfile { get; set; }

        [JsonProperty("enableUserEditableCustomProfiles")]
        public bool EnableUserEditableCustomProfiles { get; set; }

        [JsonProperty("enableUserEditableRuleBasedProfiles")]
        public bool EnableUserEditableRuleBasedProfiles { get; set; }
    }
}
