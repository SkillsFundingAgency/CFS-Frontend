namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    using CalculateFunding.Common.ApiClient.Models;

    public class DatasetVersion
    {
        public string Version { get; set; }

        public Reference Author { get; set; }
    }
}
