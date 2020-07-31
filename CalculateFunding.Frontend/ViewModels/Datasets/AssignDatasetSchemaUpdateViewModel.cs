namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Frontend.Properties;

    public class AssignDatasetSchemaUpdateViewModel
    {
        public string DatasetDefinitionId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
        
        public bool IsSetAsProviderData { get; set; }
    }
}
