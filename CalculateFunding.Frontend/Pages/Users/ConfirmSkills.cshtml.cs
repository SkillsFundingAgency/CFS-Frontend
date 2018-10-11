using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using Microsoft.AspNetCore.Http;
using CalculateFunding.Frontend.Constants;

namespace CalculateFunding.Frontend.Pages.Users
{
    public class ConfirmSkillsModel : PageModel
    {
        private readonly IUsersApiClient _usersApiClient;

        public ConfirmSkillsModel(IUsersApiClient usersApiClient)
        {
            _usersApiClient = usersApiClient;
        }

        public Task<IActionResult> OnGetAsync()
        {
            return Task.FromResult<IActionResult>(Page());
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (this.HttpContext.User?.Identity?.Name != null) {

                string userName = this.HttpContext.User.Identity.Name;

                if (!Request.Cookies.ContainsKey(UserContstants.SkillsConfirmationCookieName))
                {
                    HttpStatusCode statusCode = await _usersApiClient.ConfirmSkills(userName);

                    if (statusCode != HttpStatusCode.NoContent)
                    {
                        throw new InvalidOperationException($"Failed to confirm skills for {userName}");
                    }

                    SetCookie();
                }
            }

            return Redirect("/");
        }

        public void SetCookie()
        {
            CookieOptions option = new CookieOptions
            {
                Expires = DateTime.Now.AddYears(3),
                Secure = true,
                HttpOnly = true
            };

            Response.Cookies.Append(UserContstants.SkillsConfirmationCookieName, "true", option);
        }
    }
}