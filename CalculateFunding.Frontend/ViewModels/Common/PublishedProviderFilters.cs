namespace CalculateFunding.Frontend.ViewModels.Common
{
    public abstract class PublishedProviderFilters : IFilterPublishedProviders
    {
        public string[] Status { get; set; }
        
        public string SpecificationId { get; set; }
        
        public string FundingPeriodId { get; set; }
        
        public string FundingStreamId { get; set; }
        
        public string[] ProviderType { get; set; }
        
        public string[] ProviderSubType { get; set; }
        
        public string[] LocalAuthority { get; set; }
        
        public string[] MonthYearOpened { get; set; }
        
        public string[] Indicative { get; set; }
        
        public bool? HasErrors { get; set; }
    }
}