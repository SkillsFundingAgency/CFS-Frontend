namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateCreateAsCloneCommand
    {
        public string CloneFromTemplateId { get; set; }
        
        public string FundingStreamId { get; set; }

        public string FundingPeriodId { get; set; }

        public string Description { get; set; }
        
        public string Version { get; set; }
    }
}