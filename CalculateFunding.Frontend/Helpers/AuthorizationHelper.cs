using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Authorization;

namespace CalculateFunding.Frontend.Helpers
{
    public class AuthorizationHelper : IAuthorizationHelper
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly IUsersApiClient _usersClient;

        public AuthorizationHelper(IAuthorizationService authorizationService, IUsersApiClient usersClient)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));
            Guard.ArgumentNotNull(usersClient, nameof(usersClient));

            _authorizationService = authorizationService;
            _usersClient = usersClient;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, ISpecificationAuthorizationEntity specification, SpecificationActionTypes permissionRequired)
        {
            AuthorizationResult authorizationResult = await _authorizationService.AuthorizeAsync(user, specification, new SpecificationRequirement(permissionRequired));
            return authorizationResult.Succeeded;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, IEnumerable<string> fundingStreamIds, FundingStreamActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(fundingStreamIds, nameof(fundingStreamIds));

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> fundingStreamPermissionsResponse = await _usersClient.GetFundingStreamPermissionsForUser(userId);

            IEnumerable<Clients.UsersClient.Models.FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

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

        public async Task<IEnumerable<FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.ArgumentNotNull(fundingStreams, nameof(fundingStreams));

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> fundingStreamPermissionsResponse = await _usersClient.GetFundingStreamPermissionsForUser(userId);

            IEnumerable<Clients.UsersClient.Models.FundingStreamPermission> allowedFundingStreams = fundingStreamPermissionsResponse.Content;

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

        public async Task<Clients.UsersClient.Models.FundingStreamPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            string userId = VerifyObjectIdentifierClaimTypePresent(user);

            ApiResponse<Clients.UsersClient.Models.FundingStreamPermission> response = await _usersClient.GetEffectivePermissionsForUser(userId, specificationId);
            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new Clients.UsersClient.Models.FundingStreamPermission
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
                    CanPublishFunding = false,
                    CanRefreshFunding = false
                };
            }
            else
            {
                return response.Content;
            }
        }

        private static string VerifyObjectIdentifierClaimTypePresent(ClaimsPrincipal user)
        {
            if (!user.HasClaim(c => c.Type == Common.Identity.Authorization.Constants.ObjectIdentifierClaimType))
            {
                throw new Exception("Cannot security trim a list when cannot identify the user");
            }
            else
            {
                return user.FindFirst(Common.Identity.Authorization.Constants.ObjectIdentifierClaimType).Value;
            }
        }
    }
}
