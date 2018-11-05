using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.PageModels.Calcs
{
    [TestClass]
    public class CreateCalculationPageModelTests
    {
        const string specificationId = "5acedc70-b8e8-4769-9840-5692e4826579";
        const string fundingStreamId = "ABCDE";

        [TestMethod]
        public void OnGetAsync_GivenNullOrEmptySpecificationId_ThrowsArgumentNullException()
        {
            //Arrange
            string emptySpecificationId = "";

            CreateCalculationPageModel pageModel = CreatePageModel();

            //Act
            Func<Task> test = async () => await pageModel.OnGetAsync(emptySpecificationId);

            //Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSpecificationCouldNotBeFound_ReturnsPage()
        {
            //Arrange
            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.NotFound);

            ISpecsApiClient specsClient = CreateSpecsApiClient();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(apiResponse);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .NotBeNull();

            result
                .Should()
                .BeAssignableTo<PageResult>();

            pageModel
                .FundingPeriodName
                .Should()
                .BeNullOrWhiteSpace();

            pageModel
               .FundingPeriodId
               .Should()
               .BeNullOrWhiteSpace();

            pageModel
               .SpecificationName
               .Should()
               .BeNullOrWhiteSpace();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenResponseReturnsNullWhenFetchingAllocationLines_ReturnsInternalServerError()
        {
            //Arrange
            Specification specification = CreateSpecification();

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsClient = CreateSpecsApiClient();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(apiResponse);
            specsClient
                .GetFundingStreamByFundingStreamId(Arg.Is(fundingStreamId))
                .Returns((ApiResponse<FundingStream>)null);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .BeAssignableTo<InternalServerErrorResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSpecificationFound_PopulatesFormReturnsPage()
        {
            //Arrange
            Specification specification = CreateSpecification();

            IEnumerable<AllocationLine> allocationLines = new[]
            {
                new AllocationLine
                {
                    Id = "alloc-id",
                    Name = "alloc-name"
                }
            };

            List<FundingStream> fundingStreams = new List<FundingStream>();

            FundingStream fundingStream = new FundingStream
            {
                Id = fundingStreamId,
                AllocationLines = allocationLines
            };

            fundingStreams.Add(fundingStream);


            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(apiResponse);

            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .NotBeNull();

            result
                .Should()
                .BeAssignableTo<PageResult>();

            pageModel
                .FundingPeriodName
                .Should()
                .Be("2018 - 19");

            pageModel
               .FundingPeriodId
               .Should()
               .Be("2018/19");

            pageModel
               .SpecificationName
               .Should()
               .Be("spec-name");

            pageModel
                .Policies
                .Count
                .Should()
                .Be(2);

            pageModel
                .AllocationLines
                .Count()
                .Should()
                .Be(1);

            pageModel
                .CalculationTypes
                .Any()
                .Should()
                .BeTrue();
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturnsForbidResult()
        {
            // Arrange
            IAuthorizationHelper mockAuthHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            CreateCalculationPageModel pageModel = CreatePageModel(authorizationHelper: mockAuthHelper);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public void OnPostAsync_GivenNullOrEmptySpecificationId_ThrowsArgumentNullException()
        {
            //Arrange
            string emptySpecificationId = "";

            CreateCalculationPageModel pageModel = CreatePageModel();

            //Act
            Func<Task> test = async () => await pageModel.OnPostAsync(emptySpecificationId);

            //Assert
            test
                .Should()
                .ThrowExactly<ArgumentNullException>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationAlreadyExists_ReturnsPage()
        {
            //Arrange
            CreateCalculationViewModel viewModel = new CreateCalculationViewModel
            {
                Name = "any name"
            };

            Specification specification = CreateSpecification();

            IEnumerable<AllocationLine> allocationLines = new[]
            {
                new AllocationLine
                {
                    Id = "alloc-id",
                    Name = "alloc-name"
                }
            };

            List<FundingStream> fundingStreams = new List<FundingStream>();

            FundingStream fundingStream = new FundingStream
            {
                Id = fundingStreamId,
                AllocationLines = allocationLines
            };

            fundingStreams.Add(fundingStream);


            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ApiResponse<Calculation> calcApiRespnse = new ApiResponse<Calculation>(HttpStatusCode.OK);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiRespnse);

            specsClient
              .GetSpecification(Arg.Is(specificationId))
              .Returns(apiResponse);

            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient);

            pageModel.PageContext = new PageContext();

            pageModel.CreateCalculationViewModel = viewModel;

            //Act
            IActionResult result = await pageModel.OnPostAsync(specificationId);

            //Assert
            result
                .Should()
                .NotBeNull();

            result
                .Should()
                .BeAssignableTo<PageResult>();

            pageModel
                .FundingPeriodName
                .Should()
                .NotBeNullOrWhiteSpace();

            pageModel
               .FundingPeriodId
               .Should()
               .NotBeNullOrWhiteSpace();

            pageModel
               .SpecificationName
               .Should()
               .NotBeNullOrWhiteSpace();

            pageModel
                .ModelState
                .ErrorCount
                .Should()
                .Be(1);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationDoesNotAlreadyExistAndCalcTypeIsFundingButNoAllocationLineSelected_ReturnsPage()
        {
            //Arrange
            CreateCalculationViewModel viewModel = new CreateCalculationViewModel
            {
                Name = "any name",
                CalculationType = "Funding"
            };

            Specification specification = CreateSpecification();

            IEnumerable<AllocationLine> allocationLines = new[]
            {
                new AllocationLine
                {
                    Id = "alloc-id",
                    Name = "alloc-name"
                }
            };

            List<FundingStream> fundingStreams = new List<FundingStream>();

            FundingStream fundingStream = new FundingStream
            {
                Id = fundingStreamId,
                AllocationLines = allocationLines
            };

            fundingStreams.Add(fundingStream);


            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);


            CalculationCreateModel createModel = new CalculationCreateModel
            {
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> calcApiRespnse = new ApiResponse<Calculation>(HttpStatusCode.NotFound);

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiRespnse);

            specsClient
            .GetSpecification(Arg.Is(specificationId))
            .Returns(apiResponse);

            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient);

            pageModel.PageContext = new PageContext();

            pageModel.CreateCalculationViewModel = viewModel;

            //Act
            IActionResult result = await pageModel.OnPostAsync(specificationId);

            //Assert
            result
                .Should()
                .NotBeNull();

            result
                .Should()
                .BeAssignableTo<PageResult>();

            pageModel
               .ModelState
               .ErrorCount
               .Should()
               .Be(1);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenCalculationDoesNotAlreadyExist_ReturnsRedirect()
        {
            //Arrange
            CreateCalculationViewModel viewModel = new CreateCalculationViewModel
            {
                Name = "any name"
            };

            Specification specification = CreateSpecification();

            IEnumerable<Reference> allocationLines = new[]
            {
                new Reference
                {
                    Id = "alloc-id",
                    Name = "alloc-name"
                }
            };

            CalculationCreateModel createModel = new CalculationCreateModel
            {
                SpecificationId = specificationId
            };

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationCreateModel>(Arg.Is(viewModel))
                .Returns(createModel);

            ApiResponse<Calculation> calcApiRespnse = new ApiResponse<Calculation>(HttpStatusCode.NotFound);

            ApiResponse<Calculation> newCalcApiResponse = new ApiResponse<Calculation>(HttpStatusCode.OK, new Calculation
            {
                Id = "new-calc-id"
            });

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiRespnse);

            specsClient
                .CreateCalculation(Arg.Is(createModel))
                .Returns(newCalcApiResponse);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient, mapper);

            pageModel.PageContext = new PageContext();

            pageModel.CreateCalculationViewModel = viewModel;

            //Act
            IActionResult result = await pageModel.OnPostAsync(specificationId);

            //Assert
            result
                .Should()
                .NotBeNull();

            result
                .Should()
                .BeAssignableTo<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be($"/specs/policies/{specificationId}?operationType=CalculationCreated&operationId=new-calc-id");
        }

        [TestMethod]
        public void OnPostAsync_GivenCalculationDoesNotAlreadyExistButSavingIsNotOK_InvalidOperationException()
        {
            //Arrange
            CreateCalculationViewModel viewModel = new CreateCalculationViewModel
            {
                Name = "any name"
            };

            Specification specification = CreateSpecification();

            IEnumerable<Reference> allocationLines = new[]
            {
                new Reference
                {
                    Id = "alloc-id",
                    Name = "alloc-name"
                }
            };

            CalculationCreateModel createModel = new CalculationCreateModel
            {
                SpecificationId = specificationId
            };

            IMapper mapper = CreateMapper();
            mapper
                .Map<CalculationCreateModel>(Arg.Is(viewModel))
                .Returns(createModel);

            ApiResponse<Calculation> calcApiRespnse = new ApiResponse<Calculation>(HttpStatusCode.NotFound);

            ApiResponse<Calculation> newCalcApiResponse = new ApiResponse<Calculation>(HttpStatusCode.BadRequest, new Calculation
            {
                Id = "new-calc-id"
            });

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiRespnse);

            specsClient
                .CreateCalculation(Arg.Is(createModel))
                .Returns(newCalcApiResponse);

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient, mapper);

            pageModel.PageContext = new PageContext();

            pageModel.CreateCalculationViewModel = viewModel;

            //Act
            Func<Task> test = async () => await pageModel.OnPostAsync(specificationId);

            //Assert
            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnPost_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturnsForbidResult()
        {
            // Arrange
            IAuthorizationHelper mockAuthHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            CreateCalculationPageModel pageModel = CreatePageModel(authorizationHelper: mockAuthHelper);

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        static Specification CreateSpecification()
        {
            return new Specification
            {
                Id = specificationId,
                Name = "spec-name",
                FundingPeriod = new Reference
                {
                    Id = "2018/19",
                    Name = "2018 - 19"
                },
                Policies = new[]
                {
                     new Policy
                     {
                         Id = "policy-id",
                         Name = "policy-name",
                         SubPolicies = new List<Policy>
                         {
                             new Policy { Id = "sub-policy-id", Name = "sub-policy-name"}
                         }
                     }
                 },
                FundingStreams = new List<FundingStream>()
                {
                    new FundingStream
                    {
                        Id = fundingStreamId
                    },
                },
            };
        }

        static CreateCalculationPageModel CreatePageModel(ISpecsApiClient specsClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            CreateCalculationPageModel pageModel = new CreateCalculationPageModel(specsClient ?? CreateSpecsApiClient(), mapper ?? CreateMapper(), authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();
            return pageModel;
        }

        static ISpecsApiClient CreateSpecsApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }
    }
}
