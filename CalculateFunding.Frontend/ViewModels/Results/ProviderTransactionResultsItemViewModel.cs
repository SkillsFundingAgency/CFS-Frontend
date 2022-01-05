namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class ProviderTransactionResultsItemViewModel
    {
        public string ProviderId { get; set; }

        public int MajorVersion { get; set; }

        public int MinorVersion { get; set; }

        public string ChannelName { get; set; }

        public string ChannelCode { get; set; }

        public string Status { get; set; }

        public string Author { get; set; }

        public string DateChanged { get; set; }

        public string TotalFunding { get; set; }

        public string[] VariationReasons { get; set; }
    }
}