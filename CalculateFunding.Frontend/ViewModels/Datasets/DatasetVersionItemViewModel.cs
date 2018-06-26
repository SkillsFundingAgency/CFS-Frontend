namespace CalculateFunding.Frontend.Clients.DatasetsClient.Models
{
    public class DatasetVersionItemViewModel
    {
        public DatasetVersionItemViewModel(string datasetId, string datasetName, int version, bool isSelected = false)
        {
            DatasetId = datasetId;
            DatasetName = datasetName;
            Version = version;
            IsSelected = isSelected;
        }

        public bool IsSelected { get; set; }

        public string DatasetId { get; private set; }

        public string DatasetName { get; private set; }

        public int Version { get; private set; }

        public override string ToString()
        {
            return $"{DatasetName} (version {Version})";
        }

        public string UniqueName
        {
            get
            {
                return $"{DatasetId}_{Version}";
            }
        }
    }
}
