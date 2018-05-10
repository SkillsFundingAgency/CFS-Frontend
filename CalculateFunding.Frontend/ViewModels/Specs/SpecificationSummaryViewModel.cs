using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationSummaryViewModel : ReferenceViewModel
    {
        public ReferenceViewModel Period { get; set; }

        public IEnumerable<ReferenceViewModel> FundingStreams { get; set; }

        public string Description { get; set; }
    }
}
