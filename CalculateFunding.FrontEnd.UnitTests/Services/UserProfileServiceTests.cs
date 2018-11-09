using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Principal;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class UserProfileServiceTests
    {
        [TestMethod]
        public void GetUser_WhenUserIsNull_ReturnsBlankUserProfile()
        {
            //Arrange
            HttpContext httpContext = Substitute.For<HttpContext>();

            IHttpContextAccessor httpContextAccessor = Substitute.For<IHttpContextAccessor>();

            httpContextAccessor
                .HttpContext
                .Returns(httpContext);

            UserProfileService userProfileService = new UserProfileService(httpContextAccessor);

            //Act
            UserProfile userProfile = userProfileService.GetUser();

            //Arrange
            userProfile
                .Id
                .Should()
                .BeEmpty();

            userProfile
               .UPN
               .Should()
               .BeEmpty();

            userProfile
               .Firstname
               .Should()
               .BeEmpty();

            userProfile
               .Lastname
               .Should()
               .BeEmpty();

            userProfile
               .Fullname
               .Should()
               .BeEmpty();
        }

        [TestMethod]
        public void GetUser_WhenUserIsNotNull_ReturnsUserProfile()
        {
            //Arrange

            IIdentity identity = Substitute.For<IIdentity>();
            identity
                .Name
                .Returns("Joe.bloggs@justatest.naf");

            IEnumerable<Claim> claims = new[]
            {
                new Claim(ClaimTypes.GivenName, "Joe"),
                new Claim(ClaimTypes.Surname, "Bloggs"),
                new Claim("http://schemas.microsoft.com/identity/claims/objectidentifier", "any-id")
            };

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(identity, claims);

            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
          
            HttpContext httpContext = Substitute.For<HttpContext>();
            httpContext
                .User
                .Returns(claimsPrincipal);
                
            IHttpContextAccessor httpContextAccessor = Substitute.For<IHttpContextAccessor>();

            httpContextAccessor
                .HttpContext
                .Returns(httpContext);

            UserProfileService userProfileService = new UserProfileService(httpContextAccessor);

            //Act
            UserProfile userProfile = userProfileService.GetUser();

            //Arrange
            userProfile
                .Id
                .Should()
                .Be("any-id");

            userProfile
               .UPN
               .Should()
               .Be("Joe.bloggs@justatest.naf");

            userProfile
               .Firstname
               .Should()
               .Be("Joe");

            userProfile
               .Lastname
               .Should()
               .Be("Bloggs");

            userProfile
               .Fullname
               .Should()
               .Be("Joe Bloggs");
        }
    }
}
