using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationViewModel : ReferenceViewModel
    {
        public ReferenceViewModel FundingPeriod { get; set; }

        public IEnumerable<ReferenceViewModel> FundingStreams { get; set; }

        public string Description { get; set; }

        public List<PolicyViewModel> Policies { get; set; }
    }
}
