using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.TemplateMetadata.Models;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class FundingLineViewModel
    {
        public IEnumerable<FundingLine> FundingLines { get; set; }

        public IEnumerable<CalculationMetadata> Calculations { get; set; }

		public TemplateMapping TemplateMapping { get; set; }

		public string FundingStreamId { get; set; }

        public int BorderThicknessMultiplier { get; set; }
    }
}