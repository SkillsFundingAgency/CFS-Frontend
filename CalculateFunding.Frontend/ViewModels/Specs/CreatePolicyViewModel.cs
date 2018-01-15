using CalculateFunding.Frontend.Properties;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

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
