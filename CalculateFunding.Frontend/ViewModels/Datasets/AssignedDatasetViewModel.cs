namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using CalculateFunding.Frontend.ViewModels.Common;

    public class AssignedDatasetViewModel : ReferenceViewModel
    {
        public string Description { get; set; }

        public ReferenceViewModel DatasetVersion { get; set; }
    }
}
