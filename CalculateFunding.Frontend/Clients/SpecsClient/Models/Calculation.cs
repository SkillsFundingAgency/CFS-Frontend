using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class Calculation : Reference
    {
        public Reference AllocationLine { get; set; }

        public string Description { get; set; }
    }
}
