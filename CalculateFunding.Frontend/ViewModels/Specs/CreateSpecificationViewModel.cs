using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Properties;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CreateSpecificationViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationFundingStreamRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string FundingStreamId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.SpecificationDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Description { get; set; }
    }
}
