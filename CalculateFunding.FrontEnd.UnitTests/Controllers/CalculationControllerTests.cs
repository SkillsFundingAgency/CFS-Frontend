// <copyright file="CalculationControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;

namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Security.Claims;
    using System.Security.Principal;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.UnitTests.Helpers;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using FluentAssertions;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class CalculationControllerTests
    {
        private ISpecificationsApiClient specificationsApiClient;
        private IResultsApiClient resultsApiClient = Substitute.For<IResultsApiClient>();

        [TestInitialize]
        public void Initialize()
        {
            specificationsApiClient = Substitute.For<ISpecificationsApiClient>();
        }

        [TestMethod]
        public async Task SaveCalculation_OnSuccessfulSaveRequest_ThenResponseSentToClient()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string specificationId = "1";
            string calculationId = "5";

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Updated source code"
            };

            Calculation existingCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                SourceCode = "Existing source code"
            };

            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, existingCalculation));

            Calculation apiResultCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                SourceCode = updateViewModel.SourceCode
            };

            calcsClient
                .EditCalculation(specificationId, calculationId, Arg.Any<CalculationEditModel>())
                .Returns(new ValidatedApiResponse<Common.ApiClient.Calcs.Models.Calculation>(HttpStatusCode.OK, apiResultCalculation));

            // Act
            IActionResult result = await controller.SaveCalculation(specificationId, calculationId, updateViewModel);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            Calculation resultCalculation = typedResult.Value as Calculation;
            resultCalculation?.SourceCode.Should().Be(updateViewModel.SourceCode);
        }

        [TestMethod]
        public async Task SaveCalculation_OnInvalidModel_ThenBadRequestReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string specificationId = "1";
            string calculationId = "5";

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = null,
            };

            // Force validation failed
            controller.ModelState.AddModelError(nameof(updateViewModel.SourceCode), "Test");

            // Act
            IActionResult result = await controller.SaveCalculation(specificationId, calculationId, updateViewModel);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public void SaveCalculation_OnBackendError_ThenExceptionThrown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string specificationId = "1";
            string calculationId = "5";

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            calcsClient
                .EditCalculation(specificationId, calculationId, Arg.Any<CalculationEditModel>())
                .Returns(Task.FromResult(new ValidatedApiResponse<Calculation>(HttpStatusCode.ServiceUnavailable, null)));

            Calculation existingCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                SourceCode = "Existing source code"
            };

            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, existingCalculation));

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Source code",
            };

            // Act
            Action a = new Action(() =>
            {
                IActionResult result = controller.SaveCalculation(specificationId, calculationId, updateViewModel).Result;
            });

            // Assert
            a.Should().Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task SaveCalculation_GivenUserDoesNotHaveEditCalculationPermission_ThenReturnForbidResult()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string specificationId = "1";
            string calculationId = "5";

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(false);

            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Updated source code"
            };

            Calculation apiResultCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId
            };

            calcsClient
                .EditCalculation(specificationId, calculationId, Arg.Any<CalculationEditModel>())
                .Returns(new ValidatedApiResponse<Common.ApiClient.Calcs.Models.Calculation>(HttpStatusCode.OK, apiResultCalculation));

            // Act
            IActionResult result = await controller.SaveCalculation(specificationId, calculationId, updateViewModel);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task CompilePreview_OnSuccessfulSaveRequest_ThenResponseSentToClient()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";
            string specificationId = "65";

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            PreviewCompileRequestViewModel previewViewModel = new PreviewCompileRequestViewModel()
            {
                SourceCode = "Updated source code",
            };

            PreviewResponse apiResultCalculation = new PreviewResponse()
            {
                CompilerOutput = new Build()
                {
                    Success = true,
                }
            };

            calcsClient
                .PreviewCompile(Arg.Any<PreviewRequest>())
                .Returns(new ApiResponse<PreviewResponse>(HttpStatusCode.OK, apiResultCalculation));

            // Act
            IActionResult result = await controller.CompilePreview(specificationId, calculationId, previewViewModel);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            PreviewResponse previewResult = typedResult.Value as PreviewResponse;
            previewResult.CompilerOutput.Success.Should().Be(apiResultCalculation.CompilerOutput.Success);

            await authorizationHelper
                .DidNotReceive()
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Any<SpecificationActionTypes>());
        }

        [TestMethod]
        public async Task CompilePreview_OnInvalidModel_ThenBadRequestReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";
            string specificationId = "65";

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            PreviewCompileRequestViewModel previewViewModel = new PreviewCompileRequestViewModel()
            {
                SourceCode = "Updated source code",
            };

            // Force validation failed
            controller.ModelState.AddModelError(nameof(previewViewModel.SourceCode), "Test");

            // Act
            IActionResult result = await controller.CompilePreview(specificationId, calculationId, previewViewModel);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();

            await authorizationHelper
                .DidNotReceive()
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Any<SpecificationActionTypes>());
        }

        [TestMethod]
        public void CompilePreview_OnBackendError_ThenExceptionThrown()
        {
            // Arrange
            string calculationId = "5";
            string specificationId = "65";

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            PreviewCompileRequestViewModel previewViewModel = new PreviewCompileRequestViewModel()
            {
                SourceCode = "Updated source code",
            };

            calcsClient
                .PreviewCompile(Arg.Any<PreviewRequest>())
                .Returns(Task.FromResult(new ApiResponse<PreviewResponse>(HttpStatusCode.ServiceUnavailable, null)));

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Source code",
            };

            // Act
            Action a = new Action(() =>
            {
                IActionResult result = controller.CompilePreview(specificationId, calculationId, previewViewModel).Result;
            });

            // Assert
            a.Should().Throw<InvalidOperationException>();
        }
        
        [TestMethod]
        public void EditCalculationStatus_GivenFailedStatusCodeFromApprovingCalc_ThrowsInvalidOperationException()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();


            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.Forbidden);

            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(response);

            ValidatedApiResponse<Calculation> calculation = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", SpecificationId = specificationId });
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(calculation);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanApproveAnyCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            // Act
            Func<Task> test = async () => await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            test
                .Should()
                .Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenBadRequestStatusCodeFromApprovingCalc_ReturnsBadRequestObjectResponse()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();


            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.BadRequest);

            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(response);

            ValidatedApiResponse<Calculation> calculation = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", SpecificationId = specificationId });
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(calculation);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanApproveAnyCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);
            
            IActionResult actionResult = await controller.ApproveCalculation(specificationId, calculationId, model);

            actionResult
                .Should()
                .BeOfType<BadRequestObjectResult>();
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenUserDoesNotHaveCanApproveAnyCalculationPermission_Returns403()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel() { PublishStatus = PublishStatus.Approved };

            ValidatedApiResponse<Calculation> response = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", SpecificationId = specificationId });

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(response);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(true);

            authorizationHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>())
                .Returns(Task.FromResult(new Common.ApiClient.Users.Models.FundingStreamPermission()));


            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            // Act
            IActionResult result = await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            result.Should().BeOfType<ForbidResult>();

            await authorizationHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations));

            await authorizationHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations));
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenRequestContainsACalculationInADifferentSpecification_ReturnsError()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel() { PublishStatus = PublishStatus.Approved };

            ValidatedApiResponse<Calculation> response = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", SpecificationId = "anotherSpec" });

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(response);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(true);

            authorizationHelper.GetUserFundingStreamPermissions(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>())
                .Returns(Task.FromResult(new Common.ApiClient.Users.Models.FundingStreamPermission()));


            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            // Act
            IActionResult result = await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            result
                .Should()
                .BeOfType<PreconditionFailedResult>()
                .Which
                .Value
                .Should()
                .Be("The calculation requested is not contained within the specification requested");
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenUserHaveCanApproveAnyCalculationPermissionAndCalcIsNotAlreadyApproved_ReturnsOK()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel() { PublishStatus = PublishStatus.Draft };

            ValidatedApiResponse<Calculation> response = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", SpecificationId = specificationId, });

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(response);

            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, new PublishStatusResult() { PublishStatus = PublishStatus.Approved }));

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations))
                .Returns(true);

            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            // Act
            IActionResult result = await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            result.Should()
                .BeOfType<OkObjectResult>()
                .Which
                .Value
                .Should()
                .BeOfType<PublishStatusResult>()
                .Which
                .Should()
                .BeEquivalentTo(new PublishStatusResult()
                {
                    PublishStatus = PublishStatus.Approved
                });

            await authorizationHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations));

            await authorizationHelper
                .Received(0)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations));
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenUserHaveCanApproveAnyCalculationPermissionAndCalcIsAlreadyApproved_ReturnsOK()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel() { PublishStatus = PublishStatus.Approved };

            ValidatedApiResponse<Calculation> response = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", SpecificationId = specificationId, });

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(response);

            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, new PublishStatusResult() { PublishStatus = PublishStatus.Approved }));

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations))
                .Returns(true);

            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);

            // Act
            IActionResult result = await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            result.Should()
                .BeOfType<OkObjectResult>()
                .Which
                .Value
                .Should()
                .BeOfType<PublishStatusResult>()
                .Which
                .Should()
                .BeEquivalentTo(new PublishStatusResult()
                {
                    PublishStatus = PublishStatus.Approved
                });

            await authorizationHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations));

            await authorizationHelper
                .Received(0)
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations));
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenUserHaveCanApproveCalculationPermissionAndIsNotLastAuthor_ReturnsOK()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel() { PublishStatus = PublishStatus.Approved };

            ValidatedApiResponse<Calculation> response = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", Author = new Reference() { Id = "SomeOne" }, SpecificationId = specificationId });

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(response);
            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, new PublishStatusResult()
                {
                    PublishStatus = PublishStatus.Approved
                }));

            var identity = Substitute.For<IIdentity>();
            identity.Name.Returns("BSir");

            ClaimsPrincipal user = new ClaimsPrincipal(new List<ClaimsIdentity>()
            {
                new ClaimsIdentity(identity,
                    new []{
                    new Claim("http://schemas.microsoft.com/identity/claims/objectidentifier","UId1"),
                    new Claim(ClaimTypes.GivenName , "Bob"),
                    new Claim(ClaimTypes.Surname, "Sir")
                })
            });

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations))
                .Returns(true);

            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient, user);

            // Act
            IActionResult result = await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            result.Should()
                .BeOfType<OkObjectResult>()
                .Which
                .Value
                .Should()
                .BeOfType<PublishStatusResult>()
                .Which
                .Should()
                .BeEquivalentTo(new PublishStatusResult()
                {
                    PublishStatus = PublishStatus.Approved
                });

            await authorizationHelper
               .Received(1)
               .DoesUserHavePermission(Arg.Is(user), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations));

            await authorizationHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Is(user), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations));
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenUserHaveCanApproveCalculationPermissionAndIsLastAuthor_ReturnsForbid()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel() { PublishStatus = PublishStatus.Approved };

            ValidatedApiResponse<Calculation> response = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation() { FundingStreamId = "fs1", Author = new Reference() { Id = "SomeOne" }, SpecificationId = specificationId });

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(Arg.Is(calculationId))
                .Returns(response);
            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, new PublishStatusResult()));

            var identity = Substitute.For<IIdentity>();
            identity.Name.Returns("BSir");

            ClaimsPrincipal user = new ClaimsPrincipal(new List<ClaimsIdentity>()
            {
                new ClaimsIdentity(identity,
                    new []{
                    new Claim("http://schemas.microsoft.com/identity/claims/objectidentifier","SomeOne"),
                    new Claim(ClaimTypes.GivenName , "Bob"),
                    new Claim(ClaimTypes.Surname, "Sir")
                })
            });

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations))
                .Returns(true);

            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient, user);

            // Act
            IActionResult result = await controller.ApproveCalculation(specificationId, calculationId, model);

            // Assert
            result.Should()
                .BeOfType<ForbidResult>();

            await authorizationHelper
               .Received(1)
               .DoesUserHavePermission(Arg.Is(user), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveAnyCalculations));

            await authorizationHelper
                .Received(1)
                .DoesUserHavePermission(Arg.Is(user), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveCalculations));
        }

        private static CalculationController CreateCalculationController(
            ICalculationsApiClient calcsClient,
            IMapper mapper,
            IAuthorizationHelper authorizationHelper,
            IResultsApiClient resultsApiClient,
            ClaimsPrincipal user = null)
        {
            var controller = new CalculationController(calcsClient, mapper, authorizationHelper, resultsApiClient);
            controller.ControllerContext = new ControllerContext() { HttpContext = new DefaultHttpContext() { User = user } };
            return controller;
        }
    }
}
