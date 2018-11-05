using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Helpers
{
    [TestClass]
    public class AuthorizationHelperTests
    {
        [TestMethod]
        public async Task DoesUserHavePermission_WhenUserHasAccessToAll_ThenReturnTrue()
        {
            // Arrange
            IEnumerable<string> fundingStreamIds = new List<string> { "fs1", "fs2", "fs3" };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> permissionsResponse = new ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>>(System.Net.HttpStatusCode.OK, new List<Clients.UsersClient.Models.FundingStreamPermission>
            {
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs1", CanCreateSpecification = true },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs2", CanCreateSpecification = true },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs3", CanCreateSpecification = true }
            });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = new AuthorizationHelper(authorizationService, usersClient);

            // Act
            bool result = await authHelper.DoesUserHavePermission(user, fundingStreamIds, permissionRequired);

            // Assert
            result.Should().BeTrue();
        }

        [TestMethod]
        public async Task DoesUserHavePermission_WhenUserHasAccessToNone_ThenReturnFalse()
        {
            // Arrange
            IEnumerable<string> fundingStreamIds = new List<string> { "fs1", "fs2", "fs3" };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> permissionsResponse = new ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>>(System.Net.HttpStatusCode.OK, new List<Clients.UsersClient.Models.FundingStreamPermission>
            {
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs1", CanCreateSpecification = false },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs2", CanCreateSpecification = false },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs3", CanCreateSpecification = false }
            });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = new AuthorizationHelper(authorizationService, usersClient);

            // Act
            bool result = await authHelper.DoesUserHavePermission(user, fundingStreamIds, permissionRequired);

            // Assert
            result.Should().BeFalse();
        }

        [TestMethod]
        public async Task DoesUserHavePermission_WhenUserHasAccessToSome_ThenReturnFalse()
        {
            // Arrange
            IEnumerable<string> fundingStreamIds = new List<string> { "fs1", "fs2", "fs3" };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> permissionsResponse = new ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>>(System.Net.HttpStatusCode.OK, new List<Clients.UsersClient.Models.FundingStreamPermission>
            {
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs1", CanCreateSpecification = true },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs2", CanCreateSpecification = false },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs3", CanCreateSpecification = true }
            });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = new AuthorizationHelper(authorizationService, usersClient);

            // Act
            bool result = await authHelper.DoesUserHavePermission(user, fundingStreamIds, permissionRequired);

            // Assert
            result.Should().BeFalse();
        }

        [TestMethod]
        public async Task SecurityTrimList_WhenUserHasAccessToAll_ThenReturnAll()
        {
            // Arrange
            IEnumerable<FundingStream> fundingStreamIds = new List<FundingStream>
            {
                new FundingStream { Id = "fs1" },
                new FundingStream { Id = "fs2" },
                new FundingStream { Id = "fs3" }
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> permissionsResponse = new ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>>(System.Net.HttpStatusCode.OK, new List<Clients.UsersClient.Models.FundingStreamPermission>
            {
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs1", CanCreateSpecification = true },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs2", CanCreateSpecification = true },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs3", CanCreateSpecification = true }
            });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = new AuthorizationHelper(authorizationService, usersClient);

            // Act
            var results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().HaveCount(3);
        }

        [TestMethod]
        public async Task SecurityTrimList_WhenUserHasAccessToNone_ThenReturnNone()
        {
            // Arrange
            IEnumerable<FundingStream> fundingStreamIds = new List<FundingStream>
            {
                new FundingStream { Id = "fs1" },
                new FundingStream { Id = "fs2" },
                new FundingStream { Id = "fs3" }
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> permissionsResponse = new ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>>(System.Net.HttpStatusCode.OK, new List<Clients.UsersClient.Models.FundingStreamPermission>
            {
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs1", CanCreateSpecification = false },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs2", CanCreateSpecification = false },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs3", CanCreateSpecification = false }
            });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = new AuthorizationHelper(authorizationService, usersClient);

            // Act
            var results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().BeEmpty();
        }

        [TestMethod]
        public async Task SecurityTrimList_WhenUserHasAccessToSome_ThenReturnSome()
        {
            // Arrange
            IEnumerable<FundingStream> fundingStreamIds = new List<FundingStream>
            {
                new FundingStream { Id = "fs1" },
                new FundingStream { Id = "fs2" },
                new FundingStream { Id = "fs3" }
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>> permissionsResponse = new ApiResponse<IEnumerable<Clients.UsersClient.Models.FundingStreamPermission>>(System.Net.HttpStatusCode.OK, new List<Clients.UsersClient.Models.FundingStreamPermission>
            {
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs1", CanCreateSpecification = false },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs2", CanCreateSpecification = true },
                new Clients.UsersClient.Models.FundingStreamPermission { FundingStreamId = "fs3", CanCreateSpecification = false }
            });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = new AuthorizationHelper(authorizationService, usersClient);

            // Act
            var results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().HaveCount(1);
            results.Should().Contain(r => r.Id == "fs2");
        }

        private static ClaimsPrincipal BuildClaimsPrincipal(string userId)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(Common.Identity.Authorization.Constants.ObjectIdentifierClaimType, userId)
            };
            ClaimsPrincipal user = new ClaimsPrincipal(new ClaimsIdentity(claims));
            return user;
        }
    }
}
