using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class TemplateBuilderControllerTests
    {
        [TestMethod]
        public async Task CreateDraftTemplate_ReturnsCorrectResult()
        {
            ITemplateBuilderApiClient apiClient = Substitute.For<ITemplateBuilderApiClient>();
            TemplateCreateModel model = new TemplateCreateModel
            {
                Name = "Test Name",
                Description = "Test Description",
                FundingStreamId = "TEST",
                SchemaVersion = "1.1"
            };
            string templateId = Guid.NewGuid().ToString();
            apiClient
                .CreateDraftTemplate( Arg.Any<TemplateCreateCommand>())
                .Returns(new ApiResponse<string>(System.Net.HttpStatusCode.Created, templateId));
            var authHelper = Substitute.For<IAuthorizationHelper>();
            authHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), Arg.Is(model.FundingStreamId))
                .Returns(new FundingStreamPermission {CanCreateTemplates = true, FundingStreamId = model.FundingStreamId});
            TemplateBuildController controller = new TemplateBuildController(apiClient, authHelper, Substitute.For<ILogger>());
            
            IActionResult result = await controller.CreateDraftTemplate(model);

            result
                .Should()
                .BeAssignableTo<CreatedResult>();
            
            string resultId = (result as CreatedResult).Value as string;
            resultId
                .Should()
                .Be(templateId);
            
            string resultLocation = (result as CreatedResult).Location;
            resultLocation
                .Should()
                .Be($"api/templates/build/{templateId}");
        }
        [TestMethod]
        public async Task CreateDraftTemplate_FailsIfUserWithoutPermissionsToCreateTemplates()
        {
            ITemplateBuilderApiClient apiClient = Substitute.For<ITemplateBuilderApiClient>();
            TemplateCreateModel model = new TemplateCreateModel
            {
                Name = "Test Name",
                Description = "Test Description",
                FundingStreamId = "TEST",
                SchemaVersion = "1.1"
            };
            string templateId = Guid.NewGuid().ToString();
            apiClient
                .CreateDraftTemplate( Arg.Any<TemplateCreateCommand>())
                .Returns(new ApiResponse<string>(System.Net.HttpStatusCode.Created, templateId));
            var authHelper = Substitute.For<IAuthorizationHelper>();
            authHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), Arg.Is(model.FundingStreamId))
                .Returns(new FundingStreamPermission {CanCreateTemplates = false, FundingStreamId = model.FundingStreamId});
            TemplateBuildController controller = new TemplateBuildController(apiClient, authHelper, Substitute.For<ILogger>());
            
            IActionResult result = await controller.CreateDraftTemplate(model);

            result
                .Should()
                .BeAssignableTo<ForbidResult>();

            apiClient.Received(0);
        }
    }
}