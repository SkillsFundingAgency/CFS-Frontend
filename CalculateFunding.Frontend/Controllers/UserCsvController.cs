using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.ViewModels.Users;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    [ApiController]
    public class UserCsvController : ControllerBase
    {
        private readonly IUsersApiClient _usersClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public UserCsvController(
            ILogger logger,
            IUsersApiClient usersClient,
            IMapper mapper)
        {
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(usersClient, nameof(usersClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _logger = logger;
            _usersClient = usersClient;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("api/users/effectivepermissions/generate-report/{fundingStreamId}")]
        public async Task<IActionResult> DownloadEffectivePermissionsForFundingStream([FromRoute] string fundingStreamId)
        {
            ApiResponse<FundingStreamPermissionCurrentDownloadModel> response =
                await _usersClient.DownloadEffectivePermissionsForFundingStream(fundingStreamId);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error($"Failed to get funding stream permissions CSV for funding stream {fundingStreamId} Status Code: {response.StatusCode}");
                return NotFound();
            }

            FundingStreamPermissionCurrentDownloadModel downloadModel = response.Content;

            FundingStreamPermissionCurrentDownloadViewModel downloadViewModel = 
                _mapper.Map<FundingStreamPermissionCurrentDownloadViewModel>(downloadModel);

            return Ok(downloadViewModel);
        }
    }
}
