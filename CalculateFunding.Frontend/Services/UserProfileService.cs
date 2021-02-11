using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Http;

namespace CalculateFunding.Frontend.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IHttpContextAccessor _httpContext;

        public UserProfileService(IHttpContextAccessor httpContext)
        {
            Guard.ArgumentNotNull(httpContext, nameof(httpContext));
            _httpContext = httpContext;
        }

        public UserProfile GetUser()
        {
            return _httpContext.HttpContext?.User?.GetUserProfile();
        }
    }
}
