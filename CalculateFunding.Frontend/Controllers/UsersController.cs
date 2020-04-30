using System.Threading.Tasks;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IAuthorizationHelper _authorizationHelper;

        public UsersController(IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _authorizationHelper = authorizationHelper;
        }

        [HttpGet]
        [Route("api/users/effectivepermissions/{specificationId}")]
        public async Task<IActionResult> GetEffectivePermissions(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            Common.ApiClient.Users.Models.EffectiveSpecificationPermission effectivePermissions = await _authorizationHelper.GetEffectivePermissionsForUser(User, specificationId);

            return Ok(effectivePermissions);
        }
        
        [HttpGet]
        [Route("api/users/permissions/fundingstreams")]
        public async Task<IActionResult> GetAllFundingStreamPermissions()
        {
            var permissions = await _authorizationHelper.GetUserFundingStreamPermissions(User);

            return Ok(permissions);
        }
    }
}