using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetVersionsViewModel : ReferenceViewModel
    {
        public DatasetVersionsViewModel()
        {
            Versions = Enumerable.Empty<DatasetVersionItemViewModel>();
        }
        
        public IEnumerable<DatasetVersionItemViewModel> Versions { get; set; }

        public bool IsSelected { get; set; }

        public string VersionContainerId
        {
            get
            {
                return $"{Id}_container";
            }
        }
    }
}
