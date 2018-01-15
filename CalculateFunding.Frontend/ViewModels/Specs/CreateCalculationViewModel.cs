using CalculateFunding.Frontend.Properties;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CreateCalculationViewModel
    {
        public string SpecificationId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationAllocationLineRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string AllocationLineId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationPolicyIdRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string PolicyId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.CalculationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }
    }
}
