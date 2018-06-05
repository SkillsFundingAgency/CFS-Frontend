using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Controllers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.Controllers
{
    [TestClass]
    public class SpecificationControllerTests
    {
        [TestMethod]
        public void EditSpecificationStatus_GivenFailedStatusCode_ThrowsInvalidOperationException()
        {
            //Arrange
            string SpecificationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            ValidatedApiResponse<Specification> response = new ValidatedApiResponse<Specification>(HttpStatusCode.BadRequest);

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .UpdatePublishStatus(Arg.Is(SpecificationId), Arg.Is(model))
                .Returns(response);

            SpecificationController controller = new SpecificationController(specsClient);

            // Act
            Func<Task> test = async () => await controller.EditSpecificationStatus(SpecificationId, model);

            // Assert
            test
                .Should()
                .Throw<InvalidOperationException>();
        }

        [TestMethod]
        public async Task EditSpecificationStatus_GivenSuccessReturnedFromApi_ReturnsOK()
        {
            //Arrange
            string SpecificationId = "5";

            PublishStatusEditModel model = new PublishStatusEditModel();

            Specification specification = new Specification();

            ValidatedApiResponse<Specification> response = new ValidatedApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .UpdatePublishStatus(Arg.Is(SpecificationId), Arg.Is(model))
                .Returns(response);

            SpecificationController controller = new SpecificationController(specsClient);

            // Act
            IActionResult result = await controller.EditSpecificationStatus(SpecificationId, model);

            // Assert
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Which
                .Value
                .Should()
                .Be(specification);
        }
    }
}
