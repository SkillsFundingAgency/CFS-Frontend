using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class PolicyViewModel : ReferenceViewModel
    {
        public string Description { get; set; }

        public IEnumerable<CalculationViewModel> Calculations { get; set; }

        public IEnumerable<PolicyViewModel> SubPolicies { get; set; }
    }
}