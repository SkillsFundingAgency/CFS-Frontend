using System;
using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetDefinitionSearchResultItem : Reference
    {
        public string Description { get; set; }

        public string ProviderIdentifier { get; set; }

        public DateTimeOffset LastUpdatedDate { get; set; }
    }
}
