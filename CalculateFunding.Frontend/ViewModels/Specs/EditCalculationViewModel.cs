namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using CalculateFunding.Frontend.Properties;
    using System.ComponentModel.DataAnnotations;

    public class EditCalculationViewModel
    {
        public string AllocationLineId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationPolicyIdRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string PolicyId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationTypeRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string CalculationType { get; set; }

        public bool IsPublic { get; set; }
    }
}
