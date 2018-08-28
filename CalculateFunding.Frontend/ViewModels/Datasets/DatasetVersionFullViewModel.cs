using CalculateFunding.Frontend.ViewModels.Common;
using System;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class DatasetVersionFullViewModel : ReferenceViewModel
    {
        public string BlobName { get; set; }

        public int Version { get; set; }

        public DateTime LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay { get; set; }

        public string Status { get; set; }

        public ReferenceViewModel Definition { get; set; }

        public string Description { get; set; }

        public string Comment { get; set; }

        public ReferenceViewModel Author { get; set; }

        public int CurrentDataSourceRows { get; set; }

        public int PreviousDataSourceRows { get; set; }
    }
}
