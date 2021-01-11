using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.ProviderResults
{
    public class ProviderResultForSpecification
    {
        public string SpecificationId { get; set; }
        public string SpecificationName { get; set; }
        public string FundingStreamId { get; set; }
        public string FundingStreamName { get; set; }

        public IDictionary<uint, FundingLineResult> FundingLineResults { get; set; }
        public IDictionary<uint, TemplateCalculationResult> CalculationResults { get; set; }
    }
}
