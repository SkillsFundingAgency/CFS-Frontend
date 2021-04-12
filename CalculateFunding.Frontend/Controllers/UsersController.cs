using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Users;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IMapper _mapper;

        public UsersController(IAuthorizationHelper authorizationHelper, IPoliciesApiClient policiesApiClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _authorizationHelper = authorizationHelper;
            _policiesApiClient = policiesApiClient;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("api/users/effectivepermissions/{specificationId}")]
        public async Task<IActionResult> GetEffectivePermissions(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            EffectiveSpecificationPermission effectivePermissions = await _authorizationHelper.GetEffectivePermissionsForUser(User, specificationId);

            return Ok(effectivePermissions);
        }

        [HttpGet]
        [Route("api/users/permissions/fundingstreams")]
        public async Task<IEnumerable<FundingStreamPermissionModel>> GetAllFundingStreamPermissions()
        {
            var permissions = await _authorizationHelper.GetUserFundingStreamPermissions(User);

            List<FundingStreamPermissionModel> results = new List<FundingStreamPermissionModel>();

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = await _policiesApiClient.GetFundingStreams();

            foreach (FundingStreamPermission fundingStreamPermission in permissions)
            {
                FundingStreamPermissionModel permissionModel = _mapper.Map<FundingStreamPermissionModel>(fundingStreamPermission);

                string fundingStreamName = fundingStreamsResponse.Content.SingleOrDefault(_ => _.Id == fundingStreamPermission.FundingStreamId)?.Name;

                permissionModel.FundingStreamName = string.IsNullOrWhiteSpace(fundingStreamName) ? fundingStreamPermission.FundingStreamId : fundingStreamName;
                
                results.Add(permissionModel);
            }

            return results;
        }


    }
}