using System.Collections.Generic;
using System.Linq;
using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class FundingStream : Reference
    {
        public FundingStream()
        {
            AllocationLines = Enumerable.Empty<AllocationLine>();
        }

        public FundingStream(string id, string name)
            : base(id, name)
        {
            AllocationLines = Enumerable.Empty<AllocationLine>();

        }

        public IEnumerable<AllocationLine> AllocationLines { get; set; }
    }
}
