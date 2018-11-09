using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using Microsoft.AspNetCore.Authorization;

namespace CalculateFunding.Frontend.Helpers
{
    public class LocalDevelopmentAuthorizationHelper : IAuthorizationHelper
    {
        private readonly IAuthorizationService _authorizationService;

        public LocalDevelopmentAuthorizationHelper(IAuthorizationService authorizationService)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));

            _authorizationService = authorizationService;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, ISpecificationAuthorizationEntity specification, SpecificationActionTypes permissionRequired)
        {
            AuthorizationResult authorizationResult = await _authorizationService.AuthorizeAsync(user, specification, new SpecificationRequirement(permissionRequired));
            return authorizationResult.Succeeded;
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, string specificationId, SpecificationActionTypes permissionRequired)
        {
            return await Task.FromResult(true);
        }

        public async Task<bool> DoesUserHavePermission(ClaimsPrincipal user, IEnumerable<string> fundingStreamIds, FundingStreamActionTypes permissionRequired)
        {
            return await Task.FromResult(true);
        }

        public async Task<IEnumerable<FundingStream>> SecurityTrimList(ClaimsPrincipal user, IEnumerable<FundingStream> fundingStreams, FundingStreamActionTypes permissionRequired)
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

        public async Task<Clients.UsersClient.Models.EffectiveSpecificationPermission> GetEffectivePermissionsForUser(ClaimsPrincipal user, string specificationId)
        {
            Guard.ArgumentNotNull(user, nameof(user));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await Task.FromResult(new Clients.UsersClient.Models.EffectiveSpecificationPermission
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
                CanPublishFunding = true,
                CanRefreshFunding = true
            });
        }
    }
}
