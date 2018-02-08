namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class Calculation : Reference
    {
        public Reference AllocationLine { get; set; }

        public string Description { get; set; }
    }
}
