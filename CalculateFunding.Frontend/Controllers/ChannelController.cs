using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    [ApiController]
    public class ChannelController : ControllerBase
    {
        private readonly IPublishingApiClient _publishingApiClient;

        public ChannelController(IPublishingApiClient publishingApiClient)
        {
            Guard.ArgumentNotNull(publishingApiClient, nameof(publishingApiClient));

            _publishingApiClient = publishingApiClient;
        }

        [Route("api/releasemanagement/channels")]
        [HttpGet]
        public async Task<IActionResult> GetAllChannels()
        {
            ApiResponse<IEnumerable<Channel>> response = await _publishingApiClient.GetAllChannels();

            return response.Handle(nameof(IEnumerable<Channel>),
                onSuccess: x => Ok(x.Content));
        }
    }
}
