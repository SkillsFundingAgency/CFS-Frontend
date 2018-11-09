using System;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Frontend.Constants;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.Pages.Users;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

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
                { UserConstants.SkillsConfirmationCookieName, "true" }
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
            const string upn = "user1@testdata.com";
            IIdentity identity = Substitute.For<IIdentity>();
            identity
                .Name
                .Returns(upn);

            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(identity);

            HttpContext httpContext = Substitute.For<HttpContext>();
            httpContext
                .User
                .Returns(claimsPrincipal);

            UserProfile userProfile = new UserProfile()
            {
                Firstname = "First",
                Lastname = "Last",
                Id = "123",
                UPN = upn
            };

            IUserProfileService userProfileService = CreateUserProfileService();

            userProfileService
                .GetUser()
                .Returns(userProfile);

            IUsersApiClient apiClient = CreateUsersApiClient();
            apiClient
                .ConfirmSkills(Arg.Is("123"), Arg.Is<UserConfirmModel>(u => u.Username == upn && u.Name == userProfile.Fullname))
                .Returns(new ValidatedApiResponse<User>(HttpStatusCode.BadRequest, (User)null));

            ConfirmSkillsModel pageModel = CreatePageModel(apiClient, userProfileService);
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
            const string upn = "user1@testdata.com";
            IIdentity identity = Substitute.For<IIdentity>();
            identity
                .Name
                .Returns(upn);

            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(identity);

            HttpContext httpContext = Substitute.For<HttpContext>();
            httpContext
                .User
                .Returns(claimsPrincipal);

            UserConfirmModel userConfirmModel = new UserConfirmModel();

            User user = new User();

            UserProfile userProfile = new UserProfile()
            {
                Firstname = "First",
                Lastname = "Last",
                Id = "123",
                UPN = upn
            };

            IUserProfileService userProfileService = CreateUserProfileService();

            userProfileService
                .GetUser()
                .Returns(userProfile);

            IUsersApiClient apiClient = CreateUsersApiClient();
            apiClient
                .ConfirmSkills(Arg.Is("123"), Arg.Is<UserConfirmModel>(u => u.Username == upn && u.Name == userProfile.Fullname))
                .Returns(new ValidatedApiResponse<User>(HttpStatusCode.OK, user));

            ConfirmSkillsModel pageModel = CreatePageModel(apiClient, userProfileService);
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

        static ConfirmSkillsModel CreatePageModel(
            IUsersApiClient usersApiClient = null,
            IUserProfileService userProfileService = null)
        {
            return new ConfirmSkillsModel(
                usersApiClient ?? CreateUsersApiClient(),
                userProfileService ?? CreateUserProfileService());
        }

        static IUsersApiClient CreateUsersApiClient()
        {
            return Substitute.For<IUsersApiClient>();
        }

        static IUserProfileService CreateUserProfileService()
        {
            return Substitute.For<IUserProfileService>();
        }
    }
}
