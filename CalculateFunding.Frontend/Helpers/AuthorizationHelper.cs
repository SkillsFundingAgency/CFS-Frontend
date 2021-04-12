﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.ViewModels.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Serilog;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public class AuthorizationHelper : IAuthorizationHelper
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly IUsersApiClient _usersClient;
        private readonly IPoliciesApiClient _policyClient;
        private readonly ILogger _logger;
        private readonly PermissionOptions _permissionOptions;

        public AuthorizationHelper(
            IAuthorizationService authorizationService,
            IUsersApiClient usersClient,
            IPoliciesApiClient policyClient,
            ILogger logger,
            IOptions<PermissionOptions> permissionOptions)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));
            Guard.ArgumentNotNull(usersClient, nameof(usersClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(permissionOptions, nameof(permissionOptions));

            _authorizationService = authorizationService;
            _usersClient = usersClient;
            _policyClient = policyClient;
            _logger = logger;
            _permissionOptions = permissionOptions.Value;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired)
        {
            AuthorizationResult authorizationResult =
                await _authorizationService.AuthorizeAsync(user, specificationId, new SpecificationRequirement(permissionRequired));
            return authorizationResult.Succeeded;
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
                return await GetFundingStreamPermissionsForUser(userId, user);
            }
        }

        private async Task<IEnumerable<FundingStreamPermission>> GetFundingStreamPermissionsForUser(string userId, ClaimsPrincipal user)
        {
            ApiResponse<IEnumerable<FundingStreamPermission>> response =
                await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user ({user}) - {statuscode}", user?.Identity?.Name,
                    response.StatusCode);
                {
                    return new List<FundingStreamPermissionModel>();
                }
            }

            return response.Content;
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

        private static bool SpecificationDoesNotHaveAllowedFundingStreams(
            SpecificationSummary specificationSummary, IEnumerable<string> allowedFundingStreamIds)
        {
            IEnumerable<Reference> specificationFundingStreams = specificationSummary.FundingStreams;
            IEnumerable<string> specFundingStreamsExceptAllowedUserFundingStreams =
                specificationFundingStreams.Select(fs => fs.Id).Except(allowedFundingStreamIds);
            return !specFundingStreamsExceptAllowedUserFundingStreams.Any();
        }

        public async Task<EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (IsAdminUser(user))
            {
                return new EffectiveSpecificationPermission
                {
                    SpecificationId = specificationId,
                    UserId = user.GetUserProfile()?.Id,
                    CanAdministerFundingStream = true,
                    CanApproveFunding = true,
                    CanApproveSpecification = true,
                    CanChooseFunding = true,
                    CanCreateQaTests = true,
                    CanCreateSpecification = true,
                    CanEditCalculations = true,
                    CanEditQaTests = true,
                    CanEditSpecification = true,
                    CanMapDatasets = true,
                    CanReleaseFunding = true,
                    CanRefreshFunding = true,
                    CanDeleteCalculations = true,
                    CanDeleteQaTests = true,
                    CanDeleteSpecification = true,
                    CanApplyCustomProfilePattern = true,
                    CanApproveAnyCalculations = true,
                    CanApproveCalculations = true,
                    CanAssignProfilePattern = true,
                    CanApproveAllCalculations = true,
                    CanRefreshPublishedQa = true
                };
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<EffectiveSpecificationPermission> response = await _usersClient.GetEffectivePermissionsForUser(userId, specificationId);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get effective permissions for user ({user}) - {statuscode}", user?.Identity?.Name, response.StatusCode);

                return new EffectiveSpecificationPermission
                {
                    UserId = user.GetUserProfile()?.Id,
                    SpecificationId = specificationId,
                    CanAdministerFundingStream = false,
                    CanApproveFunding = false,
                    CanApproveSpecification = false,
                    CanChooseFunding = false,
                    CanCreateQaTests = false,
                    CanCreateSpecification = false,
                    CanEditCalculations = false,
                    CanEditQaTests = false,
                    CanEditSpecification = false,
                    CanMapDatasets = false,
                    CanReleaseFunding = false,
                    CanRefreshFunding = false,
                    CanDeleteCalculations = false,
                    CanDeleteQaTests = false,
                    CanDeleteSpecification = false,
                    CanApplyCustomProfilePattern = false,
                    CanApproveAnyCalculations = false,
                    CanApproveCalculations = false,
                    CanAssignProfilePattern = false,
                    CanApproveAllCalculations = false,
                    CanRefreshPublishedQa = false
                };
            }

            return response.Content;
        }

        private bool IsAdminUser(ClaimsPrincipal user)
        {
            return user.HasClaim(c =>
                c.Type == Common.Identity.Constants.GroupsClaimType &&
                c.Value == _permissionOptions.AdminGroupId.ToString());
        }

        private static string VerifyObjectIdentifierClaimTypePresent(ClaimsPrincipal claimsPrincipal)
        {
            if (!claimsPrincipal.HasClaim(c => c.Type == Common.Identity.Constants.ObjectIdentifierClaimType))
            {
                throw new Exception("Cannot security trim a list when cannot identify the user");
            }

            Claim oidClaim = claimsPrincipal.FindFirst(Common.Identity.Constants.ObjectIdentifierClaimType);

            return oidClaim.Value;
        }
    }
}