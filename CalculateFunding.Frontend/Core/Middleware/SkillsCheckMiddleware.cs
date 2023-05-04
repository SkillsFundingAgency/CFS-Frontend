using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using System.Net.Sockets;

namespace CalculateFunding.Frontend.Core.Middleware
{
    public class SkillsCheckMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger _logger;

        public SkillsCheckMiddleware(RequestDelegate next, ILogger logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                if (context.User.Identity.IsAuthenticated)
                {
                    bool haveCookieForConfirmedSkills = context.Request.Cookies.ContainsKey(UserConstants.SkillsConfirmationCookieName);

                    if (!haveCookieForConfirmedSkills && DoesRequestRequireSkills(context.Request))
                    {
                        IUsersApiClient usersApiClient = context.RequestServices.GetService<IUsersApiClient>();

                        UserProfile profile = context.User.GetUserProfile();

                        ApiResponse<User> apiResponse = await usersApiClient.GetUserByUserId(profile.Id);

                        if (apiResponse.StatusCode != HttpStatusCode.OK)
                        {
                            context.Response.StatusCode = (int)apiResponse.StatusCode;
                            context.Response.WriteAsync("Could not verify that user has confirmed skills").Wait();
                            return;
                        }

                        if (!apiResponse.Content.HasConfirmedSkills)
                        {
                            context.Response.StatusCode = 451;
                            context.Response.WriteAsync("User has not confirmed skills").Wait();
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
            catch(SocketException socEx)
            {
                _logger.Error(socEx.Source.ToString());
                _logger.Error(socEx.InnerException.ToString());
                _logger.Error(socEx.SocketErrorCode.ToString());
                _logger.Error(socEx.StackTrace);
                _logger.Error(socEx.ToString());
                _logger.Error(socEx.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex.ToString());
            }
        }

        private bool DoesRequestRequireSkills(HttpRequest request)
        {
            string path = request.Path.Value.ToLower();
            path = path.EndsWith("/") ? path.Substring(0, path.Length - 1) : path;

            return path.Length > 0 &&
                   !path.EndsWith("/app") &&
                   !path.Contains("assets/") &&
                   !path.Contains("api/account") &&
                   !path.EndsWith("api/featureflags") &&
                   !path.EndsWith("api/users/permissions/fundingstreams");
        }
    }
}