using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
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

        public LocalDevelopmentAuthorizationHelper(IAuthorizationService authorizationService)
        {
            Guard.ArgumentNotNull(authorizationService, nameof(authorizationService));

            _authorizationService = authorizationService;
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
		        UserId = user.GetUserProfile()?.Id,
		        FundingStreamId = fundingStreamId
	        });
        }

        public Task<IEnumerable<FundingStreamPermission>> GetUserFundingStreamPermissions(ClaimsPrincipal user)
        {
	        return Task.FromResult(new []
	        {
		        new FundingStreamPermission
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
			        CanCreateTemplates = true,
			        CanEditTemplates = true,
			        CanDeleteTemplates = true,
			        CanApproveTemplates = true,
			        UserId = user.GetUserProfile()?.Id,
			        FundingStreamId = "DSG"
		        },
		        new FundingStreamPermission
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
			        CanCreateTemplates = true,
			        CanEditTemplates = true,
			        CanDeleteTemplates = true,
			        CanApproveTemplates = true,
			        UserId = user.GetUserProfile()?.Id,
			        FundingStreamId = "PSG"
		        },
		        new FundingStreamPermission
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
			        CanCreateTemplates = true,
			        CanEditTemplates = true,
			        CanDeleteTemplates = true,
			        CanApproveTemplates = true,
			        UserId = user.GetUserProfile()?.Id,
			        FundingStreamId = "DSG-AT"
		        }
	        } as IEnumerable<FundingStreamPermission>);
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
            });
        }
    }
}
