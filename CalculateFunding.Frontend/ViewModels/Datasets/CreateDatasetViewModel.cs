namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class CreateDatasetViewModel
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string DataDefinitionId { get; set; }

        public string Filename { get; set; }
        
        public string FundingStreamId { get; set; }
    }
}
