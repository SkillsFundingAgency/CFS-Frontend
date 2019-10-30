using System.Collections.Generic;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationViewModel : ReferenceViewModel
    {
        public ReferenceViewModel FundingPeriod { get; set; }

        public IEnumerable<ReferenceViewModel> FundingStreams { get; set; }

        public string Description { get; set; }

        public PublishStatusViewModel PublishStatus { get; set; }
    }
}
