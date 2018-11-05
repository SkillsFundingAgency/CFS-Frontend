using System.Collections.Generic;
using CalculateFunding.Common.Identity.Authorization.Models;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class SelectDataSourceModel : ISpecificationAuthorizationEntity
    {
        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string DefinitionId { get; set; }

        public string DefinitionName { get; set; }

        public string RelationshipId { get; set; }

        public IEnumerable<DatasetVersionsModel> Datasets { get; set; }

        public string RelationshipName { get; set; }

        public string GetSpecificationId()
        {
            return SpecificationId;
        }
    }
}
