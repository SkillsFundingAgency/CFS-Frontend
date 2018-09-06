using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ViewFunding2Model : PageModel
    {
        public PageBannerOperation PageBannerOperation { get; set; }

        public void OnGet()
        {
        }
    }
}