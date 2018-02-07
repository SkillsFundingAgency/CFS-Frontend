using System;
using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetSearchResultItem : Reference
    {
        public string Status { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
