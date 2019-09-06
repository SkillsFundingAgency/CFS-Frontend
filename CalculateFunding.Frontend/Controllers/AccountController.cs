using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class AccountController : Controller
    {
        [AllowAnonymous]
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return RedirectToPage("/errors/401");
        }

        [HttpGet]
        public IActionResult IsAuthenticated()
        {
	        if (User.Identity.IsAuthenticated)
	        { return new OkObjectResult(User.Identity); }

	        return new UnauthorizedResult();
        }
    }
}