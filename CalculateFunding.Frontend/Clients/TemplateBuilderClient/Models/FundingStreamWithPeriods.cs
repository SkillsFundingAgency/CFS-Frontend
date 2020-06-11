using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models
{
    public class FundingStreamWithPeriods
    {
        public FundingStream FundingStream { get; set; }
        public IEnumerable<FundingPeriod> FundingPeriods { get; set; }
    }
}