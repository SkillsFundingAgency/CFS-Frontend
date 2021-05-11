using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Serilog;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public class LocalDevelopmentAuthorizationHelper : AuthorizationHelperBase, IAuthorizationHelper
    {
        public LocalDevelopmentAuthorizationHelper(
            IAuthorizationService authorizationService,
            IPoliciesApiClient policyClient,
            IUsersApiClient usersClient,
            IMapper mapper,
            ILogger logger) :
            base(authorizationService, usersClient, policyClient, mapper, logger)
        {
        }

        public Task<FundingStreamPermission> GetUserFundingStreamPermissions(ClaimsPrincipal user, string fundingStreamId)
        {
            return Task.FromResult(new FundingStreamPermission
            {
                UserId = user.GetUserProfile()?.Id,
                FundingStreamId = fundingStreamId
            }.SetAllBooleansTo(true));
        }

        public async Task<IEnumerable<FundingStreamPermission>> GetUserFundingStreamPermissions(ClaimsPrincipal user)
        {
            string userId = user.GetUserProfile()?.Id;
            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = await _policyClient.GetFundingStreams();
            var fundingStreams = fundingStreamsResponse.Content;

            return fundingStreams.Select(fs =>
                new FundingStreamPermission
                {
                    UserId = userId,
                    FundingStreamId = fs.Id
                }.SetAllBooleansTo(true))
                .ToList();
        }

        public async Task<IEnumerable<PolicyModels.FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<PolicyModels.FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(fundingStreams, nameof(fundingStreams));

            return await Task.FromResult(fundingStreams);
        }

        public async Task<IEnumerable<SpecificationSummary>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<SpecificationSummary> specifications, SpecificationActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(specifications, nameof(specifications));

            return await Task.FromResult(specifications);
        }

        public async Task<EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await Task.FromResult(new EffectiveSpecificationPermission
            {
                SpecificationId = specificationId,
                UserId = user.GetUserProfile()?.Id,
            }.SetAllBooleansTo(true));
        }

        public async Task<IEnumerable<User>> GetAdminUsersForFundingStream(ClaimsPrincipal user, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            return await Task.FromResult(new List<User>
            {
                new User
                {
                    Username = user.GetUserProfile().AsUserName(),
                }
            });
        }

        public Task<bool> HasAdminPermissionForFundingStream(ClaimsPrincipal user, string fundingStreamId)
        {
            return Task.FromResult(true);
        }

        public async Task<FundingStreamPermission> GetFundingStreamPermissionsForUser(ClaimsPrincipal requestedBy, string otherUserId, string fundingStreamId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));

            var allFundingStreamPerms = await base.GetFundingStreamPermissionsForUser(otherUserId);

            var permissions = allFundingStreamPerms.SingleOrDefault(x => x.FundingStreamId == fundingStreamId);
            
            return permissions ?? new FundingStreamPermission
            {
                FundingStreamId = fundingStreamId,
                UserId = otherUserId,
            }.SetAllBooleansTo(false);
        }

        public async Task<FundingStreamPermission> UpdateFundingStreamPermission(
            ClaimsPrincipal requestedBy,
            string userId,
            string fundingStreamId,
            FundingStreamPermission permissions)
        {
            return await base.UpdateFundingStreamPermission(userId, fundingStreamId, permissions);
        }
    }
}
