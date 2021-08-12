using Newtonsoft.Json;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class PublishedProviderSearchResultItemViewModel
    {
        [JsonProperty("publishedProviderVersionId")]
        public string Id { get; set; }

        public string ProviderType { get; set; }

        public string ProviderSubType { get; set; }

        public string LocalAuthority { get; set; }

        public string FundingStatus { get; set; }

        public string ProviderName { get; set; }

        public string UKPRN { get; set; }

        public string UPIN { get; set; }

        public string URN { get; set; }

        public double FundingValue { get; set; }

        public string SpecificationId { get; set; }

        public string FundingStreamId { get; set; }

        public string FundingPeriodId { get; set; }
        
        public string Indicative { get; set; }

        public bool IsIndicative { get; set; }

        public bool HasErrors { get; set; }

        public string[] Errors { get; set; }
    }
}
