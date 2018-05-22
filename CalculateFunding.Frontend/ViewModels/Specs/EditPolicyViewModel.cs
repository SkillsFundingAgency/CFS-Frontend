namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using CalculateFunding.Frontend.Properties;
    using System.ComponentModel.DataAnnotations;

    public class EditPolicyViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        public string Id { get; set; }
    }
}
