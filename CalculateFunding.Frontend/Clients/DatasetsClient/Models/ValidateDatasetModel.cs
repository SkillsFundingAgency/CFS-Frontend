namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class ValidateDatasetModel
    {
        public string DatasetId { get; set; }

        public int Version { get; set; }

        public string Filename { get; set; }
    }
}
