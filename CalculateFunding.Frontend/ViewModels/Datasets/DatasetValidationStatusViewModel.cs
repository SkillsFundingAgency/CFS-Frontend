using System;
using System.Collections.Generic;
using CalculateFunding.Frontend.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class DatasetValidationStatusViewModel
    {
        public string OperationId { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public DatasetValidationStatusOperationViewModel CurrentOperation { get; set; }

        public string ErrorMessage { get; set; }

        public DateTimeOffset LastUpdated { get; set; }

        public string DatasetId { get; set; }

        public IDictionary<string, IEnumerable<string>> ValidationFailures { get; set; }

        public string ValidateDatasetJobId { get; set; }

        public string LastUpdatedFormatted
        {
            get
            {
                return LastUpdated.ToString(FormatStrings.DateTimeFormatString);
            }
        }
    }
}
