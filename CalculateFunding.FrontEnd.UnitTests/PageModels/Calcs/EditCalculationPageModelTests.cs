// <copyright file="EditCalculationPageModelTests.cs" company="Department for Education">
// Copyright (c) Department for Education. All rights reserved.
// </copyright>

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    using System.Security.Claims;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Pages.Calcs;
    using CalculateFunding.Frontend.UnitTests.Helpers;
    using CalculateFunding.Frontend.ViewModels.Common;
    using FluentAssertions;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using NSubstitute;

    [TestClass]
    public class EditCalculationPageModelTests
    {
        [TestMethod]
        public async Task OnGet_WhenCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            EditCalculationPageModel pageModel = CreatePageModel(mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenSpecCalculationDoesNotExistThenNotFoundReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            calcsClient.GetCalculationById(calculationId).Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference("1", "Test Calculation Specification"),
                SpecificationId = "54",
            }));

            EditCalculationPageModel pageModel = CreatePageModel(calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsThenCalculationReturned()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            const string calculationId = "5";
            const string specificationId = "specId";
            const string specificationName = "Spec Name";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = specificationId,
                SourceCode = "Test Source Code"
            };

            Clients.SpecsClient.Models.CalculationCurrentVersion specsCalculation = new Clients.SpecsClient.Models.CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion>(System.Net.HttpStatusCode.OK, specsCalculation));

            Clients.SpecsClient.Models.SpecificationSummary specificationSummary = new Clients.SpecsClient.Models.SpecificationSummary()
            {
                Id = specificationId,
                Name = specificationName
            };

            specsClient
                .GetSpecificationSummary(Arg.Is(specificationId))
                .Returns(new ApiResponse<Clients.SpecsClient.Models.SpecificationSummary>(System.Net.HttpStatusCode.OK, specificationSummary));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.SourceCode);
            pageModel.SpecificationName.Should().Be(specificationName);

            await calcsClient
                .Received(1)
                .GetCalculationById(Arg.Is(calculationId));

            await specsClient
               .Received(1)
               .GetSpecificationSummary(Arg.Is(specificationId));

            await specsClient
                .Received(1)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistsButCalculationTypeIsZero_ThenCalculationDisplayTypeIsEmpty()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();
            
            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = "54",
                SourceCode = "Test Source Code",
                CalculationType = Clients.SpecsClient.Models.CalculationSpecificationType.Number
            };

            Clients.SpecsClient.Models.CalculationCurrentVersion specsCalculation = new Clients.SpecsClient.Models.CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion>(System.Net.HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(CalculationSpecificationTypeViewModel.Number);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationExistdCalculationTypeIsFunding_ThenCalculationDisplayTypeIsFunding()
        {
            // Arrange
            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                Id = calculationId,
                CalculationSpecification = new Reference(calculationId, "Test Calculation Specification"),
                SpecificationId = "54",
                SourceCode = "Test Source Code",
                CalculationType = Clients.SpecsClient.Models.CalculationSpecificationType.Funding
            };

            Clients.SpecsClient.Models.CalculationCurrentVersion specsCalculation = new Clients.SpecsClient.Models.CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Specs Calculation",
                Description = "Spec Description",
            };

            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            specsClient
                .GetCalculationById(calcsCalculation.SpecificationId, calculationId)
                .Returns(new ApiResponse<Clients.SpecsClient.Models.CalculationCurrentVersion>(System.Net.HttpStatusCode.OK, specsCalculation));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, calcsClient: calcsClient, mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<PageResult>();

            pageModel.Calculation.Should().NotBeNull();
            pageModel.Calculation.Name.Should().Be(calcsCalculation.Name);
            pageModel.Calculation.Description.Should().Be(specsCalculation.Description);
            pageModel.SpecificationId.Should().Be(calcsCalculation.SpecificationId);
            pageModel.EditModel.SourceCode.Should().Be(calcsCalculation.SourceCode);
            pageModel.Calculation.CalculationType.Should().Be(CalculationSpecificationTypeViewModel.Funding);
        }

        [TestMethod]
        public async Task OnGet_WhenCalculationIdNotProvidedThenBadResultReturned()
        {
            // Arrange
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = null;

            EditCalculationPageModel pageModel = CreatePageModel(mapper: mapper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<BadRequestObjectResult>();

            BadRequestObjectResult typedResult = result as BadRequestObjectResult;
            typedResult.Value.Should().Be("Enter a unique name");

            pageModel
                .ShouldAggregateSupportForCalculationsBeEnabled
                .Should()
                .BeFalse();
        }

        [TestMethod]
        public async Task OnGet_WhenIsAggregateSupportInCalculationsEnabled_SetsPropertyToTrue()
        {
            // Arrange
            IFeatureToggle featureToggle = Substitute.For<IFeatureToggle>();
            featureToggle
                .IsAggregateSupportInCalculationsEnabled()
                .Returns(true);

            string calculationId = null;

            EditCalculationPageModel pageModel = CreatePageModel(features: featureToggle);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            pageModel
                .ShouldAggregateSupportForCalculationsBeEnabled
                .Should()
                .BeTrue();
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesHaveEditCalculationsPermission_ThenDoesUserHavePermissionToApproveOrEditIsTrue()
        {
            // Arrange
            string calculationId = "5";
            Calculation calcsCalculation = new Calculation()
            {
                SpecificationId = "abc123",
                CalculationSpecification = new Reference { Id = "cs345", Name = "calc name" }
            };

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(true);

            EditCalculationPageModel pageModel = CreatePageModel(calcsClient: calcsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGet("5");

            // Assert
            pageModel.DoesUserHavePermissionToApproveOrEdit.Should().Be("true");
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesNotHaveEditCalculationsPermission_ThenDoesUserHavePermissionToApproveOrEditIsFalse()
        {
            // Arrange
            IMapper mapper = MappingHelper.CreateFrontEndMapper();

            string calculationId = "5";

            Calculation calcsCalculation = new Calculation()
            {
                SpecificationId = "abc123",
                CalculationSpecification = new Reference { Id = "cs345", Name = "calc name" }
            };

            ICalculationsApiClient calcsClient = Substitute.For<ICalculationsApiClient>();
            calcsClient
                .GetCalculationById(calculationId)
                .Returns(new ApiResponse<Calculation>(System.Net.HttpStatusCode.OK, calcsCalculation));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditCalculations))
                .Returns(false);

            EditCalculationPageModel pageModel = CreatePageModel(calcsClient: calcsClient, mapper: mapper, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGet(calculationId);

            // Assert
            pageModel.DoesUserHavePermissionToApproveOrEdit.Should().Be("false");
        }

        private static EditCalculationPageModel CreatePageModel(
            ISpecsApiClient specsClient = null,
            ICalculationsApiClient calcsClient = null,
            IMapper mapper = null,
            IFeatureToggle features = null,
            IAuthorizationHelper authorizationHelper = null)
        {
            EditCalculationPageModel pageModel = new EditCalculationPageModel(
                specsClient ?? CreateSpecsApiClient(),
                calcsClient ?? CreateCalcsApiClient(),
                mapper ?? CreateMapper(),
                features ?? CreateFeatureToggle(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditCalculations));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();
            return pageModel;
        }

        private static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static ICalculationsApiClient CreateCalcsApiClient()
        {
            return Substitute.For<ICalculationsApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        private static IFeatureToggle CreateFeatureToggle()
        {
            return Substitute.For<IFeatureToggle>();
        }
    }
}
