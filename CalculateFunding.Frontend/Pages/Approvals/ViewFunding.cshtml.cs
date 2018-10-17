using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ViewFundingModel : PageModel
    {
        public string ShouldPublishButtonBeEnabled { get; private set; }

        public bool ShouldAllocationLineMajorMinorVersioningEnabled { get; private set; }

        public ViewFundingModel(IFeatureToggle features)
        {
            Guard.ArgumentNotNull(features, nameof(features));

            ShouldPublishButtonBeEnabled = features.IsPublishButtonEnabled().ToString().ToLowerInvariant();

            ShouldAllocationLineMajorMinorVersioningEnabled = features.IsAllocationLineMajorMinorVersioningEnabled();
        }

        public void OnGet()
        {
        }
    }
}