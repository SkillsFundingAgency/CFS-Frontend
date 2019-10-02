using System;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.UnitTests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class SpecificationControllerTests
    {
        [TestMethod]
        public void EditSpecificationStatus_GivenFailedStatusCode_ThrowsInvalidOperationException()
        {
            //Arrange
            string specificationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.BadRequest);

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .UpdatePublishStatus(Arg.Is(specificationId), Arg.Is(model))
                .Returns(response);

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanApproveSpecification);
            SpecificationController controller = CreateSpecificationController(specsClient, authorizationHelper);

            // Act
            Func<Task> test = async () => await controller.EditSpecificationStatus(specificationId, model);

            // Assert
            test
                .Should()
                .Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task EditSpecificationStatus_GivenSuccessReturnedFromApi_ReturnsOK()
        {
            //Arrange
            string specificationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            PublishStatusResult publishStatusResult = new PublishStatusResult();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, publishStatusResult);

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .UpdatePublishStatus(Arg.Is(specificationId), Arg.Is(model))
                .Returns(response);

            IAuthorizationHelper authorizationHelper = TestAuthHelper.CreateAuthorizationHelperSubstitute(specificationId, SpecificationActionTypes.CanApproveSpecification);
            SpecificationController controller = CreateSpecificationController(specsClient, authorizationHelper);

            // Act
            IActionResult result = await controller.EditSpecificationStatus(specificationId, model);

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
        public async Task EditSpecificationStatus_WhenUserDoesNotHaveApproveSpecificationPermission_ThenReturn403()
        {
            //Arrange
            string specificationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            PublishStatusResult publishStatusResult = new PublishStatusResult();

            ValidatedApiResponse<PublishStatusResult> response = new ValidatedApiResponse<PublishStatusResult>(HttpStatusCode.OK, publishStatusResult);

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .UpdatePublishStatus(Arg.Is(specificationId), Arg.Is(model))
                .Returns(response);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanApproveSpecification))
                .Returns(false);
            SpecificationController controller = CreateSpecificationController(specsClient, authorizationHelper);

            // Act
            IActionResult result = await controller.EditSpecificationStatus(specificationId, model);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task SelectSpecificationForFunding_WhenUserDoesNotHaveChooseFundingPermission_ThenReturns403()
        {
            // Arrange
            string specificationId = "5";

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper.DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanChooseFunding))
                .Returns(false);
            SpecificationController controller = CreateSpecificationController(specsClient, authorizationHelper);

            // Act
            IActionResult result = await controller.SelectSpecificationForFunding(specificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        private static SpecificationController CreateSpecificationController(ISpecsApiClient specsClient, IAuthorizationHelper authorizationHelper)
        {
            return new SpecificationController(specsClient, authorizationHelper);
        }
	}
}