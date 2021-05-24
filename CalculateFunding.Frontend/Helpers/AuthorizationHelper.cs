using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Serilog;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public class AuthorizationHelper : AuthorizationHelperBase, IAuthorizationHelper
    {
        protected readonly PermissionOptions _permissionOptions;

        public AuthorizationHelper(
            IAuthorizationService authorizationService,
            IUsersApiClient usersClient,
            IPoliciesApiClient policyClient,
            IMapper mapper,
            ILogger logger,
            IOptions<PermissionOptions> permissionOptions) :
            base(authorizationService, usersClient, policyClient, mapper, logger)
        {
            _permissionOptions = permissionOptions.Value;
        }

        public async Task<FundingStreamPermission> GetUserFundingStreamPermissions(ClaimsPrincipal user, string fundingStreamId)
        {
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));

            var allFundingStreamPerms = await GetUserFundingStreamPermissions(user);

            return allFundingStreamPerms.SingleOrDefault(x => x.FundingStreamId == fundingStreamId);
        }

        public async Task<IEnumerable<FundingStreamPermission>> GetUserFundingStreamPermissions(ClaimsPrincipal user)
        {
            Guard.ArgumentNotNull(user, nameof(user));

            string userId = VerifyObjectIdentifierClaimTypePresent(user);
            bool isAdmin = IsAdminUser(user);

            if (isAdmin)
            {
                ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = await _policyClient.GetFundingStreams();
                IEnumerable<PolicyModels.FundingStream> fundingStreams = fundingStreamsResponse.Content;
                return fundingStreams.Select(fs =>
                    new FundingStreamPermission
                    {
                        UserId = userId,
                        FundingStreamId = fs.Id
                    }.SetAllBooleansTo(true));
            }
            else
            {
                return await GetFundingStreamPermissionsForUser(userId);
            }
        }

        public async Task<IEnumerable<PolicyModels.FundingStream>> SecurityTrimList(ClaimsPrincipal user,
            IEnumerable<PolicyModels.FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(fundingStreams, nameof(fundingStreams));

            if (IsAdminUser(user))
            {
                return fundingStreams;
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<FundingStreamPermission>> fundingStreamPermissionsResponse =
                await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK || fundingStreamPermissionsResponse.Content == null)
            {
                _logger.Error("Failed to get funding stream permissions for user for security trimming ({user}) - {statuscode}", user?.Identity?.Name,
                    fundingStreamPermissionsResponse.StatusCode);
                return Enumerable.Empty<PolicyModels.FundingStream>();
            }

            IEnumerable<FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

            if (permissionRequired == FundingStreamActionTypes.CanCreateSpecification)
            {
                allowedFundingStreams = allowedFundingStreams.Where(p => p.CanCreateSpecification);
            }
            else if (permissionRequired == FundingStreamActionTypes.CanChooseFunding)
            {
                allowedFundingStreams = allowedFundingStreams.Where(p => p.CanChooseFunding);
            }

            IEnumerable<string> allowedFundingStreamIds = allowedFundingStreams.Select(p => p.FundingStreamId);

            return fundingStreams.Where(fs => allowedFundingStreamIds.Contains(fs.Id));
        }

        public async Task<IEnumerable<SpecificationSummary>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<SpecificationSummary> specifications,
            SpecificationActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(specifications, nameof(specifications));

            if (IsAdminUser(user))
            {
                return specifications;
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<FundingStreamPermission>> fundingStreamPermissionsResponse =
                await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK || fundingStreamPermissionsResponse.Content == null)
            {
                _logger.Error("Failed to get funding stream permissions for user for security trimming ({user}) - {statuscode}", user?.Identity?.Name,
                    fundingStreamPermissionsResponse.StatusCode);
                return Enumerable.Empty<SpecificationSummary>();
            }

            IEnumerable<FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

            if (permissionRequired == SpecificationActionTypes.CanCreateQaTests)
            {
                allowedFundingStreams = allowedFundingStreams.Where(p => p.CanCreateQaTests);
            }
            else if (permissionRequired == SpecificationActionTypes.CanChooseFunding)
            {
                allowedFundingStreams = allowedFundingStreams.Where(p => p.CanChooseFunding);
            }
            else
            {
                throw new NotSupportedException(
                    $"Security trimming specifications by this permission ({permissionRequired} is not currently supported");
            }

            IEnumerable<string> allowedFundingStreamIds = allowedFundingStreams.Select(p => p.FundingStreamId);

            return specifications.Where(specificationSummary => SpecificationDoesNotHaveAllowedFundingStreams(specificationSummary, allowedFundingStreamIds));
        }

        public async Task<FundingStreamPermission> GetFundingStreamPermissionsForUser(ClaimsPrincipal requestedBy, string otherUserId, string fundingStreamId)
        {
            Guard.ArgumentNotNull(requestedBy, nameof(requestedBy));
            Guard.IsNullOrWhiteSpace(otherUserId, nameof(otherUserId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            if (false == await HasAdminPermissionForFundingStream(requestedBy, fundingStreamId))
            {
                string message = $"{requestedBy?.Identity?.Name} not allowed to get another user's funding stream permissions for {fundingStreamId}";
                _logger.Error(message);
                throw new SecurityException(message);
            }

            ApiResponse<IEnumerable<FundingStreamPermission>> response = await _usersClient.GetFundingStreamPermissionsForUser(otherUserId);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user ({user}) - {statuscode}", otherUserId, response.StatusCode);
            }

            return response.Content.DefaultIfEmpty(new FundingStreamPermission
            {
                FundingStreamId = fundingStreamId,
                UserId = otherUserId,
            }).SingleOrDefault(x => x.FundingStreamId == fundingStreamId);
        }

        public async Task<EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (IsAdminUser(user))
            {
                return new EffectiveSpecificationPermission
                {
                    SpecificationId = specificationId, UserId = user.GetUserProfile()?.Id,
                }.SetAllBooleansTo(true);
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<EffectiveSpecificationPermission> response = await _usersClient.GetEffectivePermissionsForUser(userId, specificationId);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get effective permissions for user ({user}) - {statuscode}", user?.Identity?.Name, response.StatusCode);

                return new EffectiveSpecificationPermission
                {
                    SpecificationId = specificationId,
                    UserId = user.GetUserProfile()?.Id,
                }.SetAllBooleansTo(false);
            }

            return response.Content;
        }

        public async Task<FundingStreamPermission> UpdateFundingStreamPermission(
            ClaimsPrincipal requestedBy,
            string userId,
            string fundingStreamId,
            FundingStreamPermission permissions)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(permissions, nameof(permissions));

            if (false == await HasAdminPermissionForFundingStream(requestedBy, fundingStreamId))
            {
                string message = $"{requestedBy?.Identity?.Name} not allowed to update the funding stream permissions for {fundingStreamId}";
                _logger.Error(message);
                throw new SecurityException(message);
            }

            return await base.UpdateFundingStreamPermission(userId, fundingStreamId, permissions);
        }

        public async Task<bool> HasAdminPermissionForFundingStream(ClaimsPrincipal user, string fundingStreamId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            if (IsAdminUser(user))
            {
                return true;
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);
            IEnumerable<FundingStreamPermission> fundingStreamPermissions = await GetFundingStreamPermissionsForUser(userId);

            FundingStreamPermission permissions = fundingStreamPermissions.SingleOrDefault(x => x.FundingStreamId == fundingStreamId);

            return permissions != null && permissions.CanAdministerFundingStream;
        }

        private bool IsAdminUser(ClaimsPrincipal user)
        {
            return user.HasClaim(c =>
                c.Type == Common.Identity.Constants.GroupsClaimType &&
                c.Value == _permissionOptions.AdminGroupId.ToString());
        }
    }
}
