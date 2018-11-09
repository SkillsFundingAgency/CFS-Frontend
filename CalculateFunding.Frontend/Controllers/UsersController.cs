using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.UsersClient.Models;
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

        [Route("api/users/effectivepermissions/{specificationId}")]
        public async Task<IActionResult> GetEffectivePermissions(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            EffectiveSpecificationPermission effectivePermissions = await _authorizationHelper.GetEffectivePermissionsForUser(User, specificationId);

            return Ok(effectivePermissions);
        }
    }
}