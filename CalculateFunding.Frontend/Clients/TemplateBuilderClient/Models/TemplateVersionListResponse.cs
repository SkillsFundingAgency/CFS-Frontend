using System.Collections.Generic;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class TemplateVersionListResponse
    {
        public IEnumerable<TemplateSummaryResource> PageResults { get; set; }
        public int TotalCount { get; set; }
    }
}