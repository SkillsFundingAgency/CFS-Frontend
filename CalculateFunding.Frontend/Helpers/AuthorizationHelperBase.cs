using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Users;
using Microsoft.AspNetCore.Authorization;
using Serilog;

namespace CalculateFunding.Frontend.Helpers
{
    public class AuthorizationHelperBase
    {
        protected readonly IAuthorizationService _authorizationService;
        protected readonly IUsersApiClient _usersClient;
        protected readonly IPoliciesApiClient _policyClient;
        protected readonly IMapper _mapper;
        protected readonly ILogger _logger;

        public AuthorizationHelperBase(IAuthorizationService authorizationService,
            IUsersApiClient usersClient,
            IPoliciesApiClient policyClient,
            IMapper mapper,
            ILogger logger)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));
            Guard.ArgumentNotNull(usersClient, nameof(usersClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _authorizationService = authorizationService;
            _usersClient = usersClient;
            _policyClient = policyClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired)
        {
            AuthorizationResult authorizationResult = await _authorizationService.AuthorizeAsync(user, specificationId, new SpecificationRequirement(permissionRequired));
            return authorizationResult.Succeeded;
        }

        public async Task<IEnumerable<FundingStreamPermission>> GetOtherUsersFundingStreamPermissions(string userId)
        {
            Guard.IsNotEmpty(userId, nameof(userId));

            return await GetFundingStreamPermissionsForUser(userId);
        }

        public async Task<IEnumerable<User>> GetAdminUsersForFundingStream(ClaimsPrincipal user, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<User>> response = await _usersClient.GetAdminUsersForFundingStream(fundingStreamId);

            return response.Content;
        }

        protected async Task<FundingStreamPermission> UpdateFundingStreamPermission(
            string userId,
            string fundingStreamId,
            FundingStreamPermission permissions)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(permissions, nameof(permissions));

            FundingStreamPermissionUpdateModel update = _mapper.Map<FundingStreamPermissionUpdateModel>(permissions);
            ApiResponse<FundingStreamPermission> apiResponse = await _usersClient.UpdateFundingStreamPermission(userId, fundingStreamId, update);

            if (apiResponse.StatusCode != HttpStatusCode.OK || apiResponse.Content == null)
            {
                string message = $"Failed to update funding stream permissions for user ({userId}) - {apiResponse.StatusCode}";
                _logger.Error(message);
                throw new Exception(message);
            }

            return apiResponse.Content;
        }

        protected static bool SpecificationDoesNotHaveAllowedFundingStreams(
            SpecificationSummary specificationSummary, IEnumerable<string> allowedFundingStreamIds)
        {
            IEnumerable<Reference> specificationFundingStreams = specificationSummary.FundingStreams;
            IEnumerable<string> specFundingStreamsExceptAllowedUserFundingStreams =
                specificationFundingStreams.Select(fs => fs.Id).Except(allowedFundingStreamIds);
            return !specFundingStreamsExceptAllowedUserFundingStreams.Any();
        }

        protected async Task<IEnumerable<FundingStreamPermission>> GetFundingStreamPermissionsForUser(string userId)
        {
            ApiResponse<IEnumerable<FundingStreamPermission>> response =
                await _usersClient.GetFundingStreamPermissionsForUser(userId);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error("Failed to get funding stream permissions for user ({user}) - {statuscode}", userId,
                    response.StatusCode);
                {
                    return new List<FundingStreamPermissionModel>();
                }
            }

            return response.Content;
        }

        protected static string VerifyObjectIdentifierClaimTypePresent(ClaimsPrincipal claimsPrincipal)
        {
            if (!claimsPrincipal.HasClaim(c => c.Type == Common.Identity.Constants.ObjectIdentifierClaimType || c.Type == ClaimTypes.NameIdentifier))
            {
                throw new Exception("Cannot security trim a list when cannot identify the user");
            }
            
            Claim oidClaim = claimsPrincipal.Claims.FirstOrDefault(m => m.Type == Common.Identity.Constants.ObjectIdentifierClaimType 
                                                                        || m.Type == ClaimTypes.NameIdentifier);

            return oidClaim.Value;
        }
    }
}
