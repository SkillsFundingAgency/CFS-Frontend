using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Providers.Models.Search;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ProviderController : Controller
    {
	    private IProvidersApiClient _providersApiClient;

	    public ProviderController(IProvidersApiClient providersApiClient)
	    {
		    _providersApiClient = providersApiClient;
	    }

	    [HttpGet]
	    [Route("api/provider/getproviderbyversionandid/{providerVersionId}/{providerId}")]
	    public async Task<IActionResult> GetProviderById(string providerVersionId, string providerId)
	    {
		    ApiResponse<ProviderVersionSearchResult> result = await _providersApiClient.GetProviderByIdFromProviderVersion(providerVersionId, providerId);


		    if (result.StatusCode == HttpStatusCode.OK)
		    {
			    return Ok(result.Content);
		    }

		    if (result.StatusCode == HttpStatusCode.BadRequest)
		    {
			    return BadRequest(result.Content);
		    }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
	    }
    }
}