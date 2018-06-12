namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using System;
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class Calculation : Reference
    {
        public Reference AllocationLine { get; set; }

        public string Description { get; set; }

        public bool IsPublic { get; set; }

        public DateTime LastUpdated { get; set; }

        public CalculationType CalculationType { get; set; }
    }
}
