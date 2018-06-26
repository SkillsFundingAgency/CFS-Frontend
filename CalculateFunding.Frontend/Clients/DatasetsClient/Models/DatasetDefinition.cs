namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class DatasetDefinition : Reference
    {
        public string Description { get; set; }

        public IEnumerable<TableDefinition> TableDefinitions { get; set; }
    }
}
