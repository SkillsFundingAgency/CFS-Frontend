using CalculateFunding.Frontend.Clients.CommonModels;
using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class FundingStream : Reference
    {
        public FundingStream()
        {
            AllocationLines = Enumerable.Empty<Reference>();
        }

        public IEnumerable<Reference> AllocationLines { get; set; }
    }
}
