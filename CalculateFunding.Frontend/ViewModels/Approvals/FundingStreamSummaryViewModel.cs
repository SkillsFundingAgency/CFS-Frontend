using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class FundingStreamSummaryViewModel
    {
        public string Name { get; set; }

        public List<AllocationLineSummaryViewModel> AllocationLines { get; } = new List<AllocationLineSummaryViewModel>();
    }
}
