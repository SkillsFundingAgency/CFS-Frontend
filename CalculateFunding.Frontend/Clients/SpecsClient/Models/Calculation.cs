namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using System;
    using CalculateFunding.Common.ApiClient.Models;

    public class Calculation : Reference
    {
        public Reference AllocationLine { get; set; }

        public string Description { get; set; }

        public bool IsPublic { get; set; }

        public DateTime LastUpdated { get; set; }

        public CalculationSpecificationType CalculationType { get; set; }
    }
}
