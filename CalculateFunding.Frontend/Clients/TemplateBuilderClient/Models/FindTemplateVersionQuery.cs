using System.Collections.Generic;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class FindTemplateVersionQuery
    {
        public string FundingStreamId { get; set; }
        
        public string FundingPeriodId { get; set; }
        
        public List<TemplateStatus> Statuses { get; set; }
    }
}