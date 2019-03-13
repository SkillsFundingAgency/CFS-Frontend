using CalculateFunding.Common.Models;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class AllocationLine : Reference
    {
        public AllocationLine()
        {
        }

        public AllocationLine(string id, string name)
            : base(id, name)
        {

        }
    }
}
