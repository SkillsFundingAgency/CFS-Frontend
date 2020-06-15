namespace CalculateFunding.Frontend.Pages
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class IndexModel : PageModel
    {
        public void OnGet()
        {
            Response.Redirect("/app");
        }
    }
}