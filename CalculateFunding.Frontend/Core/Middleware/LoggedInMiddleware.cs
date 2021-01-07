using System.Threading.Tasks;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Http;

namespace CalculateFunding.Frontend.Core.Middleware
{
    public class LoggedInMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IUserProfileProvider _userProfileProvider;
        private readonly IUserProfileService _userProfileService;

        public LoggedInMiddleware(RequestDelegate next, IUserProfileProvider userProfileProvider, IUserProfileService userProfileService)
        {
            Guard.ArgumentNotNull(next, nameof(next));
            Guard.ArgumentNotNull(userProfileProvider, nameof(userProfileProvider));
            Guard.ArgumentNotNull(userProfileService, nameof(userProfileService));

            _next = next;
            _userProfileProvider = userProfileProvider;
            _userProfileService = userProfileService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            Common.ApiClient.Models.UserProfile apiUserProfile = _userProfileService.GetUser();

            UserProfile userProfile = new UserProfile(string.IsNullOrWhiteSpace(apiUserProfile.Id) ? "testid" : apiUserProfile.Id,
                string.IsNullOrWhiteSpace(apiUserProfile.Fullname) ? "testuser" : apiUserProfile.Fullname);

            _userProfileProvider.UserProfile = userProfile;

            // Call the next delegate/middleware in the pipeline
            await this._next(context);
        }
    }
}