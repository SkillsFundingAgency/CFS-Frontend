using System.Linq;
using System.Security.Claims;
using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        private const string IdClaimName = "http://schemas.microsoft.com/identity/claims/objectidentifier";

        public static UserProfile GetUserProfile(this ClaimsPrincipal claimsPrincipal)
        {
            Claim idClaim = claimsPrincipal.Claims.FirstOrDefault(m => m.Type == IdClaimName);
            Claim givenNameClaim = claimsPrincipal.Claims.FirstOrDefault(m => m.Type == ClaimTypes.GivenName);
            Claim lastNameClaim = claimsPrincipal.Claims.FirstOrDefault(m => m.Type == ClaimTypes.Surname);

            return new UserProfile()
            {
                Firstname = givenNameClaim != null ? givenNameClaim.Value : "",
                Id = idClaim != null ? idClaim.Value : "",
                Lastname = lastNameClaim != null ? lastNameClaim.Value : "",
                UPN = claimsPrincipal.Identity.Name,
            };
        }
    }
}
