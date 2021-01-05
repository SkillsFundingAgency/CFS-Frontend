using System;
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
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
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

            if (IsAdminUser(user))
            {
                ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = await _policyClient.GetFundingStreams();

                if (fundingStreamsResponse.StatusCode == HttpStatusCode.OK)
                {
                    List<FundingStreamPermission> permissions = new List<FundingStreamPermission>();
                    foreach (PolicyModels.FundingStream fundingStream in fundingStreamsResponse.Content)
                    {
                        permissions.Add(new FundingStreamPermission
                        {
                            FundingStreamId = fundingStream.Id,
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
                            CanCreateTemplates = true,
                            CanEditTemplates = true,
                            CanDeleteTemplates = true,
                            CanApproveTemplates = true,
                            CanApplyCustomProfilePattern = true,
                            CanApproveAnyCalculations = true,
                            CanApproveCalculations = true,
                            CanAssignProfilePattern = true,
                            CanCreateProfilePattern = true,
                            CanDeleteCalculations = true,
                            CanDeleteProfilePattern = true,
                            CanDeleteQaTests = true,
                            CanDeleteSpecification = true,
                            CanEditProfilePattern = true,
                            CanApproveAllCalculations = true,
                            CanRefreshPublishedQa = true,
                            CanUploadDataSourceFiles = true,
                            UserId = user.GetUserProfile()?.Id
                        });
                    }

                    return permissions;
                }
            }

            ApiResponse<IEnumerable<FundingStreamPermission>> fundingStreamPermissionsResponse =
                await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user ({user}) - {statuscode}", user.Identity.Name,
                    fundingStreamPermissionsResponse.StatusCode);
                return new List<FundingStreamPermission>();
            }

            return fundingStreamPermissionsResponse.Content;
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

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user for security trimming ({user}) - {statuscode}", user.Identity.Name,
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

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user for security trimming ({user}) - {statuscode}", user.Identity.Name,
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

            return specifications.Where(s => !s.FundingStreams.Select(fs => fs.Id).Except(allowedFundingStreamIds).Any());
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
                _logger.Error("Failed to get effective permissions for user ({user}) - {statuscode}", user.Identity.Name, response.StatusCode);

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
            else
            {
                return response.Content;
            }
        }

        private bool IsAdminUser(ClaimsPrincipal user)
        {
            return user.HasClaim(c =>
                c.Type == Common.Identity.Constants.GroupsClaimType &&
                c.Value == _permissionOptions.AdminGroupId.ToString());
        }

        private static string VerifyObjectIdentifierClaimTypePresent(ClaimsPrincipal user)
        {
            if (!user.HasClaim(c => c.Type == Common.Identity.Constants.ObjectIdentifierClaimType))
            {
                throw new Exception("Cannot security trim a list when cannot identify the user");
            }
            else
            {
                return user.FindFirst(Common.Identity.Constants.ObjectIdentifierClaimType).Value;
            }
        }
    }
}