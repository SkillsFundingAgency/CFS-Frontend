namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using System;

    public class TestScenario : Reference, ISpecificationAuthorizationEntity
    {
        public string Description { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public int Version { get; set; }

        public DateTimeOffset? CurrentVersionDate { get; set; }

        public Reference Author { get; set; }

        public string Commment { get; set; }

        public string PublishStatus { get; set; }

        public string Gherkin { get; set; }

        public string SpecificationId { get; set; }

        public string GetSpecificationId()
        {
            return SpecificationId;
        }
    }
}
