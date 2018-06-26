namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class ValidateDatasetModel
    {
        public string DatasetId { get; set; }

        public int Version { get; set; }

        public string Filename { get; set; }

        public string Description { get; set; }

        public string Comment { get; set; }
    }
}
