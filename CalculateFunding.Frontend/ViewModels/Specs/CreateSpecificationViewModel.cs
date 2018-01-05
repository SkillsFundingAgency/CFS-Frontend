using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class CreateSpecificationViewModel
    {
        [Required(ErrorMessage = "You must give a unique specification name")]
        public string Name { get; set; }

        [Required(ErrorMessage = "You must select at least one funding stream")]
        public string FundingStreamId { get; set; }

        [Required(ErrorMessage = "You must give a description for the specification")]
        public string Description { get; set; }
    }
}
