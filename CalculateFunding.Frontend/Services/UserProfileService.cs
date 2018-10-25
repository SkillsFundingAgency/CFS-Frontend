using CalculateFunding.Frontend.Clients.CommonModels;
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
            _httpContext = httpContext;
        }

        public UserProfile GetUser()
        {
            return _httpContext.HttpContext?.User.GetUserProfile();
        }
    }
}
