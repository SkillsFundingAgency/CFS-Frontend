using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class SpecificationViewModel : ReferenceViewModel
    {
        public ReferenceViewModel AcademicYear { get; set; }

        public ReferenceViewModel FundingStream { get; set; }

        public string Description { get; set; }

        public List<PolicyViewModel> Policies { get; set; }
    }
}
