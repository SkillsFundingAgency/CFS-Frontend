// <copyright file="CalculationControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Specifications;

namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Net;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.UnitTests.Helpers;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class CalculationControllerTests
    {
	    private ISpecificationsApiClient specificationsApiClient;

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
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Updated source code"
            };

            Calculation apiResultCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                Current = new CalculationVersion
                {
                    SourceCode = updateViewModel.SourceCode
                },
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
            resultCalculation?.Current.SourceCode.Should().Be(updateViewModel.SourceCode);
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
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

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
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

            calcsClient
                .EditCalculation(specificationId, calculationId, Arg.Any<CalculationEditModel>())
                .Returns(Task.FromResult(new ValidatedApiResponse<Calculation>(HttpStatusCode.ServiceUnavailable, null)));

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

            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Updated source code"
            };

            Calculation apiResultCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                Current = new CalculationVersion
                {
                    SourceCode = updateViewModel.SourceCode,
                }
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
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

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
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

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
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

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
        public void EditCalculationStatus_GivenFailedStatusCode_ThrowsInvalidOperationException()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.BadRequest);

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(response);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

            // Act
            Func<Task> test = async () => await controller.EditCalculationStatus(specificationId, calculationId, model);

            // Assert
            test
                .Should()
                .Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenOKResponseFromApi_ReturnsOK()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            PublishStatusResult publishStatusResult = new PublishStatusResult();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, publishStatusResult);

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(response);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanEditCalculations);
            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

            // Act
            IActionResult result = await controller.EditCalculationStatus(specificationId, calculationId, model);

            // Assert
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Which
                .Value
                .Should()
                .Be(publishStatusResult);
        }

        [TestMethod]
        public async Task EditCalculationStatus_GivenUserDoesNotHaveEditCalculationPermission_Returns403()
        {
            //Arrange
            string specificationId = "abc123";
            string calculationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            PublishStatusResult publishStatusResult = new PublishStatusResult();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, publishStatusResult);

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .UpdatePublishStatus(Arg.Is(calculationId), Arg.Is(model))
                .Returns(response);

            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(false);


            CalculationController controller = CreateCalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);

            // Act
            IActionResult result = await controller.EditCalculationStatus(specificationId, calculationId, model);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

		private static CalculationController CreateCalculationController(ICalculationsApiClient calcsClient, IMapper mapper, IAuthorizationHelper authorizationHelper, ISpecificationsApiClient specificationsApiClient)
        {
            return new CalculationController(calcsClient, mapper, authorizationHelper, specificationsApiClient);
        }
    }
}
