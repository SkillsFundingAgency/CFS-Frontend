using CalculateFunding.Common.ApiClient.Specifications.Models;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class FundingLineProfileVariationPointer
    {
        public string FundingLineId { get; set; }

        public string FundingLineName { get; set; }
        public ProfileVariationPointer ProfileVariationPointer { get; set; }
    }
}
