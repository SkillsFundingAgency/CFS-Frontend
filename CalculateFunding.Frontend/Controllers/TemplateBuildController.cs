using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Extensions;
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

        [HttpPut]
        [Route("api/templates/build/content")]
        public async Task<IActionResult> UpdateTemplateContent([FromBody] TemplateContentUpdateModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<string> result = await _client.UpdateTemplateContent(new TemplateContentUpdateCommand
            {
                TemplateId = model.TemplateId,
                TemplateJson = model.TemplateJson
            });

            switch (result.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok();
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int)result.StatusCode, 
                        result.Content.IsNullOrEmpty() ? "There was an error processing your request. Please try again." : result.Content);
            }
        }

        [HttpPut]
        [Route("api/templates/build/metadata")]
        public async Task<IActionResult> UpdateTemplateMetadata([FromBody] TemplateMetadataUpdateModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<string> result = await _client.UpdateTemplateMetadata(new TemplateMetadataUpdateCommand
            {
                TemplateId = model.TemplateId,
                Name = model.Name,
                Description = model.Description
            });

            switch (result.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok();
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int)result.StatusCode, 
                        result.Content.IsNullOrEmpty() ? "There was an error processing your request. Please try again." : result.Content);
            }
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/versions")]
        public async Task<IActionResult> GetTemplateVersions([FromRoute] string templateId, [FromQuery] List<TemplateStatus> statuses)
        {
	        ApiResponse<List<TemplateVersionResource>> result = await _client.GetTemplateVersions(templateId, statuses);     

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