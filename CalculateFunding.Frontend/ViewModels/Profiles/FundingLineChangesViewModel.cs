using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Publishing.Models;

namespace CalculateFunding.Frontend.ViewModels.Profiles
{
    public class FundingLineChangesViewModel
    {
        public string ProviderName { get; set; }
        public string SpecificationName { get; set; }
        public string FundingPeriodName { get; set; }
        public IEnumerable<FundingLineChange> FundingLineChanges { get; set; }
    }
}
