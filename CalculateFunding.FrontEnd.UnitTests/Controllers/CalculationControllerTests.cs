// <copyright file="CalculationControllerTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.Controllers
{
    using System;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class CalculationControllerTests
    {
        [TestMethod]
        public async Task SaveCalculation_OnSuccessfulSaveRequest_ThenResponseSentToClient()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationController controller = new CalculationController(calcsClient, mapper);

            string specificationId = "1";
            string calculationId = "5";

            CalculationUpdateViewModel updateViewModel = new CalculationUpdateViewModel()
            {
                SourceCode = "Updated source code"
            };

            Calculation apiResultCalculation = new Calculation()
            {
                Id = calculationId,
                SpecificationId = specificationId,
                SourceCode = updateViewModel.SourceCode,
            };

            calcsClient
                .UpdateCalculation(calculationId, Arg.Any<CalculationUpdateModel>())
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, apiResultCalculation));

            // Act
            IActionResult result = await controller.SaveCalculation(specificationId, calculationId, updateViewModel);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            Calculation resultCalculation = typedResult.Value as Calculation;
            resultCalculation.SourceCode.Should().Be(updateViewModel.SourceCode);
        }

        [TestMethod]
        public async Task SaveCalculation_OnInvalidModel_ThenBadRequestReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationController controller = new CalculationController(calcsClient, mapper);

            string specificationId = "1";
            string calculationId = "5";

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

            CalculationController controller = new CalculationController(calcsClient, mapper);

            string specificationId = "1";
            string calculationId = "5";

            calcsClient
                .UpdateCalculation(calculationId, Arg.Any<CalculationUpdateModel>())
                .Returns(Task.FromResult(new ApiResponse<Calculation>(System.Net.HttpStatusCode.ServiceUnavailable, null)));

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
        public async Task CompilePreview_OnSuccessfulSaveRequest_ThenResponseSentToClient()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationController controller = new CalculationController(calcsClient, mapper);

            string calculationId = "5";
            string specificationId = "65";

            PreviewCompileRequestViewModel previewViewModel = new PreviewCompileRequestViewModel()
            {
                SourceCode = "Updated source code",
            };

            PreviewCompileResult apiResultCalculation = new PreviewCompileResult()
            {
                 CompilerOutput = new CompilerOutput()
                 {
                      Success = true,
                 }
            };

            calcsClient
                .PreviewCompile(Arg.Any<PreviewCompileRequest>())
                .Returns(new ApiResponse<PreviewCompileResult>(System.Net.HttpStatusCode.OK, apiResultCalculation));

            // Act
            IActionResult result = await controller.CompilePreview(specificationId, calculationId, previewViewModel);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();

            OkObjectResult typedResult = result as OkObjectResult;
            PreviewCompileResult previewResult = typedResult.Value as PreviewCompileResult;
            previewResult.CompilerOutput.Success.Should().Be(apiResultCalculation.CompilerOutput.Success);
        }

        [TestMethod]
        public async Task CompilePreview_OnInvalidModel_ThenBadRequestReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationController controller = new CalculationController(calcsClient, mapper);

            string calculationId = "5";
            string specificationId = "65";

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
        }

        [TestMethod]
        public void CompilePreview_OnBackendError_ThenExceptionThrown()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            CalculationController controller = new CalculationController(calcsClient, mapper);

            string calculationId = "5";
            string specificationId = "65";

            PreviewCompileRequestViewModel previewViewModel = new PreviewCompileRequestViewModel()
            {
                SourceCode = "Updated source code",
            };

            calcsClient
                .PreviewCompile(Arg.Any<PreviewCompileRequest>())
                .Returns(Task.FromResult(new ApiResponse<PreviewCompileResult>(System.Net.HttpStatusCode.ServiceUnavailable, null)));

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
    }
}
