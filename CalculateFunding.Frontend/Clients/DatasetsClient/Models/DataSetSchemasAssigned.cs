namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class DatasetSchemasAssigned : Reference
    {
        public string Description { get; set; }

        public Reference DatasetDefinition { get; set; }

        public Reference Specification { get; set; }

        public bool IsSetAsProviderData { get; set; }

        public bool UsedInDataAggregations { get; set; }
    }
}