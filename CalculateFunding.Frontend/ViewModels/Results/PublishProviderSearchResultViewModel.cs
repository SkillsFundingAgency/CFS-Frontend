using System.Collections.Generic;
using System.Linq;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class PublishProviderSearchResultViewModel : SearchResultViewModel
    {
        public PublishProviderSearchResultViewModel()
        {
            Providers = Enumerable.Empty<PublishedProviderSearchResultItemViewModel>();
        }

        public IEnumerable<PublishedProviderSearchResultItemViewModel> Providers { get; set; }
        public double FilteredFundingAmount { get; set; }
        public bool CanPublish { get; set; }
        public bool CanApprove { get; set; }
    }

    public class PublishedProviderSearchResultItemViewModel
    {
        public string Id { get; set; }
        public string ProviderType { get; set; }
        public string LocalAuthority { get; set; }
        public string FundingStatus { get; set; }
        public string ProviderName { get; set; }
        public string UKPRN { get; set; }
        public double FundingValue { get; set; }
        public string SpecificationId { get; set; }
        public string FundingStreamId { get; set; }
        public string FundingPeriodId { get; set; }
    }
}
