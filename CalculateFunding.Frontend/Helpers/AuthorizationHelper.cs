using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Serilog;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public class AuthorizationHelper : IAuthorizationHelper
    {
        private class SpecificationAuthorizationEntity : ISpecificationAuthorizationEntity
        {
            private string _specificationId;

            public SpecificationAuthorizationEntity(string specificationId)
            {
                Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
                _specificationId = specificationId;
            }

            public string GetSpecificationId()
            {
                return _specificationId;
            }
        }

        private readonly IAuthorizationService _authorizationService;
        private readonly IUsersApiClient _usersClient;
        private readonly ILogger _logger;
        private readonly PermissionOptions _permissionOptions;

        public AuthorizationHelper(IAuthorizationService authorizationService, IUsersApiClient usersClient, ILogger logger, IOptions<PermissionOptions> permissionOptions)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));
            Guard.ArgumentNotNull(usersClient, nameof(usersClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(permissionOptions, nameof(permissionOptions));

            _authorizationService = authorizationService;
            _usersClient = usersClient;
            _logger = logger;
            _permissionOptions = permissionOptions.Value;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, ISpecificationAuthorizationEntity specification, SpecificationActionTypes permissionRequired)
        {
            AuthorizationResult authorizationResult = await _authorizationService.AuthorizeAsync(user, specification, new SpecificationRequirement(permissionRequired));
            return authorizationResult.Succeeded;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired)
        {
            SpecificationAuthorizationEntity entity = new SpecificationAuthorizationEntity(specificationId);
            return await DoesUserHavePermission(user, entity, permissionRequired);
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, IEnumerable<string> fundingStreamIds, FundingStreamActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(fundingStreamIds, nameof(fundingStreamIds));

            if (user.HasClaim(c => c.Type == Common.Identity.Constants.GroupsClaimType && c.Value.ToLowerInvariant() == _permissionOptions.AdminGroupId.ToString().ToLowerInvariant()))
            {
                return true;
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<Common.ApiClient.Users.Models.FundingStreamPermission>> fundingStreamPermissionsResponse = await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user ({user}) - {statuscode}", user.Identity.Name, fundingStreamPermissionsResponse.StatusCode);
                return false;
            }

            IEnumerable<Common.ApiClient.Users.Models.FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

            if (permissionRequired == FundingStreamActionTypes.CanCreateSpecification)
            {
                allowedFundingStreams = allowedFundingStreams.Where(p => p.CanCreateSpecification);
            }
            else if (permissionRequired == FundingStreamActionTypes.CanChooseFunding)
            {
                allowedFundingStreams = allowedFundingStreams.Where(p => p.CanChooseFunding);
            }

            IEnumerable<string> allowedFundingStreamIds = allowedFundingStreams.Select(p => p.FundingStreamId);

            return !fundingStreamIds.Except(allowedFundingStreamIds).Any();
        }

        public async Task<IEnumerable<PolicyModels.FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<PolicyModels.FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(fundingStreams, nameof(fundingStreams));

            if (user.HasClaim(c => c.Type == Common.Identity.Constants.GroupsClaimType && c.Value.ToLowerInvariant() == _permissionOptions.AdminGroupId.ToString().ToLowerInvariant()))
            {
                return fundingStreams;
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<Common.ApiClient.Users.Models.FundingStreamPermission>> fundingStreamPermissionsResponse = await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user for security trimming ({user}) - {statuscode}", user.Identity.Name, fundingStreamPermissionsResponse.StatusCode);
                return Enumerable.Empty<PolicyModels.FundingStream>();
            }

            IEnumerable<Common.ApiClient.Users.Models.FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

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

        public async Task<IEnumerable<SpecificationSummary>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<SpecificationSummary> specifications, SpecificationActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(specifications, nameof(specifications));

            if (user.HasClaim(c => c.Type == Common.Identity.Constants.GroupsClaimType && c.Value.ToLowerInvariant() == _permissionOptions.AdminGroupId.ToString().ToLowerInvariant()))
            {
                return specifications;
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<Common.ApiClient.Users.Models.FundingStreamPermission>> fundingStreamPermissionsResponse = await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (fundingStreamPermissionsResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user for security trimming ({user}) - {statuscode}", user.Identity.Name, fundingStreamPermissionsResponse.StatusCode);
                return Enumerable.Empty<SpecificationSummary>();
            }

            IEnumerable<Common.ApiClient.Users.Models.FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

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
                throw new NotSupportedException($"Security trimming specifications by this permission ({permissionRequired} is not currently supported");
            }

            IEnumerable<string> allowedFundingStreamIds = allowedFundingStreams.Select(p => p.FundingStreamId);

            return specifications.Where(s => !s.FundingStreams.Select(fs => fs.Id).Except(allowedFundingStreamIds).Any());
        }

        public async Task<Common.ApiClient.Users.Models.EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (user.HasClaim(c => c.Type == Common.Identity.Constants.GroupsClaimType && c.Value.ToLowerInvariant() == _permissionOptions.AdminGroupId.ToString().ToLowerInvariant()))
            {
                return new Common.ApiClient.Users.Models.EffectiveSpecificationPermission
                {
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
                    SpecificationId = specificationId,
                    UserId = user.GetUserProfile()?.Id,
                };
            }

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<Common.ApiClient.Users.Models.EffectiveSpecificationPermission> response = await _usersClient.GetEffectivePermissionsForUser(userId, specificationId);
            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get effective permissions for user ({user}) - {statuscode}", user.Identity.Name, response.StatusCode);

                
                return new Common.ApiClient.Users.Models.EffectiveSpecificationPermission
                {
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
                    SpecificationId = specificationId,
                    UserId = user.GetUserProfile()?.Id,
                };
            }
            else
            {
                return response.Content;
            }
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
