using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Profiles
{
    public class ProfilePreviewRequestViewModel
    {
        [JsonProperty("specificationId")]
        public string SpecificationId { get; set; }
            
        [JsonProperty("fundingStreamId")]
        public string FundingStreamId { get; set; }
            
        [JsonProperty("fundingPeriodId")]
        public string FundingPeriodId { get; set; }
            
        [JsonProperty("providerId")]
        public string ProviderId { get; set; }
            
        [JsonProperty("fundingLineCode")]
        public string FundingLineCode { get; set; }
            
        [JsonProperty("profilePatternKey")]
        public string ProfilePatternKey { get; set; }
            
        [JsonProperty("configurationType")]
        public ProfileConfigurationTypeViewModel ConfigurationType { get; set; }
    }
}