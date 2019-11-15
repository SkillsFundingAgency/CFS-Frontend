namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using System.ComponentModel.DataAnnotations;
    using Properties;

    public class CreateSpecificationViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingStreamRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingStreamId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationProviderVersionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string ProviderVersionId { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingPeriodRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingPeriodId { get; set; }
    }
}
