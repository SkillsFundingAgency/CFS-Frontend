using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class SearchRequestBaseModel : IFilterPublishedProviders
    {
        public string SearchTerm { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }

        public IEnumerable<string> SearchFields { get; set; }
        
        public string[] Status { get; set; }
        public string SpecificationId { get; set; }
        public string FundingPeriodId { get; set; }
        public string FundingStreamId { get; set; }
        public string[] ProviderType { get; set; }
        public string[] ProviderSubType { get; set; }
        public string[] LocalAuthority { get; set; }
        public bool? HasErrors { get; set; }
    }
}