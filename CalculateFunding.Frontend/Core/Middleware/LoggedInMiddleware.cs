using System;
using System.Net.Sockets;
using System.Threading.Tasks;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace CalculateFunding.Frontend.Core.Middleware
{
    public class LoggedInMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IUserProfileProvider _userProfileProvider;
        private readonly IUserProfileService _userProfileService;
        private readonly ILogger _logger;

        public LoggedInMiddleware(RequestDelegate next, IUserProfileProvider userProfileProvider, IUserProfileService userProfileService, ILogger logger)
        {
                Guard.ArgumentNotNull(next, nameof(next));
                Guard.ArgumentNotNull(userProfileProvider, nameof(userProfileProvider));
                Guard.ArgumentNotNull(userProfileService, nameof(userProfileService));

                _next = next;
                _userProfileProvider = userProfileProvider;
                _userProfileService = userProfileService;
                _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
                try
                {
                    Common.ApiClient.Models.UserProfile apiUserProfile = _userProfileService.GetUser();

                    UserProfile userProfile = new UserProfile(string.IsNullOrWhiteSpace(apiUserProfile.Id) ? "testid" : apiUserProfile.Id,
                        string.IsNullOrWhiteSpace(apiUserProfile.Fullname) ? "testuser" : apiUserProfile.Fullname);

                    _userProfileProvider.UserProfile = userProfile;

                    // Call the next delegate/middleware in the pipeline
                    await this._next(context);
                }
                catch (SocketException socEx)
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
    }
}