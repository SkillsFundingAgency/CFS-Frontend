namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class DatasetViewModel : ReferenceViewModel
    {
        public ReferenceViewModel Definition { get; set; }

        public string Description { get; set; }

        public IEnumerable<DatasetVersionViewModel> Versions { get; set; }
    }
}
