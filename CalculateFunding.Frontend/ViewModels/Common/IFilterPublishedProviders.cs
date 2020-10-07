namespace CalculateFunding.Frontend.ViewModels.Common
{
    public interface IFilterPublishedProviders
    {
        public string[] Status { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingStreamId { get; set; }

        public string[] ProviderType { get; set; }

        public string[] ProviderSubType { get; set; }

        public string[] LocalAuthority { get; set; }
        
        public bool? HasErrors { get; set; }
    }
}