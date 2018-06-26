using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Approvals
{
    public class PublishedAllocationLineResultStatusUpdateProviderViewModel
    {
        [Required]
        public string ProviderId { get; set; }

        [Required]
        public string AllocationLineId { get; set; }
    }
}
