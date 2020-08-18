﻿using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Core.Middleware
{
    public class SkillsCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public SkillsCheckMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            bool hasConfirmedSkills = context.Request.Cookies.ContainsKey(UserConstants.SkillsConfirmationCookieName);

            if (context.User.Identity.IsAuthenticated)
            {
                if (!hasConfirmedSkills && 
                    !context.Request.Path.Value.Contains("api/account/hasConfirmedSkills", StringComparison.InvariantCultureIgnoreCase))
                {
                    IUsersApiClient usersApiClient = context.RequestServices.GetService<IUsersApiClient>();

                    UserProfile profile = context.User.GetUserProfile();

                    ApiResponse<User> apiResponse = await usersApiClient.GetUserByUserId(profile.Id);

                    if (apiResponse.StatusCode != HttpStatusCode.OK || !apiResponse.Content.HasConfirmedSkills)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return;
                    }
                    CookieOptions option = new CookieOptions
                    {
                        Expires = DateTime.Now.AddDays(1),
                        Secure = true,
                        HttpOnly = true
                    };

                    context.Response.Cookies.Append(UserConstants.SkillsConfirmationCookieName, "true", option);
                }
            }

            await _next(context);
        }
    }
}
