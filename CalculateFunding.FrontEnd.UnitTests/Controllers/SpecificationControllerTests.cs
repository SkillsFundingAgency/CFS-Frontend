using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.ApiClient.Users.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.TemplateMetadata.Enums;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Specs;
using CalculateFunding.Frontend.ViewModels.Users;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class SpecificationControllerTests
    {
        private ISpecificationsApiClient _specificationsApiClient;
        private IPoliciesApiClient _policiesApiClient;
        private IAuthorizationHelper _authorizationHelper;
        private SpecificationController _specificationController;

        [TestInitialize]
        public void Initialize()
        {
            _authorizationHelper = Substitute.For<IAuthorizationHelper>();
            _specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
            _policiesApiClient = Substitute.For<IPoliciesApiClient>();

            _specificationController = new SpecificationController(_specificationsApiClient, _policiesApiClient, _authorizationHelper);
        }

        [TestMethod]
        public void GetSpecificationsForFundingByPeriod_GuardsAgainstMissingFundingPeriod()
        {
            Func<Task<IActionResult>> invocation = ()
                => _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(null, NewRandomString());

            invocation
                .Should()
                .Throw<ArgumentNullException>()
                .Which
                .ParamName
                .Should()
                .Be("fundingPeriodId");
        }

        [TestMethod]
        public void GetSpecificationsForFundingByPeriod_GuardsAgainstMissingFundingStream()
        {
            Func<Task<IActionResult>> invocation = ()
                => _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(NewRandomString(), null);

            invocation
                .Should()
                .Throw<ArgumentNullException>()
                .Which
                .ParamName
                .Should()
                .Be("fundingStreamId");
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnBadRequestStatusFromSpecApiClient_ThenReturnsBadRequestResponse()
        {
            // Arrange
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            _specificationsApiClient
                .GetSelectedSpecificationsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.ServiceUnavailable)));

            // Act
            IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().BeOfType<StatusCodeResult>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnNotExpectingStatusFromSpecApiClient_ThenReturnsInternalServerErrorResponse()
        {
            // Arrange
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            _specificationsApiClient
                .GetSelectedSpecificationsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.BadRequest)));

            // Act
            IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetSpecificationsForFundingByPeriod_OnSuccessfulGetRequest_ThenResponseSentToClient()
        {
            // Arrange
            const string fundingPeriodId = "fundingPeriodId";
            const string fundingStreamId = "fundingStreamId";

            SpecificationSummary notSelectedForFunding = new SpecificationSummary
            {
                IsSelectedForFunding = false
            };

            SpecificationSummary selectedForFundingOnSecondOrder = new SpecificationSummary
            {
                IsSelectedForFunding = true,
                Name = "ZZZ"
            };

            SpecificationSummary selectedForFundingOnFirstOrder = new SpecificationSummary
            {
                IsSelectedForFunding = true,
                Name = "AAA"
            };

            List<SpecificationSummary> specificationSummaries = new List<SpecificationSummary>
            {
                notSelectedForFunding,
                selectedForFundingOnSecondOrder,
                selectedForFundingOnFirstOrder
            };

            _specificationsApiClient
                .GetSelectedSpecificationsByFundingPeriodIdAndFundingStreamId(fundingPeriodId, fundingStreamId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<SpecificationSummary>>(HttpStatusCode.OK, specificationSummaries)));

            // Act
            IActionResult result = await _specificationController.GetSpecificationsSelectedForFundingByPeriodAndStream(fundingPeriodId, fundingStreamId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            IEnumerable<SpecificationSummary> specificationSummariesResult = (IEnumerable<SpecificationSummary>)typedResult.Value;

            specificationSummariesResult.First().Name.Should().Be(selectedForFundingOnFirstOrder.Name);
            specificationSummariesResult.Last().Name.Should().Be(selectedForFundingOnSecondOrder.Name);
        }

        [TestMethod]
        public async Task GetDistinctFundingStreamsForSpecifications_Returns_Bad_Request_Given_Api_Returns_Bad_Request_Status()
        {
            _specificationsApiClient
                .GetDistinctFundingStreamsForSpecifications()
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<string>>(HttpStatusCode.BadRequest)));

            IActionResult result = await _specificationController.GetDistinctFundingStreamsForSpecifications();

            result.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetDistinctFundingStreamsForSpecifications_Returns_Internal_Server_Error_Api_Result_Is_Not_Ok_or_Bad_Request()
        {
            _specificationsApiClient
                .GetDistinctFundingStreamsForSpecifications()
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<string>>(HttpStatusCode.ServiceUnavailable)));

            IActionResult result = await _specificationController.GetDistinctFundingStreamsForSpecifications();

            result.Should().BeEquivalentTo(new StatusCodeResult(500));
        }

        [TestMethod]
        public async Task GetDistinctFundingStreamsForSpecifications_Returns_Funding_Streams_Given_A_Successful_Request()
        {
            List<string> expectedFundingStreams = new List<string>
            {
                "PSG",
                "DSG"
            };
            _specificationsApiClient
                .GetDistinctFundingStreamsForSpecifications()
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<string>>(HttpStatusCode.OK, expectedFundingStreams)));

            IActionResult result = await _specificationController.GetDistinctFundingStreamsForSpecifications();

            result.As<OkObjectResult>().Value.As<List<string>>().Count.Should().Be(expectedFundingStreams.Count);
        }

        [TestMethod]
        public async Task GetProfileVariationPointers_Returns_Bad_Request_Given_Api_Returns_Bad_Request_Status()
        {
            string aValidSpecificationId = "ABC";
            _specificationsApiClient
                .GetProfileVariationPointers(aValidSpecificationId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<ProfileVariationPointer>>(HttpStatusCode.BadRequest)));

            IActionResult result = await _specificationController.GetProfileVariationPointers(aValidSpecificationId);

            result.Should().BeOfType<BadRequestResult>();
        }

        [TestMethod]
        public async Task GetProfileVariationPointers_Returns_Internal_Server_Error_Api_Result_Is_Not_Ok_or_Bad_Request()
        {
            string aValidSpecificationId = "ABC";
            _specificationsApiClient
                .GetProfileVariationPointers(aValidSpecificationId)
                .Returns(Task.FromResult(new ApiResponse<IEnumerable<ProfileVariationPointer>>(HttpStatusCode.ServiceUnavailable)));

            IActionResult result = await _specificationController.GetProfileVariationPointers(aValidSpecificationId);

            result.Should().BeEquivalentTo(new StatusCodeResult(500));
        }

        [TestMethod]
        public async Task GetProfileVariationPointers_Returns_Funding_Streams_Given_A_Successful_Request()
        {
            string aValidSpecificationId = "ABC";
            string aValidFundingStreamId = "345";
            string aValidFundingPeriodId = "123";
            string aValidTemplateVersion = "1.0";

            List<ProfileVariationPointer> aValidProfileVariationPointers = CreateTestProfileVariationPointers().ToList();
            List<FundingLineProfileVariationPointer> validFundingLineProfileVariationPointers = aValidProfileVariationPointers
                .Select(s => new FundingLineProfileVariationPointer
                {
                    FundingLineId = s.FundingLineId,
                    ProfileVariationPointer = s
                }).ToList();

            _specificationsApiClient
                .GetProfileVariationPointers(aValidSpecificationId)
                .Returns(Task.FromResult(
                    new ApiResponse<IEnumerable<ProfileVariationPointer>>(HttpStatusCode.OK, aValidProfileVariationPointers)));

            _specificationsApiClient
                .GetSpecificationSummaryById(aValidSpecificationId)
                .Returns(Task.FromResult(
                    new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary
                    {
                        FundingStreams = new List<Reference>
                        {
                            new Reference
                            {
                                Id = aValidFundingStreamId,
                                Name = aValidFundingStreamId
                            }
                        },
                        FundingPeriod = new Reference
                        {
                            Id = aValidFundingPeriodId,
                            Name = aValidFundingPeriodId
                        },
                        TemplateIds = new Dictionary<string, string>
                        {
                            { aValidFundingStreamId, aValidTemplateVersion }
                        }
                    })));

            _policiesApiClient
                .GetDistinctTemplateMetadataFundingLinesContents(aValidFundingStreamId, aValidFundingPeriodId, aValidTemplateVersion)
                .Returns(Task.FromResult(
                    new ApiResponse<TemplateMetadataDistinctFundingLinesContents>(HttpStatusCode.OK,
                        new TemplateMetadataDistinctFundingLinesContents
                        {
                            FundingLines = new List<TemplateMetadataFundingLine>
                            {
                                new TemplateMetadataFundingLine
                                {
                                    FundingLineCode = "Funding line 1",
                                    Type = FundingLineType.Payment
                                },
                                new TemplateMetadataFundingLine
                                {
                                    FundingLineCode = "Funding line 2",
                                    Type = FundingLineType.Payment
                                }
                            }
                        })));

            IActionResult result = await _specificationController.GetProfileVariationPointers(aValidSpecificationId);

            result.As<OkObjectResult>().Value.As<IEnumerable<FundingLineProfileVariationPointer>>().Should()
                .BeEquivalentTo(validFundingLineProfileVariationPointers);
        }

        [TestMethod]
        public async Task GetProfileVariationPointers_Returns_Null_ProfilePointers_Given_No_Current_ProfilePointers()
        {
            string aValidSpecificationId = "ABC";
            string aValidFundingStreamId = "345";
            string aValidFundingPeriodId = "123";
            string aValidTemplateVersion = "1.0";

            List<ProfileVariationPointer> aValidProfileVariationPointers = CreateTestProfileVariationPointers().ToList();
            List<FundingLineProfileVariationPointer> validFundingLineProfileVariationPointers = aValidProfileVariationPointers
                .Select(s => new FundingLineProfileVariationPointer
                {
                    FundingLineId = s.FundingLineId,
                    ProfileVariationPointer = null
                }).ToList();

            _specificationsApiClient
                .GetProfileVariationPointers(aValidSpecificationId)
                .Returns(Task.FromResult(
                    new ApiResponse<IEnumerable<ProfileVariationPointer>>(HttpStatusCode.NoContent)));

            _specificationsApiClient
                .GetSpecificationSummaryById(aValidSpecificationId)
                .Returns(Task.FromResult(
                    new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary
                    {
                        FundingStreams = new List<Reference>
                        {
                            new Reference
                            {
                                Id = aValidFundingStreamId,
                                Name = aValidFundingStreamId
                            }
                        },
                        FundingPeriod = new Reference
                        {
                            Id = aValidFundingPeriodId,
                            Name = aValidFundingPeriodId
                        },
                        TemplateIds = new Dictionary<string, string>
                        {
                            { aValidFundingStreamId, aValidTemplateVersion }
                        }
                    })));

            _policiesApiClient
                .GetDistinctTemplateMetadataFundingLinesContents(aValidFundingStreamId, aValidFundingPeriodId, aValidTemplateVersion)
                .Returns(Task.FromResult(
                    new ApiResponse<TemplateMetadataDistinctFundingLinesContents>(HttpStatusCode.OK,
                        new TemplateMetadataDistinctFundingLinesContents
                        {
                            FundingLines = new List<TemplateMetadataFundingLine>
                            {
                                new TemplateMetadataFundingLine
                                {
                                    FundingLineCode = "Funding line 1",
                                    Type = FundingLineType.Payment
                                },
                                new TemplateMetadataFundingLine
                                {
                                    FundingLineCode = "Funding line 2",
                                    Type = FundingLineType.Payment
                                }
                            }
                        })));

            IActionResult result = await _specificationController.GetProfileVariationPointers(aValidSpecificationId);

            result.As<OkObjectResult>().Value.As<IEnumerable<FundingLineProfileVariationPointer>>().Should()
                .BeEquivalentTo(validFundingLineProfileVariationPointers);
        }

        [TestMethod]
        public async Task SetProfileVariationPointers_Returns_OK_Given_A_Valid_SpecificationId_And_ProfileVariationPointers()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanEditSpecification);
            string aValidSpecificationId = "ABC";
            List<ProfileVariationPointer> aValidProfileVariationPointers = CreateTestProfileVariationPointers().ToList();
            _specificationsApiClient
                .SetProfileVariationPointers(aValidSpecificationId, aValidProfileVariationPointers)
                .Returns(HttpStatusCode.OK);

            IActionResult result = await _specificationController.SetProfileVariationPointers(
                aValidSpecificationId,
                aValidProfileVariationPointers);

            result.Should().BeOfType<OkObjectResult>();
        }

        [TestMethod]
        public async Task SetProfileVariationPointers_Returns_Forbid_Result_Given_User_Does_Not_Have_Edit_Specification_Permission()
        {
            string aValidSpecificationId = "ABC";
            IEnumerable<ProfileVariationPointer> aValidProfileVariationPointers = CreateTestProfileVariationPointers();

            IActionResult result = await _specificationController.SetProfileVariationPointers(
                aValidSpecificationId,
                aValidProfileVariationPointers);

            result.Should().BeAssignableTo<ForbidResult>();
        }

        [TestMethod]
        public async Task SetProfileVariationPointers_Throws_InvalidOperationException_Given_An_Error_Occurred_While_Updating()
        {
            SetupAuthorizedUser(SpecificationActionTypes.CanEditSpecification);
            string aValidSpecificationId = "ABC";
            IEnumerable<ProfileVariationPointer> aValidProfileVariationPointers = CreateTestProfileVariationPointers();

            Func<Task> action = async () => await _specificationController.SetProfileVariationPointers(
                aValidSpecificationId,
                aValidProfileVariationPointers);

            action.Should().Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task CreateSpecification_ReturnsBadRequestObjectResultWhenApiResponseIsBadRequest()
        {
            SetupFundingStreamPermissions(new FundingStreamPermissionModel
            {
                CanCreateSpecification = true
            });

            _specificationsApiClient.CreateSpecification(Arg.Any<CreateSpecificationModel>())
                .Returns(new ValidatedApiResponse<SpecificationSummary>(HttpStatusCode.BadRequest));


            IActionResult actionResult = await _specificationController.CreateSpecification(new CreateSpecificationViewModel());

            actionResult
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task UpdateSpecification_ReturnsBadRequestObjectResultWhenApiResponseIsBadRequest()
        {
            _specificationsApiClient.UpdateSpecification(Arg.Any<string>(), Arg.Any<EditSpecificationModel>())
                .Returns(new ValidatedApiResponse<SpecificationSummary>(HttpStatusCode.BadRequest));


            IActionResult actionResult = await _specificationController.UpdateSpecification(new EditSpecificationModel(), NewRandomString());

            actionResult
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        private void SetupAuthorizedUser(SpecificationActionTypes specificationActionType)
        {
            _authorizationHelper.DoesUserHavePermission(
                    _specificationController.User,
                    Arg.Any<string>(),
                    specificationActionType)
                .Returns(true);
        }

        private void SetupFundingStreamPermissions(params FundingStreamPermissionModel[] fundingStreamPermissions)
        {
            _authorizationHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>())
                .Returns(fundingStreamPermissions);
        }

        private static IEnumerable<ProfileVariationPointer> CreateTestProfileVariationPointers()
        {
            IEnumerable<ProfileVariationPointer> aValidProfileVariationPointers = new List<ProfileVariationPointer>
            {
                new ProfileVariationPointer
                {
                    FundingStreamId = "1",
                    FundingLineId = "Funding line 1",
                    PeriodType = "Test PeriodType",
                    Year = 2020,
                    Occurrence = 3,
                    TypeValue = "ABC"
                },
                new ProfileVariationPointer
                {
                    FundingStreamId = "2",
                    FundingLineId = "Funding line 2",
                    PeriodType = "Test PeriodType",
                    Year = 2021,
                    Occurrence = 4,
                    TypeValue = "ABC"
                }
            };
            return aValidProfileVariationPointers;
        }

        private static string NewRandomString() => Guid.NewGuid().ToString();
    }
}