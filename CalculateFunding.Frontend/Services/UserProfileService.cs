using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Security.Claims;

namespace CalculateFunding.Frontend.Services
{
    public class UserProfileService : IUserProfileService
    {
        private const string IdClaimName = "http://schemas.microsoft.com/identity/claims/objectidentifier";

        private readonly IHttpContextAccessor _httpContext;

        public UserProfileService(IHttpContextAccessor httpContext)
        {
            _httpContext = httpContext;
        }

        public UserProfile GetUser()
        {
            string username = _httpContext.HttpContext?.User?.Identity.Name;

            return new UserProfile
            {
                Id = Id,
                Username = username,
                Firstname = Firstname,
                Lastname = Lastname
            };
        }

        private string Id
        {
            get
            {
                Claim idClaim = _httpContext.HttpContext?.User?.Claims.FirstOrDefault(m => m.Type == IdClaimName);

                return idClaim != null ? idClaim.Value : "";
            }
        }

        private string Firstname
        {
            get
            {
                Claim givenNameClaim = _httpContext.HttpContext?.User?.Claims.FirstOrDefault(m => m.Type == ClaimTypes.GivenName);

                return givenNameClaim != null ? givenNameClaim.Value : "";
            }
        }

        private string Lastname
        {
            get
            {
                Claim givenNameClaim = _httpContext.HttpContext?.User?.Claims.FirstOrDefault(m => m.Type == ClaimTypes.Surname);

                return givenNameClaim != null ? givenNameClaim.Value : "";
            }
        }
    }
}
