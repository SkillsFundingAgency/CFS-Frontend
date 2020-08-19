using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class AccountController : Controller
    {
        private readonly IUsersApiClient _usersApiClient;
        private readonly IAuthorizationHelper _authHelper;
        private readonly IUserProfileService _userProfileService;
        private readonly AuthenticationOptions _authenticationOptions;

        public AccountController(IUsersApiClient usersApiClient, IAuthorizationHelper authHelper, IUserProfileService userProfileService)
        {
            _usersApiClient = usersApiClient;
            _authHelper = authHelper;
            _userProfileService = userProfileService;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return RedirectToPage("/errors/401");
        }

        [HttpGet]
        [Route("api/account/IsAuthenticated")]
        public IActionResult IsAuthenticated()
        {
            if (User.Identity.IsAuthenticated)
            {
                return new OkObjectResult(User.Identity);
            }

            return new UnauthorizedResult();
        }

        [HttpGet]
        [Route("api/account/hasConfirmedSkills")]
        public async Task<IActionResult> GetHasConfirmedSkills()
        {
            if (EnableAuthBypass())
            {
                return Ok();
            }
            
            if (!User.Identity.IsAuthenticated)
            {
                return new UnauthorizedResult();
            }

            UserProfile profile = User.GetUserProfile();
            
            ApiResponse<User> apiResponse = await _usersApiClient.GetUserByUserId(profile.Id);

            if (apiResponse.StatusCode == HttpStatusCode.OK && apiResponse.Content.HasConfirmedSkills)
            {
                CookieOptions option = new CookieOptions
                {
                    Expires = DateTime.Now.AddDays(1),
                    Secure = true,
                    HttpOnly = true
                };
                Response.Cookies.Append(UserConstants.SkillsConfirmationCookieName, "true", option);
                return Ok();
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPut]
        [Route("api/account/hasConfirmedSkills")]
        public async Task<IActionResult> UpdateHasConfirmedSkills()
        {
            if (EnableAuthBypass())
            {
                return Ok();
            }

            if (!User.Identity.IsAuthenticated)
            {
                return new UnauthorizedResult();
            }

            UserProfile userProfile = _userProfileService.GetUser();

            UserConfirmModel confirmSkillsModel = new UserConfirmModel
            {
                Name = userProfile.Fullname,
                Username = User.Identity.Name
            };

            ValidatedApiResponse<User> confirmResult = await _usersApiClient.ConfirmSkills(userProfile.Id, confirmSkillsModel);

            if (confirmResult.StatusCode == HttpStatusCode.OK)
            {
                return Ok();
            }

            return confirmResult.ModelState == null ? BadRequest("Could not confirm user skills") : BadRequest(confirmResult.ModelState);
        }

        private bool EnableAuthBypass()
        {
            return _authHelper.GetType().FullName == typeof(LocalDevelopmentAuthorizationHelper).FullName;
        }
    }
}