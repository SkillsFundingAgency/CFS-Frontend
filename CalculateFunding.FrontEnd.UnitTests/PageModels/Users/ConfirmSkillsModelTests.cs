using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Interfaces.APiClient;
using CalculateFunding.Frontend.Pages.Users;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Users
{
    [TestClass]
    public class ConfirmSkillsModelTests
    {
        [TestMethod]
        public async Task OnGetAsync_WhenAccessed_ReturnsPage()
        {
            //Arrange
            ConfirmSkillsModel pageModel = CreatePageModel();

            //Act
            IActionResult result = await pageModel.OnGetAsync();

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCookieAlreadyExists_ReturnsRedirectResult()
        {
            //Arrange
            IIdentity identity = Substitute.For<IIdentity>();
            identity
                .Name
                .Returns("user1@testdata.com");

            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(identity);

            HttpContext httpContext = Substitute.For<HttpContext>();
            httpContext
                .User
                .Returns(claimsPrincipal);

            IRequestCookieCollection cookies = new RequestCookieCollection(new System.Collections.Generic.Dictionary<string, string>
            {
                { UserContstants.SkillsConfirmationCookieName, "true" }
            });

            httpContext.Request.Cookies = cookies;
            
            ConfirmSkillsModel pageModel = CreatePageModel();
            pageModel.PageContext = new PageContext
            {
                HttpContext = httpContext
            };

            //Act
            IActionResult result = await pageModel.OnPostAsync();

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>()
                .Which
                .Url
                .Should()
                .Be("/");
        }

        [TestMethod]
        public void OnPostAsync_GivenCookieDoesNotAlreadyExistsAndCallingConfirmSkillsReturnsBadRequest_ReturnsInternalServerError()
        {
            //Arrange
            IIdentity identity = Substitute.For<IIdentity>();
            identity
                .Name
                .Returns("user1@testdata.com");

            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(identity);

            HttpContext httpContext = Substitute.For<HttpContext>();
            httpContext
                .User
                .Returns(claimsPrincipal);

            IUsersApiClient apiClient = CreateUsersApiClient();
            apiClient
                .ConfirmSkills(Arg.Is("user1@testdata.com"))
                .Returns(HttpStatusCode.BadRequest);

            ConfirmSkillsModel pageModel = CreatePageModel(apiClient);
            pageModel.PageContext = new PageContext
            {
                HttpContext = httpContext
            };

            //Act
            Func<Task> test = () => pageModel.OnPostAsync();

            //Assert
            test
                .Should()
                .ThrowExactly<InvalidOperationException>()
                .Which
                .Message
                .Should()
                .Be("Failed to confirm skills for user1@testdata.com");
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCookieDoesNotAlreadyExistsAndCallingConfirmSkillsReturnsNoContent_SetsCookieReturnsRedirectResult()
        {
            //Arrange
            IIdentity identity = Substitute.For<IIdentity>();
            identity
                .Name
                .Returns("user1@testdata.com");

            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(identity);

            HttpContext httpContext = Substitute.For<HttpContext>();
            httpContext
                .User
                .Returns(claimsPrincipal);

            IUsersApiClient apiClient = CreateUsersApiClient();
            apiClient
                .ConfirmSkills(Arg.Is("user1@testdata.com"))
                .Returns(HttpStatusCode.NoContent);

            ConfirmSkillsModel pageModel = CreatePageModel(apiClient);
            pageModel.PageContext = new PageContext
            {
                HttpContext = httpContext
            };

            //Act
            IActionResult result = await pageModel.OnPostAsync();

            //Assert
            result
               .Should()
               .BeOfType<RedirectResult>()
               .Which
               .Url
               .Should()
               .Be("/");
        }

        static ConfirmSkillsModel CreatePageModel(IUsersApiClient usersApiClient = null)
        {
            return new ConfirmSkillsModel(usersApiClient ?? CreateUsersApiClient());
        }

        static IUsersApiClient CreateUsersApiClient()
        {
            return Substitute.For<IUsersApiClient>();
        }
    }
}
