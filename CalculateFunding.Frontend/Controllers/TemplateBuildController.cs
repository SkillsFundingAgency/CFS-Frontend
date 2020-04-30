using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace CalculateFunding.Frontend.Controllers
{
    public class TemplateBuildController : ControllerBase
    {
        private readonly ITemplateBuilderApiClient _client;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly ILogger _logger;

        public TemplateBuildController(ITemplateBuilderApiClient client, IAuthorizationHelper authorizationHelper, ILogger logger)
        {
            _client = client;
            _authorizationHelper = authorizationHelper;
            _logger = logger;
        }

        [HttpPost]
        [Route("api/templates/build")]
        public async Task<IActionResult> CreateDraftTemplate([FromBody] TemplateCreateModel createModel)
        {
            Guard.ArgumentNotNull(createModel, nameof(createModel));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            FundingStreamPermission permissions = await _authorizationHelper.GetUserFundingStreamPermissions(User, createModel.FundingStreamId);
            if (!permissions.CanCreateTemplates)
            {
                _logger.Error($"User [{User?.Identity?.Name}] has insufficient permissions to create a {createModel.FundingStreamId} template");
                return Forbid(new AuthenticationProperties());
            }
            
            ApiResponse<string> result = await _client.CreateDraftTemplate(new TemplateCreateCommand
            {
                Name = createModel.Name,
                Description = createModel.Description,
                FundingStreamId = createModel.FundingStreamId,
                SchemaVersion = createModel.SchemaVersion
            });

            if (result.StatusCode == HttpStatusCode.Created)
            {
                return Created($"api/templates/build/{result.Content}", result.Content);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.Content);
            }

            return new InternalServerErrorResult("There was an error processing your request. Please try again.");
        }
    }
}