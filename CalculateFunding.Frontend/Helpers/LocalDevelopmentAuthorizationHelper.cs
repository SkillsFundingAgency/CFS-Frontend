using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Authorization;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Helpers
{
    public class LocalDevelopmentAuthorizationHelper : IAuthorizationHelper
    {
        private readonly IAuthorizationService _authorizationService;
        private readonly IPoliciesApiClient _policyClient;

        public LocalDevelopmentAuthorizationHelper(
            IAuthorizationService authorizationService,
            IPoliciesApiClient policyClient)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));

            _authorizationService = authorizationService;
            _policyClient = policyClient;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired)
        {
            AuthorizationResult authorizationResult = await _authorizationService.AuthorizeAsync(user, specificationId, new SpecificationRequirement(permissionRequired));
            return authorizationResult.Succeeded;
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

        public async Task<FundingStreamPermission> UpdateFundingStreamPermission(ClaimsPrincipal user, string userId, string fundingStreamId, FundingStreamPermission permissions)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.ArgumentNotNull(permissions, nameof(permissions));

            permissions.UserId = userId;
            permissions.FundingStreamId = fundingStreamId;
            return await Task.FromResult(permissions);
        }
    }
}