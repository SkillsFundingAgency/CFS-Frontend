namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using System;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using Newtonsoft.Json;
    using CalculateFunding.Common.Models;

    public class Calculation : Reference, ISpecificationAuthorizationEntity
    {
        public string SpecificationId { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public Reference CalculationSpecification { get; set; }

        public string SourceCode { get; set; }

        [JsonProperty("date")]
        public DateTime LastModified { get; set; }

        [JsonProperty("author")]
        public Reference LastModifiedBy { get; set; }

        public int Version { get; set; }

        public CalculationSpecificationType CalculationType { get; set; }

        public PublishStatus PublishStatus { get; set; }

        public string GetSpecificationId()
        {
            return SpecificationId;
        }
    }
}
