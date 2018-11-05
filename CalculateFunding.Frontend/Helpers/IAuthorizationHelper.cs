using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public interface IAuthorizationHelper
    {
        Task<bool> DoesUserHavePermission(ClaimsPrincipal user, ISpecificationAuthorizationEntity specification, SpecificationActionTypes permissionRequired);

        Task<bool> DoesUserHavePermission(ClaimsPrincipal user, IEnumerable<string> fundingStreamIds, FundingStreamActionTypes permissionRequired);

        Task<IEnumerable<FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired);

        Task<Clients.UsersClient.Models.FundingStreamPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId);
    }
}