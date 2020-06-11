namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateCreateCommand
    {
        public string FundingStreamId { get; set; }

        public string FundingPeriodId { get; set; }

        public string SchemaVersion { get; set; }
        
        public string Description { get; set; }
    }
}