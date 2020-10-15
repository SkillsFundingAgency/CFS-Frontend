using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class FundingStreamWithSpecificationSelectedForFundingModel
    {
        public FundingStreamWithSpecificationSelectedForFundingModel()
        {
            Periods = new List<FundingPeriodWithSpecificationSelectedForFundingModel>();
        }

        public string Id { get; set; }
        public string Name { get; set; }
        public List<FundingPeriodWithSpecificationSelectedForFundingModel> Periods { get; set; }
    }
}