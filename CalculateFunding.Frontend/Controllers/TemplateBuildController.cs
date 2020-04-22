using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class TemplateBuildController : Controller
    {
        private readonly ITemplateBuilderApiClient _client;

        public TemplateBuildController(ITemplateBuilderApiClient client)
        {
            _client = client;
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