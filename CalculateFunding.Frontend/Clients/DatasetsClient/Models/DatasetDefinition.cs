namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using System.Collections.Generic;
    using CalculateFunding.Common.Models;

    public class DatasetDefinition : Reference
    {
        public string Description { get; set; }

        public IEnumerable<TableDefinition> TableDefinitions { get; set; }
    }
}
