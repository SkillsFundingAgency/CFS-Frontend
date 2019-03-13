namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using System.Collections.Generic;
    using CalculateFunding.Common.Models;

    public class Dataset : Reference
    {
        public Reference Definition { get; set; }

        public string Description { get; set; }

        public IEnumerable<DatasetVersion> Versions { get; set; }
    }
}
