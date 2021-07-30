using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.DataSets.Models;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class ReferencedSpecificationDatasetRelationshipResponse
    {
        public string RelationshipId { get; set; }
        public string RelationshipName { get; set; }
        public string RelationshipDescription { get; set; }
        public string ReferenceSpecificationId { get; set; }
        public string ReferenceSpecificationName { get; set; }
        public string CurrentSpecificationId { get; set; }
        public string CurrentSpecificationName { get; set; }
        public string FundingStreamId { get; set; }
        public string FundingStreamName { get; set; }
        public string FundingPeriodId { get; set; }
        public string FundingPeriodName { get; set; }
        public IEnumerable<PublishedSpecificationItem> FundingLines { get; set; }

        public IEnumerable<PublishedSpecificationItem> Calculations { get; set; }
    }
}
