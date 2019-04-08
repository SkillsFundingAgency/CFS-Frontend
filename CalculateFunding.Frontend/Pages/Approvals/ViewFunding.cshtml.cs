using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ViewFundingModel : PageModel
    {
        public string ShouldPublishButtonBeEnabled { get; private set; }

		public bool ShouldProviderInformationViewBeEnabled { get; private set; }

		public bool ShouldFiltersBeEnabled { get; private set; }

        public bool ShouldCheckJobStatusForChooseAndRefreshBeEnabled { get; private set; }

        public ViewFundingModel(IFeatureToggle features)
		{
			Guard.ArgumentNotNull(features, nameof(features));

			ShouldPublishButtonBeEnabled = features.IsPublishButtonEnabled().ToString().ToLowerInvariant();

			ShouldFiltersBeEnabled = features.IsPublishAndApprovePageFiltersEnabled();

			ShouldProviderInformationViewBeEnabled = features.IsProviderInformationViewInViewFundingPageEnabled();

            ShouldCheckJobStatusForChooseAndRefreshBeEnabled = features.IsCheckJobStatusForChooseAndRefreshEnabled();
        }

        public void OnGet()
        {
        }
    }
}