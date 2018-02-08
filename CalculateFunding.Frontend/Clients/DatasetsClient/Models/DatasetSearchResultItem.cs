namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using System;
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class DatasetSearchResultItem : Reference
    {
        public string Status { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
