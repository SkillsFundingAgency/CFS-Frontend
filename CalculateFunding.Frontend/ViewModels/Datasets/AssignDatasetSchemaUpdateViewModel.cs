namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class AssignDatasetSchemaUpdateViewModel
    {
        public string DatasetDefinitionId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
        
        public bool IsSetAsProviderData { get; set; }

        public bool ConverterEnabled { get; set; }
    }
}
