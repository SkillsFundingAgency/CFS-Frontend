using System;
using CalculateFunding.Frontend.Clients.Models;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class Calculation : Reference
    {
        public string SpecificationId { get; set; }

        public string PeriodName { get; set; }

        public Reference CalculationSpecification { get; set; }

        public string Status { get; set; }

        public string SourceCode { get; set; }

        [JsonProperty("date")]
        public DateTime LastModified { get; set; }

        [JsonProperty("author")]
        public Reference LastModifiedBy { get; set; }
    }
}
