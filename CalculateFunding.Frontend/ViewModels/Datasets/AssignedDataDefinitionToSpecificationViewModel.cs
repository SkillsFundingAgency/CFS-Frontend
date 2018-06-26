namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class AssignedDataDefinitionToSpecificationViewModel : ReferenceViewModel
    {
        public IEnumerable<AssignedDatasetViewModel> Datasets { get; set; }
    }
}
