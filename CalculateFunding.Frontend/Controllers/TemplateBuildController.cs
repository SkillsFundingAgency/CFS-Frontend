using System.Collections.Generic;
using System.Net;
using System.Net.Mime;
using System.Text;
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
using Microsoft.Net.Http.Headers;
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

        [HttpGet]
        [Route("api/templates/build/{templateId}")]
        public async Task<IActionResult> GetTemplate([FromRoute] string templateId)
        {
            ApiResponse<TemplateResource> result = await _client.GetTemplate(templateId);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int) result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/versions/{version}")]
        public async Task<IActionResult> GetTemplateVersion([FromRoute] string templateId, [FromRoute] string version)
        {
            ApiResponse<TemplateResource> result = await _client.GetTemplateVersion(templateId, version);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int) result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/published")]
        public async Task<IActionResult> GetPublishedTemplatesByFundingStreamAndPeriod([FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId)
        {
            ApiResponse<IEnumerable<TemplateResource>> result = await _client
                .GetPublishedTemplatesByFundingStreamAndPeriod(fundingStreamId, fundingPeriodId);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int) result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/versions")]
        public async Task<IActionResult> GetTemplateVersions(
            [FromRoute] string templateId, 
            [FromQuery] List<TemplateStatus> statuses, 
            [FromQuery] int page, 
            [FromQuery] int itemsPerPage)
        {
            ApiResponse<TemplateVersionListResponse> result = 
                await _client.GetTemplateVersions(templateId, statuses, page, itemsPerPage);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int) result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/available-stream-periods")]
        public async Task<IActionResult> GetFundingStreamPeriodsWithoutTemplates()
        {
            ApiResponse<List<FundingStreamWithPeriods>> result = await _client.GetFundingStreamPeriodsWithoutTemplates();

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int) result.StatusCode);
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

            ValidatedApiResponse<string> result = await _client.CreateDraftTemplate(new TemplateCreateCommand
            {
                Description = createModel.Description,
                FundingStreamId = createModel.FundingStreamId,
                FundingPeriodId = createModel.FundingPeriodId,
                SchemaVersion = "1.1"
            });

            switch (result.StatusCode)
            {
                case HttpStatusCode.Created:
                    return Created($"api/templates/build/{result.Content}", result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int) result.StatusCode);
            }
        }

        [HttpPost]
        [Route("api/templates/build/clone")]
        public async Task<IActionResult> CreateTemplateAsClone([FromBody] TemplateCreateAsCloneCommand createModel)
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

            ValidatedApiResponse<string> result = await _client.CreateTemplateAsClone(createModel);

            switch (result.StatusCode)
            {
                case HttpStatusCode.Created:
                    return Created($"api/templates/build/{result.Content}", result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int) result.StatusCode);
            }
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

            ValidatedApiResponse<int> result = await _client.UpdateTemplateContent(new TemplateContentUpdateCommand
            {
                TemplateId = model.TemplateId,
                TemplateFundingLinesJson = model.TemplateFundingLinesJson
            });

            switch (result.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok(result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int) result.StatusCode, "There was an error processing your request. Please try again.");
            }
        }

        [HttpPut]
        [Route("api/templates/build/{templateId}/restore/{version}")]
        public async Task<IActionResult> RestoreTemplate([FromBody] TemplateContentUpdateModel model,
            [FromRoute] string templateId, [FromRoute] int version)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            if (model.TemplateId != templateId)
            {
                ModelState.AddModelError("TemplateId", "TemplateId in payload doesn't match route parameter.");
                return BadRequest(ModelState);
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<int> result = await _client.RestoreContent(new TemplateContentUpdateCommand
            {
                TemplateId = model.TemplateId,
                TemplateFundingLinesJson = model.TemplateFundingLinesJson,
                Version = version
            });

            switch (result.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok(result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int)result.StatusCode);
            }
        }

        [HttpPut]
        [Route("api/templates/build/description")]
        public async Task<IActionResult> UpdateDescription([FromBody] TemplateDescriptionUpdateModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ValidatedApiResponse<string> result = await _client.UpdateTemplateDescription(new TemplateDescriptionUpdateCommand
            {
                TemplateId = model.TemplateId,
                Description = model.Description
            });

            switch (result.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok();
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int) result.StatusCode,
                        result.Content.IsNullOrEmpty() ? "There was an error processing your request. Please try again." : result.Content);
            }
        }

        [HttpPost("api/templates/build/{templateId}/publish")]
        public async Task<IActionResult> PublishTemplate([FromRoute] string templateId, [FromBody] TemplatePublishModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            NoValidatedContentApiResponse result = await _client.PublishTemplate(model);

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.ModelState);
            }

            return StatusCode((int) result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/export")]
        public async Task<IActionResult> Export([FromRoute] string templateId, [FromQuery] string version)
        {
            ApiResponse<TemplateResource> result;

            if (!string.IsNullOrWhiteSpace(version))
            {
                result = await _client.GetTemplateVersion(templateId, version);
            }
            else
            {
                result = await _client.GetTemplate(templateId);
            }

            if (result.StatusCode.IsSuccess())
            {
                TemplateResource template = result.Content;
                string templateJson = result.Content.TemplateJson;
                byte[] templateBytes = !string.IsNullOrWhiteSpace(templateJson)
                    ? Encoding.ASCII.GetBytes(templateJson)
                    : new byte[] { };
                string fileName =
                    $"template-{template.FundingStreamId}-{template.FundingPeriodId}-{template.MajorVersion}-{template.MinorVersion}.json";

                Response.Headers[HeaderNames.ContentDisposition] = new ContentDisposition
                {
                    FileName = fileName,
                    DispositionType = DispositionTypeNames.Inline,
                    Inline = true
                }.ToString();

                return new FileContentResult(templateBytes, "application/json");
            }

            return StatusCode((int) result.StatusCode);
        }

        [HttpPost]
        [Route("api/templates/build/search")]
        public async Task<IActionResult> SearchTemplates([FromBody] SearchModel request)
        {
            ValidatedApiResponse<SearchResults<TemplateIndex>> result = await _client.SearchTemplates(request);

            switch (result.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok(result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int) result.StatusCode);
            }
        }
    }
}