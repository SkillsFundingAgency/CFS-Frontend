using CalculateFunding.Common.ApiClient.Models;
using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetVersionsModel : Reference
    {
        public DatasetVersionsModel()
        {
            Versions = Enumerable.Empty<int>();
        }

        public int? SelectedVersion { get; set; }

        public IEnumerable<int> Versions { get; set; }
    }
}
