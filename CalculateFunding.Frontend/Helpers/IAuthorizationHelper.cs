﻿using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public interface IAuthorizationHelper
    {
        Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired);

        Task<FundingStreamPermission> GetUserFundingStreamPermissions(ClaimsPrincipal user, string fundingStreamId);

        Task<IEnumerable<FundingStreamPermission>> GetOtherUsersFundingStreamPermissions(string userId);

        Task<IEnumerable<FundingStreamPermission>> GetUserFundingStreamPermissions(ClaimsPrincipal user);

        Task<IEnumerable<PolicyModels.FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<PolicyModels.FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired);

        Task<IEnumerable<SpecificationSummary>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<SpecificationSummary> specifications, SpecificationActionTypes permissionRequired);

        Task<EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId);

        Task<FundingStreamPermission> UpdateFundingStreamPermission(ClaimsPrincipal requestedBy, string userId, string fundingStreamId, FundingStreamPermission permissions);

        Task<IEnumerable<User>> GetAdminUsersForFundingStream(ClaimsPrincipal user, string fundingStreamId);

        Task<bool> HasAdminPermissionForFundingStream(ClaimsPrincipal user, string fundingStreamId);

        Task<FundingStreamPermission> GetFundingStreamPermissionsForUser(ClaimsPrincipal requestedBy, string otherUserId, string fundingStreamId);
    }
}
