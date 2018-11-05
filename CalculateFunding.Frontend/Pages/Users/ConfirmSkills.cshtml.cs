using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.UsersClient.Models;
using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Users
{
    public class ConfirmSkillsModel : PageModel
    {
        private readonly IUsersApiClient _usersApiClient;
        private readonly IUserProfileService _userProfileService;

        public ConfirmSkillsModel(IUsersApiClient usersApiClient, IUserProfileService userProfileService)
        {
            Guard.ArgumentNotNull(usersApiClient, nameof(usersApiClient));
            Guard.ArgumentNotNull(userProfileService, nameof(userProfileService));

            _usersApiClient = usersApiClient;
            _userProfileService = userProfileService;
        }

        public Task<IActionResult> OnGetAsync()
        {
            return Task.FromResult<IActionResult>(Page());
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (this.HttpContext.User?.Identity?.Name != null)
            {
                string userName = this.HttpContext.User.Identity.Name;

                if (!Request.Cookies.ContainsKey(UserConstants.SkillsConfirmationCookieName))
                {
                    UserProfile userProfile = _userProfileService.GetUser();

                    UserConfirmModel confirmSkillsModel = new UserConfirmModel()
                    {
                        Name = userProfile.Fullname,
                        Username = userName,
                    };

                    ValidatedApiResponse<User> confirmResult = await _usersApiClient.ConfirmSkills(userProfile.Id, confirmSkillsModel);

                    if (confirmResult.StatusCode != HttpStatusCode.OK)
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
                Expires = DateTime.Now.AddDays(1),
                Secure = true,
                HttpOnly = true
            };

            Response.Cookies.Append(UserConstants.SkillsConfirmationCookieName, "true", option);
        }
    }
}