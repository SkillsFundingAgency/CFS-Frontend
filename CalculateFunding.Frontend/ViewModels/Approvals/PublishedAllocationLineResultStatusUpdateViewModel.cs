using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class PublishedAllocationLineResultStatusUpdateViewModel
    {
        [Required]
        public AllocationLineStatusViewModel Status { get; set; }

        [Required]
        public IEnumerable<PublishedAllocationLineResultStatusUpdateProviderViewModel> Providers { get; set; }
    }
}
