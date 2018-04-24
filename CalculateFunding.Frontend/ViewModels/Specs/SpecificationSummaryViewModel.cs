using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationSummaryViewModel : ReferenceViewModel
    {
        public ReferenceViewModel Period { get; set; }

        public ReferenceViewModel FundingStream { get; set; }

        public string Description { get; set; }
    }
}
