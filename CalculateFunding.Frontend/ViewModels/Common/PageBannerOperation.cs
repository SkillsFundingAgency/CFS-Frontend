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

        public string CurrentDataSourceRows { get; set; }

        public string PreviousDataSourceRows { get; set; }


        public BannerType BannerType { get; set; }
    }
}
