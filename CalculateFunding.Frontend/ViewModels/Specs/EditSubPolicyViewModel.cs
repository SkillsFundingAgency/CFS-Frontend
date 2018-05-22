namespace CalculateFunding.Frontend.ViewModels.Specs
{
    using CalculateFunding.Frontend.Properties;
    using System.ComponentModel.DataAnnotations;

    public class EditSubPolicyViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SubPolicyDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        public string ParentPolicyId { get; set; }
    }
}
