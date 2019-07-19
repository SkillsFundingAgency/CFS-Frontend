namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Frontend.Properties;

    public class CreateCalculationViewModel
    {
        public string SpecificationId { get; set; }

        public string AllocationLineId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationTypeRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string CalculationType { get; set; }
    }
}
