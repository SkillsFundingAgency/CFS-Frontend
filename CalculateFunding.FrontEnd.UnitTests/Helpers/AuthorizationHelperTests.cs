using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;
using System.Security;

namespace CalculateFunding.Frontend.UnitTests.Helpers
{
    [TestClass]
    public class AuthorizationHelperTests
    {
        private static readonly Guid AdminGroupId = Guid.NewGuid();

        [TestMethod]
        public async Task GetUserFundingStreamPermissions_WhenUserHasAccess_ThenReturnTrue()
        {
            // Arrange
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new List<FundingStreamPermission>
                {
                    new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = true},
                    new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = true},
                    new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = true}
                });
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission result = await authHelper.GetUserFundingStreamPermissions(user, "fs2");

            // Assert
            result.CanCreateSpecification.Should().BeTrue();
        }

        private static AuthorizationHelper CreateAuthenticationHelper(IAuthorizationService authorizationService, IUsersApiClient usersClient)
        {
            ILogger logger = Substitute.For<ILogger>();

            IOptions<PermissionOptions> permissionOptions = Substitute.For<IOptions<PermissionOptions>>();
            permissionOptions
                .Value
                .Returns(new PermissionOptions {AdminGroupId = AdminGroupId});

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> streamsResponse = 
                new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, new List<PolicyModels.FundingStream>
                {
                    new PolicyModels.FundingStream { Id = "fs1", Name = "Funding Stream 1"},
                    new PolicyModels.FundingStream { Id = "fs2", Name = "Funding Stream 2"},
                    new PolicyModels.FundingStream { Id = "fs3", Name = "Funding Stream 3"},
                });
            IPoliciesApiClient policyClient = Substitute.For<IPoliciesApiClient>();
            policyClient.GetFundingStreams().Returns(streamsResponse);
            
            return new AuthorizationHelper(authorizationService, usersClient, policyClient, CreateMapper(), logger, permissionOptions);
        }

        private static IMapper CreateMapper()
        {
            MapperConfiguration mapperConfig = new MapperConfiguration(c =>
            {
                c.AddProfile<FrontEndMappingProfile>();
            });

            return mapperConfig.CreateMapper();
        }

        [TestMethod]
        public async Task GetUserFundingStreamPermissions_WhenUserHasNoAccess_ThenReturnFalse()
        {
            // Arrange
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new List<FundingStreamPermission>
                {
                    new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = true},
                    new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = true},
                    new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = false}
                });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission result = await authHelper.GetUserFundingStreamPermissions(user, "fs3");

            // Assert
            result.CanCreateSpecification.Should().BeFalse();
        }

        [TestMethod]
        public async Task GetUserFundingStreamPermissions_WhenUserIsAdmin_ThenReturnTrue()
        {
            // Arrange
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId, true);

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new List<FundingStreamPermission>
                {
                    new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = true},
                    new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = false},
                    new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = true}
                });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission result = await authHelper.GetUserFundingStreamPermissions(user, "fs3");

            // Assert
            result.CanCreateSpecification.Should().BeTrue();
        }

        [TestMethod]
        public async Task FundingStreams_SecurityTrimList_WhenUserHasAccessToAll_ThenReturnAll()
        {
            // Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreamIds = new List<PolicyModels.FundingStream>
            {
                new PolicyModels.FundingStream {Id = "fs1"},
                new PolicyModels.FundingStream {Id = "fs2"},
                new PolicyModels.FundingStream {Id = "fs3"}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = true},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = true}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<PolicyModels.FundingStream> results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().HaveCount(3);
        }

        [TestMethod]
        public async Task FundingStreams_SecurityTrimList_WhenUserHasAccessToNone_ThenReturnNone()
        {
            // Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreamIds = new List<PolicyModels.FundingStream>
            {
                new PolicyModels.FundingStream {Id = "fs1"},
                new PolicyModels.FundingStream {Id = "fs2"},
                new PolicyModels.FundingStream {Id = "fs3"}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = false},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = false}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<PolicyModels.FundingStream> results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().BeEmpty();
        }

        [TestMethod]
        public async Task FundingStreams_SecurityTrimList_WhenUserHasAccessToSome_ThenReturnSome()
        {
            // Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreamIds = new List<PolicyModels.FundingStream>
            {
                new PolicyModels.FundingStream {Id = "fs1"},
                new PolicyModels.FundingStream {Id = "fs2"},
                new PolicyModels.FundingStream {Id = "fs3"}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = false},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = true},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = false}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<PolicyModels.FundingStream> results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().HaveCount(1);
            results.Should().Contain(r => r.Id == "fs2");
        }

        [TestMethod]
        public async Task FundingStreams_SecurityTrimList_WhenUserIsAdmin_ThenReturnAll()
        {
            // Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreamIds = new List<PolicyModels.FundingStream>
            {
                new PolicyModels.FundingStream {Id = "fs1"},
                new PolicyModels.FundingStream {Id = "fs2"},
                new PolicyModels.FundingStream {Id = "fs3"}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId, true);
            FundingStreamActionTypes permissionRequired = FundingStreamActionTypes.CanCreateSpecification;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateSpecification = false},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateSpecification = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateSpecification = false}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<PolicyModels.FundingStream> results = await authHelper.SecurityTrimList(user, fundingStreamIds, permissionRequired);

            // Assert
            results.Should().HaveCount(3);
        }

        [TestMethod]
        public async Task Specifications_GetFundingStreamPermissionsForUser_WhenUserDoesHaveAccessToFundingStream_ThenReturnsFundingPermission()
        {
            string executingUserId = "usr1";
            ClaimsPrincipal user = BuildClaimsPrincipal(executingUserId);
            string userId = "usr2";
            string fundingStreamId = "fs1";

            FundingStreamPermission executingUserfundingStreamPermission = new FundingStreamPermission { UserId = executingUserId, FundingStreamId = fundingStreamId, CanAdministerFundingStream = true };
            FundingStreamPermission fundingStreamPermission = new FundingStreamPermission { UserId = userId, FundingStreamId = fundingStreamId, CanApproveAllCalculations = true };

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(executingUserId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { executingUserfundingStreamPermission }));

            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { fundingStreamPermission }));

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission resultPermissions = await authHelper.GetFundingStreamPermissionsForUser(user, userId, fundingStreamId);

            resultPermissions.CanApproveAllCalculations.Should().BeTrue();
        }

        [TestMethod]
        public async Task Specifications_GetFundingStreamPermissionsForUser_WhenUserDoesNotHaveAccessToAnyFundingStreams_ThenReturnsFundingPermission()
        {
            string executingUserId = "usr1";
            ClaimsPrincipal user = BuildClaimsPrincipal(executingUserId);
            string userId = "usr2";
            string fundingStreamId = "fs1";

            FundingStreamPermission executingUserfundingStreamPermission = new FundingStreamPermission { UserId = executingUserId, FundingStreamId = fundingStreamId, CanAdministerFundingStream = true };
            
            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(executingUserId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { executingUserfundingStreamPermission }));

            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, null, null));

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission resultPermissions = await authHelper.GetFundingStreamPermissionsForUser(user, userId, fundingStreamId);

            resultPermissions.CanApproveAllCalculations.Should().BeFalse();
        }

        [TestMethod]
        public async Task Specifications_GetFundingStreamPermissionsForUser_WhenUserDoesNotHaveAccessToFundingStream_ThenReturnsNoFundingPermission()
        {
            string executingUserId = "usr1";
            ClaimsPrincipal user = BuildClaimsPrincipal(executingUserId);
            string userId = "usr2";
            string fundingStreamId = "fs1";

            FundingStreamPermission executingUserfundingStreamPermission = new FundingStreamPermission { UserId = executingUserId, FundingStreamId = fundingStreamId, CanAdministerFundingStream = true };
            FundingStreamPermission fundingStreamPermission = new FundingStreamPermission { UserId = executingUserId, FundingStreamId = "fs2", CanAdministerFundingStream = true };

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(executingUserId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { executingUserfundingStreamPermission }));

            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { fundingStreamPermission }));

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission resultPermissions = await authHelper.GetFundingStreamPermissionsForUser(user, userId, fundingStreamId);

            resultPermissions.CanApproveAllCalculations.Should().BeFalse();
        }

        [TestMethod]
        public void Specifications_GetFundingStreamPermissionsForUser_WhenUserDoesIsNotAnAfmin_ThenThrowsAnException()
        {
            string executingUserId = "usr1";
            ClaimsPrincipal user = BuildClaimsPrincipal(executingUserId);
            string userId = "usr2";
            string fundingStreamId = "fs1";

            FundingStreamPermission executingUserfundingStreamPermission = new FundingStreamPermission { UserId = executingUserId, FundingStreamId = fundingStreamId, CanAdministerFundingStream = false };
            
            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(executingUserId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { executingUserfundingStreamPermission }));

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            Func<Task<FundingStreamPermission>> invocation = () => authHelper.GetFundingStreamPermissionsForUser(user, userId, fundingStreamId);

            invocation
                .Should()
                .ThrowAsync<SecurityException>()
                .Result
                .Which
                .Message
                .Should()
                .Be($"{user?.Identity?.Name} not allowed to get another user's funding stream permissions for {fundingStreamId}"); ;
        }

        [TestMethod]
        public async Task GetEffectivePermissionsForUser_WhenUserIsAdmin_ThenReturnFullPermissions()
        {
            // Arrange
            string specificationId = "spec123";
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId, true);

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            Common.ApiClient.Users.Models.EffectiveSpecificationPermission permissions =
                await authHelper.GetEffectivePermissionsForUser(user, specificationId);

            // Assert
            permissions.CanAdministerFundingStream.Should().BeTrue("CanAdministerFundingStream");
            permissions.CanApproveFunding.Should().BeTrue("CanApproveFunding");
            permissions.CanApproveSpecification.Should().BeTrue("CanApproveSpecification");
            permissions.CanChooseFunding.Should().BeTrue("CanChooseFunding");
            permissions.CanCreateSpecification.Should().BeTrue("CanCreateSpecification");
            permissions.CanEditCalculations.Should().BeTrue("CanEditCalculations");
            permissions.CanEditSpecification.Should().BeTrue("CanEditSpecification");
            permissions.CanMapDatasets.Should().BeTrue("CanMapDatasets");
            permissions.CanReleaseFunding.Should().BeTrue("CanReleaseFunding");
            permissions.CanRefreshFunding.Should().BeTrue("CanRefreshFunding");
        }

        [TestMethod]
        public async Task
            Specifications_SecurityTrimListForChooseFunding_WhenUserHasChooseFundingPermissionForAllFundingStreams_ThenReturnAllSpecifications()
        {
            // Arrange
            IEnumerable<SpecificationSummary> specifications = new List<SpecificationSummary>
            {
                new SpecificationSummary
                    {Id = "spec1", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs1"}}},
                new SpecificationSummary
                    {Id = "spec2", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs2"}}},
                new SpecificationSummary
                    {Id = "spec3", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs3"}}}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanChooseFunding;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanChooseFunding = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanChooseFunding = true},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanChooseFunding = true}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<SpecificationSummary> results = await authHelper.SecurityTrimList(user, specifications, permissionRequired);

            // Assert
            results.Should().HaveCount(3);
        }

        [TestMethod]
        public async Task Specifications_SecurityTrimListForChooseFunding_WhenUserHasAccessToNone_ThenReturnZeroSpecifications()
        {
            // Arrange
            IEnumerable<SpecificationSummary> specifications = new List<SpecificationSummary>
            {
                new SpecificationSummary
                    {Id = "spec1", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs1"}}},
                new SpecificationSummary
                    {Id = "spec2", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs2"}}},
                new SpecificationSummary
                    {Id = "spec3", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs3"}}}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanChooseFunding;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanChooseFunding = false},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanChooseFunding = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanChooseFunding = false}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<SpecificationSummary> results = await authHelper.SecurityTrimList(user, specifications, permissionRequired);

            // Assert
            results.Should().BeEmpty();
        }

        [TestMethod]
        public async Task Specifications_SecurityTrimListForChooseFunding_WhenUserHasAccessToSome_ThenReturnCorrectSpecifications()
        {
            // Arrange
            const string spec1Id = "spec1";
            const string spec3Id = "spec3";

            IEnumerable<SpecificationSummary> specifications = new List<SpecificationSummary>
            {
                new SpecificationSummary
                    {Id = spec1Id, FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs1"}}},
                new SpecificationSummary
                    {Id = "spec2", FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs2"}}},
                new SpecificationSummary
                    {Id = spec3Id, FundingStreams = new List<PolicyModels.FundingStream> {new PolicyModels.FundingStream {Id = "fs3"}}}
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanChooseFunding;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanChooseFunding = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanChooseFunding = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanChooseFunding = true}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<SpecificationSummary> results = await authHelper.SecurityTrimList(user, specifications, permissionRequired);

            // Assert
            results.Should().HaveCount(2);

            results
                .Any(s => s.Id == spec1Id)
                .Should()
                .BeTrue();

            results
                .Any(s => s.Id == spec1Id)
                .Should()
                .BeTrue();
        }

        [TestMethod]
        public async Task
            Specifications_SecurityTrimListChooseFunding_WhenUserDoesHaveAccessToAllFundingStreamsInASpecification_ThenReturnsSpecification()
        {
            // Arrange
            IEnumerable<SpecificationSummary> specifications = new List<SpecificationSummary>
            {
                new SpecificationSummary
                {
                    Id = "spec1",
                    FundingStreams = new List<PolicyModels.FundingStream>
                        {new PolicyModels.FundingStream {Id = "fs1"}, new PolicyModels.FundingStream {Id = "fs2"}}
                }
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanChooseFunding;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanChooseFunding = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanChooseFunding = true}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<SpecificationSummary> results = await authHelper.SecurityTrimList(user, specifications, permissionRequired);

            // Assert
            results.Should().HaveCount(1);
        }

        [TestMethod]
        public async Task
            Specifications_SecurityTrimListChooseFunding_WhenUserDoesNotHaveAccessToAllFundingStreamsWithinSpecification_ThenReturnEmpty()
        {
            // Arrange
            IEnumerable<SpecificationSummary> specifications = new List<SpecificationSummary>
            {
                new SpecificationSummary
                {
                    Id = "spec1",
                    FundingStreams = new List<PolicyModels.FundingStream>
                        {new PolicyModels.FundingStream {Id = "fs1"}, new PolicyModels.FundingStream {Id = "fs2"}}
                }
            };
            string userId = "testuser";
            ClaimsPrincipal user = BuildClaimsPrincipal(userId);
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanChooseFunding;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanChooseFunding = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanChooseFunding = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanChooseFunding = true}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(userId)
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<SpecificationSummary> results = await authHelper.SecurityTrimList(user, specifications, permissionRequired);

            // Assert
            results.Should().BeEmpty();
        }

        [TestMethod]
        public async Task UpdateFundingStreamPermission_WhenUsersApiUpdateUserPermissions_ReturnsSuccess()
        {
            // Arrange
            string executingUserId = "usr1";
            ClaimsPrincipal user = BuildClaimsPrincipal(executingUserId);
            string userId = "usr2";
            string fundingStreamId = "fs1";

            FundingStreamPermission executingUserfundingStreamPermission = new FundingStreamPermission { UserId = executingUserId, FundingStreamId = fundingStreamId, CanAdministerFundingStream = true };
            FundingStreamPermission fundingStreamPermission = new FundingStreamPermission { UserId = userId, FundingStreamId = fundingStreamId, CanApproveAllCalculations = true };

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(executingUserId)
                .Returns(new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK, new[] { executingUserfundingStreamPermission }));

            usersClient
                .UpdateFundingStreamPermission(userId, fundingStreamId, Arg.Is<FundingStreamPermissionUpdateModel>(m => m.CanApproveAllCalculations == true))
                .Returns(new ValidatedApiResponse<FundingStreamPermission>(HttpStatusCode.OK, fundingStreamPermission));

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            FundingStreamPermission resultPermissions = await authHelper.UpdateFundingStreamPermission(user, userId, fundingStreamId, fundingStreamPermission);

            // Assert
            resultPermissions.Should().NotBeNull();

            await usersClient
                .Received(1)
                .GetFundingStreamPermissionsForUser(executingUserId);

            await usersClient
                .Received(1)
                .UpdateFundingStreamPermission(userId, fundingStreamId, Arg.Is<FundingStreamPermissionUpdateModel>(m => m.CanApproveAllCalculations == true));
        }

        [TestMethod]
        public async Task GetAdminUsersForFundingStream_WhenUsersApiUpdateUserPermissions_ReturnsSuccess()
        {
            // Arrange
            string fundingStreamId = "fs1";

            string executingUserId = "usr1";
            ClaimsPrincipal user = BuildClaimsPrincipal(executingUserId);

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();

            IEnumerable<User> expectedAdminUsers = new List<User>
            {
                new User()
            };

            usersClient
                .GetAdminUsersForFundingStream(fundingStreamId)
                .Returns(new ApiResponse<IEnumerable<User>>(HttpStatusCode.OK, expectedAdminUsers));

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<User> adminUsers = await authHelper.GetAdminUsersForFundingStream(user, fundingStreamId);

            // Assert
            adminUsers.Should().NotBeNull();

            await usersClient
                .Received(1)
                .GetAdminUsersForFundingStream(fundingStreamId);
        }

        private static ClaimsPrincipal BuildClaimsPrincipal(string userId, bool addAdminGroupClaim = false)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(Common.Identity.Constants.ObjectIdentifierClaimType, userId)
            };

            if (addAdminGroupClaim)
            {
                claims.Add(new Claim(Common.Identity.Constants.GroupsClaimType, AdminGroupId.ToString()));
            }

            ClaimsPrincipal user = new ClaimsPrincipal(new ClaimsIdentity(claims));
            return user;
        }
    }
}