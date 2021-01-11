namespace CalculateFunding.Frontend.ViewModels.ProviderResults
{
    public class FundingLineResult
    {
        public uint TemplateLineId { get; set; }

        public string FundingLineCode { get; set; }

        public string Name { get; set; }

        public decimal? Value { get; set; }

        public string ExceptionMessage { get; set; }
    }
}
