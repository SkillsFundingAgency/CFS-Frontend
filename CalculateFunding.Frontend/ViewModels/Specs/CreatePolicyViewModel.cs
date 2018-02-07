using CalculateFunding.Frontend.Properties;
using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CreatePolicyViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }
    }
}
