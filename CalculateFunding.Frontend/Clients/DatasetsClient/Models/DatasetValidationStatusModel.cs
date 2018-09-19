using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetValidationStatusModel
    {
        public string OperationId { get; set; }

        public DatasetValidationStatusOperation CurrentOperation { get; set; }

        public string ErrorMessage { get; set; }

        public DateTimeOffset LastUpdated { get; set; }

        public string DatasetId { get; set; }

        public IDictionary<string, IEnumerable<string>> ValidationFailures { get; set; }
    }
}
