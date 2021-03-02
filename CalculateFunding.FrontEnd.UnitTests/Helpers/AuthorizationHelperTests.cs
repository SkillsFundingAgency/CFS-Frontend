using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Interfaces;
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
        public async Task Specifications_SecurityTrimList_WhenUserHasAccessToAll_ThenReturnAll()
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
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanCreateQaTests;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateQaTests = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateQaTests = true},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateQaTests = true}
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
        public async Task Specifications_SecurityTrimList_WhenUserHasAccessToNone_ThenReturnNone()
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
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanCreateQaTests;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateQaTests = false},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateQaTests = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateQaTests = false}
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
        public async Task Specifications_SecurityTrimList_WhenUserHasAccessToSome_ThenReturnSome()
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
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanCreateQaTests;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateQaTests = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateQaTests = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateQaTests = true}
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
        }

        [TestMethod]
        public async Task Specifications_SecurityTrimList_WhenUserDoesHaveAccessToAllFundingStreams_ThenReturnsSpecification()
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
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanCreateQaTests;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateQaTests = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateQaTests = true},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateQaTests = true}
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
        public async Task Specifications_SecurityTrimList_WhenUserDoesNotHaveAccessToAllFundingStreams_ThenReturnEmpty()
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
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanCreateQaTests;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateQaTests = true},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateQaTests = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateQaTests = true}
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
        public async Task Specifications_SecurityTrimList_WhenUserIsAdmin_ThenReturnAll()
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
            ClaimsPrincipal user = BuildClaimsPrincipal(userId, true);
            SpecificationActionTypes permissionRequired = SpecificationActionTypes.CanCreateQaTests;

            ApiResponse<IEnumerable<FundingStreamPermission>> permissionsResponse =
                new ApiResponse<IEnumerable<FundingStreamPermission>>(HttpStatusCode.OK,
                    new List<FundingStreamPermission>
                    {
                        new FundingStreamPermission {FundingStreamId = "fs1", CanCreateQaTests = false},
                        new FundingStreamPermission {FundingStreamId = "fs2", CanCreateQaTests = false},
                        new FundingStreamPermission {FundingStreamId = "fs3", CanCreateQaTests = false}
                    });

            IAuthorizationService authorizationService = Substitute.For<IAuthorizationService>();
            IUsersApiClient usersClient = Substitute.For<IUsersApiClient>();
            usersClient
                .GetFundingStreamPermissionsForUser(Arg.Is(userId))
                .Returns(permissionsResponse);

            AuthorizationHelper authHelper = CreateAuthenticationHelper(authorizationService, usersClient);

            // Act
            IEnumerable<SpecificationSummary> results = await authHelper.SecurityTrimList(user, specifications, permissionRequired);

            // Assert
            results.Should().HaveCount(3);
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
            permissions.CanCreateQaTests.Should().BeTrue("CanCreateQaTests");
            permissions.CanCreateSpecification.Should().BeTrue("CanCreateSpecification");
            permissions.CanEditCalculations.Should().BeTrue("CanEditCalculations");
            permissions.CanEditQaTests.Should().BeTrue("CanEditQaTests");
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