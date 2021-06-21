using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class AssignDatasetSchemaViewModel
    {
         public string DatasetDefinitionId { get; set; }

         public string Name { get; set; }

         public string Description { get; set; }

         public bool IsSetAsProviderData { get; set; }

         public bool UsedInDataAggregations { get; set; }

        public DatasetRelationshipType RelationshipType { get; set; }

        public string TargetSpecificationId { get; set; }

        public IEnumerable<uint> FundingLineIds { get; set; }

        public IEnumerable<uint> CalculationIds { get; set; }
    }
}
