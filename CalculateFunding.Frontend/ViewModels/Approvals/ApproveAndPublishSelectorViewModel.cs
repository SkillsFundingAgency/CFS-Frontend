namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    using CalculateFunding.Frontend.Properties;
    using System.ComponentModel.DataAnnotations;
    public class ApproveAndPublishSelectorViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ApproveAndPublishFundingPeriodRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingPeriodId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ApproveAndPublishFundingStreamRequired), ErrorMessageResourceType = typeof(ValidationMessages))]

        public string FundingStreamId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.ApproveAndPublishSpecificationRequired), ErrorMessageResourceType = typeof(ValidationMessages))]

        public string SpecificationId { get; set; }

    }
}
