using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CalculationViewModel : ReferenceViewModel
    {
        public ReferenceViewModel AllocationLine { get; set; }

        public string Description { get; set; }

    }
}
