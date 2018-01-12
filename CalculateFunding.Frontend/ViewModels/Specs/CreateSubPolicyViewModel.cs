﻿using CalculateFunding.Frontend.Properties;
using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CreateSubPolicyViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SubPolicyDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.PolicyParentIdRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string ParentPolicyId { get; set; }
    }
}
