namespace CalculateFunding.Frontend.Pages
{
    using System.Diagnostics;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ErrorModel : PageModel
    {
        public string RequestId { get; set; }

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);

        public void OnGet()
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
        }
    }
}
