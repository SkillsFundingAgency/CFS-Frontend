using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Users;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class UsersSearchController : Controller
    {
        private IUserSearchService _userSearchService;

        public UsersSearchController(IUserSearchService userSearchService)
        {
            Guard.ArgumentNotNull(userSearchService, nameof(userSearchService));
            _userSearchService = userSearchService;
        }

        [HttpPost]
        [Route("api/users/search")]
        public async Task<IActionResult> SearchUsers([FromBody] SearchRequestViewModel searchRequest)
        {
            Guard.ArgumentNotNull(searchRequest, nameof(searchRequest));

            UserSearchResultViewModel result = await _userSearchService.PerformSearch(searchRequest);

            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
