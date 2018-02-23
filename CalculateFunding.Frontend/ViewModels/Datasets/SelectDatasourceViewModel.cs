using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class SelectDataSourceViewModel
    {
        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string DefinitionId { get; set; }

        public string DefinitionName { get; set; }

        public string RelationshipId { get; set; }

        public IEnumerable<DatasetVersionsViewModel> Datasets { get; set; }
    }
}
