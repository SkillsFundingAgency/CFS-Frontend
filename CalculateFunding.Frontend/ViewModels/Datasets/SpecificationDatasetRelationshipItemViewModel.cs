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
        
        public CalculateFunding.Common.ApiClient.DataSets.Models.DatasetRelationshipType RelationshipType { get; set; }

        public int DatasetVersion { get; set; }

        public string DatasetId { get; set; }

        public bool ConverterEnabled { get; set; }

        public string RelationshipId { get; set; }

        public string RelationName { get; set; }

		public bool IsProviderData { get; set; }

        public bool IsLatestVersion { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }
        
        public string LastUpdatedAuthorName { get; set; }

        public bool HasDataSourceFileToMap { get; set; }
        public string ReferencedSpecificationName { get; set; }
    }
}
