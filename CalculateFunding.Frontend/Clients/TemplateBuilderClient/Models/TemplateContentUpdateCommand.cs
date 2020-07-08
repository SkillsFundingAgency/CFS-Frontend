namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateContentUpdateCommand
    {
        public string TemplateId { get; set; }

        public string TemplateFundingLinesJson { get; set; }

        public int Version { get; set; }
    }
}