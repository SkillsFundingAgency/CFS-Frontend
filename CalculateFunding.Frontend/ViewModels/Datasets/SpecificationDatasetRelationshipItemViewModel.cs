using System;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class SpecificationDatasetRelationshipItemViewModel
    {
        public string DefinitionId { get; set; }

        public string DefinitionName { get; set; }

        public string DefinitionDescription { get; set; }

        public string DatasetName { get; set; }

        public string RelationshipDescription { get; set; }

        public int DatasetVersion { get; set; }

        public string DatasetId { get; set; }

        public string RelationshipId { get; set; }

        public string RelationName { get; set; }

		public bool IsProviderData { get; set; }


        public string DatasetPhrase
        {
            get
            {
                if (string.IsNullOrWhiteSpace(DatasetName))
                {
                    return "No data source file mapped";
                }

                return $"{DatasetName} (version {DatasetVersion})  ";
            }
        }

        public string LinkPhrase
        {
            get
            {
                if (string.IsNullOrWhiteSpace(DatasetName))
                {
                    return "Map data source file";
                }

                return "Change data source file";
            }
        }

        public bool IsLatestVersion { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }
        
        public string LastUpdatedAuthorName { get; set; }

        public bool HasDataSourceFileToMap { get; set; }
    }
}
