using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class CreateRelationshipViewModel
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string TargetSpecificationId { get; set; }

        public IEnumerable<uint> FundingLineIds { get; set; }

        public IEnumerable<uint> CalculationIds { get; set; }
    }
}
