﻿using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.Services;
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

        public AccountController(IUsersApiClient usersApiClient, IAuthorizationHelper authHelper, IUserProfileService userProfileService)
        {
            Guard.ArgumentNotNull(usersApiClient, nameof(usersApiClient));
            Guard.ArgumentNotNull(authHelper, nameof(authHelper));
            Guard.ArgumentNotNull(userProfileService, nameof(userProfileService));
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
            if (IsUserAuthenticated())
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
            
            if (!IsUserAuthenticated())
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
                return StatusCode(204, "Could not verify that user has confirmed skills");
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

            if (!IsUserAuthenticated())
            {
                return new UnauthorizedResult();
            }

            UserProfile userProfile = _userProfileService.GetUser();

            UserConfirmModel confirmSkillsModel = new UserConfirmModel
            {
                Name = userProfile.Fullname,
                Username = User?.Identity?.Name
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

        private bool IsUserAuthenticated() => 
            User?.Identity?.IsAuthenticated == true;
    }
}