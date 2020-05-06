using System;
using System.Collections.Generic;
using System.Net;
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
using PublishStatus = CalculateFunding.Common.Models.Versioning.PublishStatus;

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
                .CreateDraftTemplate(Arg.Any<TemplateCreateCommand>())
                .Returns(new ApiResponse<string>(System.Net.HttpStatusCode.Created, templateId));
            var authHelper = Substitute.For<IAuthorizationHelper>();
            authHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), Arg.Is(model.FundingStreamId))
                .Returns(new FundingStreamPermission { CanCreateTemplates = true, FundingStreamId = model.FundingStreamId });
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
                .CreateDraftTemplate(Arg.Any<TemplateCreateCommand>())
                .Returns(new ApiResponse<string>(HttpStatusCode.Created, templateId));
            var authHelper = Substitute.For<IAuthorizationHelper>();
            authHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), Arg.Is(model.FundingStreamId))
                .Returns(new FundingStreamPermission { CanCreateTemplates = false, FundingStreamId = model.FundingStreamId });
            TemplateBuildController controller = new TemplateBuildController(apiClient, authHelper, Substitute.For<ILogger>());

            IActionResult result = await controller.CreateDraftTemplate(model);

            result
                .Should()
                .BeAssignableTo<ForbidResult>();

            apiClient.Received(0);
        }

        [TestMethod]
        public async Task GetTemplateVersions_ReturnsCorrectResult_AllStatuses()
        {
            ITemplateBuilderApiClient apiClient = Substitute.For<ITemplateBuilderApiClient>();
            string templateId = Guid.NewGuid().ToString();
            List<TemplateStatus> statuses = new List<TemplateStatus>();
            List<TemplateResource> returnedContent = new List<TemplateResource>
            {
                new TemplateResource {
                    TemplateId = "123",
                    FundingPeriodId = "ABC",
                    FundingStreamId = "XYZ",
                    Description = "Test",
                    LastModificationDate = DateTime.Now,
                    SchemaVersion = "1.1",
	                PublishStatus = PublishStatus.Approved,
                    AuthorId = "author",
                    AuthorName = "name",
                    Comments = "A comment",
                    Status = TemplateStatus.Approved,
                    Version = 1,
                    MinorVersion = 1,
                    MajorVersion = 0
                }
            };
            apiClient
                .GetTemplateVersions(templateId, statuses)
                .Returns(new ApiResponse<List<TemplateResource>>(HttpStatusCode.OK, returnedContent));

            var authHelper = Substitute.For<IAuthorizationHelper>();
            TemplateBuildController controller = new TemplateBuildController(apiClient, authHelper, Substitute.For<ILogger>());

            IActionResult result = await controller.GetTemplateVersions(templateId, statuses);

            result
                .Should()
                .BeAssignableTo<OkObjectResult>();

            List<TemplateResource> results = (result as OkObjectResult).Value as List<TemplateResource>;
            results
                .Should()
                .Equal(returnedContent);

        }

        [TestMethod]
        public async Task GetTemplateVersions_ReturnsCorrectResult_StatusFilter()
        {
            ITemplateBuilderApiClient apiClient = Substitute.For<ITemplateBuilderApiClient>();
            string templateId = Guid.NewGuid().ToString();
            List<TemplateStatus> statuses = new List<TemplateStatus> { TemplateStatus.Draft, TemplateStatus.Updated };
            List<TemplateResource> returnedContent = new List<TemplateResource>
            {
               new TemplateResource {
	               TemplateId = "123",
	               FundingPeriodId = "ABC",
	               FundingStreamId = "XYZ",
	               Description = "Test",
	               LastModificationDate = DateTime.Now,
	               SchemaVersion = "1.1",
	               PublishStatus = PublishStatus.Draft,
	               AuthorId = "author",
	               AuthorName = "name",
	               Comments = "A comment",
	               Status = TemplateStatus.Draft,
	               Version = 1,
                   MinorVersion = 1,
                   MajorVersion = 0
                },
               new TemplateResource {
	               TemplateId = "123",
	               FundingPeriodId = "ABC",
	               FundingStreamId = "XYZ",
	               Description = "Test",
	               LastModificationDate = DateTime.Now,
	               SchemaVersion = "1.1",
	               PublishStatus = PublishStatus.Draft,
	               AuthorId = "author",
	               AuthorName = "name",
	               Comments = "A comment",
	               Status = TemplateStatus.Updated,
	               Version = 1,
                   MinorVersion = 1,
                   MajorVersion = 0
               }
            };
            apiClient
                .GetTemplateVersions(templateId, statuses)
                .Returns(new ApiResponse<List<TemplateResource>>(HttpStatusCode.OK, returnedContent));
            var authHelper = Substitute.For<IAuthorizationHelper>();
            TemplateBuildController controller = new TemplateBuildController(apiClient, authHelper, Substitute.For<ILogger>());

            IActionResult result = await controller.GetTemplateVersions(templateId, statuses);

            result
                .Should()
                .BeAssignableTo<OkObjectResult>();

            List<TemplateResource> results = (result as OkObjectResult).Value as List<TemplateResource>;
            results
                .Should()
                .Equal(returnedContent);

        }
    }
}