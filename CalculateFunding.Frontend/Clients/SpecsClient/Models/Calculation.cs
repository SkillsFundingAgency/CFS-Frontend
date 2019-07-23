﻿namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    using System;
    using CalculateFunding.Common.Models;

    public class Calculation : Reference
    {
        public Reference AllocationLine { get; set; }

        public string Description { get; set; }

        public DateTime LastUpdated { get; set; }

        public CalculationSpecificationType CalculationType { get; set; }
    }
}
