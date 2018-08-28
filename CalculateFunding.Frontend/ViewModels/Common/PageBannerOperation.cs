namespace CalculateFunding.Frontend.ViewModels.Common
{
    public class PageBannerOperation
    {
        public string EntityName { get; set; }

        public string EntityType { get; set; }

        public string OperationAction { get; set; }

        public string OperationId { get; set; }

        public string ActionText { get; set; }

        public string ActionUrl { get; set; }

        public string SecondaryActionUrl { get; set; }

        public bool DisplayOperationActionSummary { get; set; }

        public string OperationActionSummaryText { get; set; }

        public int CurrentDataSourceRows { get; set; }

        public int PreviousDataSourceRows { get; set; }


        public BannerType BannerType { get; set; }
    }
}
