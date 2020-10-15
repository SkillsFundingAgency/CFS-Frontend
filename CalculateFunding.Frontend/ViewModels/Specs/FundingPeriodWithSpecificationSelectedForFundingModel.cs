using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class FundingPeriodWithSpecificationSelectedForFundingModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<SpecificationSelectedForFundingModel> Specifications { get; set; }
    }
}