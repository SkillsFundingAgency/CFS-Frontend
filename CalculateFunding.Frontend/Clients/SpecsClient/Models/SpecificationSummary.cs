using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.ApiClient.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
    public class SpecificationSummary : Reference, ISpecificationAuthorizationEntity
    {
        [JsonProperty("fundingPeriod")]
        public Reference FundingPeriod { get; set; }

        [JsonProperty("fundingStreams")]
        public IEnumerable<Reference> FundingStreams { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("approvalStatus")]
        public PublishStatus ApprovalStatus { get; set; }

        [JsonProperty("isSelectedForFunding")]
        public bool IsSelectedForFunding { get; set; }

        [JsonProperty("publishedResultsRefreshedAt")]
        public DateTimeOffset? PublishedResultsRefreshedAt { get; set; }

        public string GetSpecificationId()
        {
            return Id;
        }
    }
}
