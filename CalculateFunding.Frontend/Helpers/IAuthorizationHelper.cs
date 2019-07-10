using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public interface IAuthorizationHelper
    {
        Task<bool> DoesUserHavePermission(ClaimsPrincipal user, ISpecificationAuthorizationEntity specification, SpecificationActionTypes permissionRequired);

        Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired);

        Task<bool> DoesUserHavePermission(ClaimsPrincipal user, IEnumerable<string> fundingStreamIds, FundingStreamActionTypes permissionRequired);

        Task<IEnumerable<PolicyModels.FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<PolicyModels.FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired);

        Task<IEnumerable<SpecificationSummary>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<SpecificationSummary> specifications, SpecificationActionTypes permissionRequired);

        Task<Common.ApiClient.Users.Models.EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId);
    }
}