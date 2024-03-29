﻿using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Extensions;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using Serilog;

namespace CalculateFunding.Frontend.Controllers
{
    public class TemplateBuildController : ControllerBase
    {
        private readonly ITemplateBuilderApiClient _templateBuilderApiClient;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public TemplateBuildController(ITemplateBuilderApiClient templateBuilderApiClient,
            IAuthorizationHelper authorizationHelper, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(templateBuilderApiClient, nameof(templateBuilderApiClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _templateBuilderApiClient = templateBuilderApiClient;
            _authorizationHelper = authorizationHelper;
            _logger = logger;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}")]
        public async Task<IActionResult> GetTemplate([FromRoute] string templateId)
        {
            Guard.IsNullOrWhiteSpace(templateId, nameof(templateId));

            ApiResponse<TemplateResource> result = await _templateBuilderApiClient.GetTemplate(templateId);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int)result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/versions/{version}")]
        public async Task<IActionResult> GetTemplateVersion([FromRoute] string templateId, [FromRoute] string version)
        {
            Guard.IsNullOrWhiteSpace(templateId, nameof(templateId));
            Guard.IsNullOrWhiteSpace(version, nameof(version));

            ApiResponse<TemplateResource> result =
                await _templateBuilderApiClient.GetTemplateVersion(templateId, version);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int)result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/fundingStream/{fundingStreamId}/fundingPeriod/{fundingPeriodId}/published")]
        public async Task<IActionResult> GetPublishedTemplatesByFundingStreamAndPeriod(
            [FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            ApiResponse<IEnumerable<TemplateResource>> result = await _templateBuilderApiClient
                .GetPublishedTemplatesByFundingStreamAndPeriod(fundingStreamId, fundingPeriodId);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int)result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/versions")]
        public async Task<IActionResult> GetTemplateVersions(
            [FromRoute] string templateId,
            [FromQuery] List<TemplateStatus> statuses,
            [FromQuery] int page,
            [FromQuery] int itemsPerPage)
        {
            Guard.IsNullOrWhiteSpace(templateId, nameof(templateId));

            ApiResponse<TemplateVersionListResponse> result =
                await _templateBuilderApiClient.GetTemplateVersions(templateId, statuses, page, itemsPerPage);

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int)result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/available-stream-periods")]
        public async Task<IActionResult> GetFundingStreamPeriodsWithoutTemplates()
        {
            ApiResponse<List<FundingStreamWithPeriods>> result =
                await _templateBuilderApiClient.GetFundingStreamPeriodsWithoutTemplates();

            if (result.StatusCode.IsSuccess())
                return Ok(result.Content);

            return StatusCode((int)result.StatusCode);
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

            FundingStreamPermission permissions =
                await _authorizationHelper.GetUserFundingStreamPermissions(User, createModel.FundingStreamId);
            if (!permissions.CanCreateTemplates)
            {
                _logger.Error(
                    $"User [{User?.Identity?.Name}] has insufficient permissions to create a {createModel.FundingStreamId} template");
                return Forbid(new AuthenticationProperties());
            }

            ValidatedApiResponse<string> result = await _templateBuilderApiClient.CreateDraftTemplate(
                new TemplateCreateCommand
                {
                    Description = createModel.Description,
                    FundingStreamId = createModel.FundingStreamId,
                    FundingPeriodId = createModel.FundingPeriodId,
                    SchemaVersion = "1.2"
                });

            switch (result.StatusCode)
            {
                case HttpStatusCode.Created:
                    return Created($"api/templates/build/{result.Content}", result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int)result.StatusCode);
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

            FundingStreamPermission permissions =
                await _authorizationHelper.GetUserFundingStreamPermissions(User, createModel.FundingStreamId);
            if (!permissions.CanCreateTemplates)
            {
                _logger.Error(
                    $"User [{User?.Identity?.Name}] has insufficient permissions to create a {createModel.FundingStreamId} template");
                return Forbid(new AuthenticationProperties());
            }

            ValidatedApiResponse<string> result = await _templateBuilderApiClient.CreateTemplateAsClone(createModel);

            switch (result.StatusCode)
            {
                case HttpStatusCode.Created:
                    return Created($"api/templates/build/{result.Content}", result.Content);
                case HttpStatusCode.BadRequest:
                    return BadRequest(result.ModelState);
                default:
                    return StatusCode((int)result.StatusCode);
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

            ValidatedApiResponse<int> result = await _templateBuilderApiClient.UpdateTemplateContent(
                new TemplateContentUpdateCommand
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
                    return StatusCode((int)result.StatusCode,
                        "There was an error processing your request. Please try again.");
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

            ValidatedApiResponse<int> result = await _templateBuilderApiClient.RestoreContent(
                new TemplateContentUpdateCommand
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

            ValidatedApiResponse<string> result = await _templateBuilderApiClient.UpdateTemplateDescription(
                new TemplateDescriptionUpdateCommand
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
                    return StatusCode((int)result.StatusCode,
                        result.Content.IsNullOrEmpty()
                            ? "There was an error processing your request. Please try again."
                            : result.Content);
            }
        }

        [HttpPost("api/templates/build/{templateId}/publish")]
        public async Task<IActionResult> PublishTemplate([FromRoute] string templateId,
            [FromBody] TemplatePublishModel model)
        {
            Guard.ArgumentNotNull(model, nameof(model));

            NoValidatedContentApiResponse result = await _templateBuilderApiClient.PublishTemplate(model);

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.ModelState);
            }

            return StatusCode((int)result.StatusCode);
        }

        [HttpGet]
        [Route("api/templates/build/{templateId}/export")]
        public async Task<IActionResult> Export([FromRoute] string templateId, [FromQuery] string version)
        {
            Guard.IsNullOrWhiteSpace(templateId, nameof(templateId));

            ApiResponse<TemplateResource> result;

            if (!string.IsNullOrWhiteSpace(version))
            {
                result = await _templateBuilderApiClient.GetTemplateVersion(templateId, version);
            }
            else
            {
                result = await _templateBuilderApiClient.GetTemplate(templateId);
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

            return StatusCode((int)result.StatusCode);
        }

        [HttpPost]
        [Route("api/templates/build/search")]
        public async Task<IActionResult> SearchTemplates([FromBody] SearchModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            ValidatedApiResponse<SearchResults<TemplateIndex>> result =
                await _templateBuilderApiClient.SearchTemplates(request);


            if (result.StatusCode == HttpStatusCode.OK)
            {
                SearchTemplatesResultsViewModel
                    viewModel = _mapper.Map<SearchTemplatesResultsViewModel>(result.Content);

                viewModel.PagerState = RenderPagerState(request.PageNumber, request.Top, result.Content.TotalCount);
                
                int startNumber = ((request.Top * request.PageNumber) - request.Top) + 1;
                int endNumber = (request.Top * request.PageNumber);
                if (endNumber > result.Content.TotalCount)
                {
                    endNumber = result.Content.TotalCount;
                }

                viewModel.StartItemNumber = startNumber;
                viewModel.EndItemNumber = endNumber;

                return Ok(viewModel);
            }

            if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                return BadRequest(result.ModelState);
            }

            return StatusCode((int)result.StatusCode);
        }

        private PagerState RenderPagerState(int pageNumber, int pageSize, int totalResults)
        {
            return new PagerState(pageNumber, (int)Math.Ceiling((double)totalResults / pageSize), 3);
        }

        public class SearchTemplatesResultsViewModel
        {
            public int TotalCount { get; set; }

            public int TotalErrorCount { get; set; }

            public IEnumerable<SearchFacet> Facets { get; set; }

            public IEnumerable<TemplateIndex> Results { get; set; }

            public PagerState PagerState { get; set; }
            
            public int StartItemNumber { get; set; }
            
            public int EndItemNumber { get; set; }
        }
    }
}