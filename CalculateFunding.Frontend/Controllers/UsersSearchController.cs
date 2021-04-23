using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Users;
using Microsoft.AspNetCore.Mvc;
using CalculateFunding.Common.Models.Search;

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

        [HttpGet]
        [Route("api/users/search")]
        public async Task<IActionResult> SearchUsers(int pageNumber, bool includeFacets, int pageSize, string searchTerm = "")
        {
            Guard.ArgumentNotNull(pageNumber, nameof(pageNumber));
            Guard.ArgumentNotNull(pageSize, nameof(pageSize));

            var request = new SearchRequestViewModel
            {
                PageNumber = pageNumber,
                IncludeFacets = includeFacets,
                SearchTerm = searchTerm,
                PageSize = pageSize,
                SearchMode = SearchMode.All
            };

            UserSearchResultViewModel result = await _userSearchService.PerformSearch(request);

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
