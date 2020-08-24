using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Graph
{
    public class GraphCalculationEntityViewModel<TNode> where TNode : class
    {
        public TNode Node { get; set; }
        public IEnumerable<GraphCalculationRelationshipEntityViewModel> Relationships { get; set; }
    }
}
