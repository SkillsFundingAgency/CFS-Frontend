namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using CalculateFunding.Frontend.ViewModels.Common;

    public class DatasetVersionViewModel : ReferenceViewModel
    {
        public string Version { get; set; }

        public ReferenceViewModel Author { get; set; }
    }
}
