using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
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
        public async Task OnGetAsync_GivenSpecificationCouldNotBeFound_ReturnsPreconditionFailed()
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
                .BeAssignableTo<PreconditionFailedResult>()
                .Which
                .Value
                .Should()
                .Be("Specification not found");
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

            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();
            baselineCalculations.Add(new CalculationCurrentVersion()
            {
                AllocationLine = new Reference("AL1", "Allocation Line Name"),
            });

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResult = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(apiResponse);

            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(baselineCalculationsResult);

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

            pageModel
                .IsAuthorizedtoEdit
                .Should().BeTrue();

            pageModel
                .HideAllocationLinesForBaselinesJson
                .Should()
                .Be("[\"AL1\"]");
        }

        [TestMethod]
        public async Task OnGet_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturnPageResultWithAuthorizedToEditFlagSetToFalse()
        {
            // Arrange
            IAuthorizationHelper mockAuthHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            Specification specification = new Specification()
            {
                Id = specificationId,
                FundingPeriod = new Reference("fp1", "FP 2"),
            };

            specsClient.GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, Enumerable.Empty<CalculationCurrentVersion>()));

            List<FundingStream> fundingStreams = new List<FundingStream>();
            fundingStreams.Add(new FundingStream
            {
                Id = fundingStreamId,
                AllocationLines = new List<AllocationLine>()
                {
                    new AllocationLine()
                    {
                        Id = "al1",
                        Name = "Allocation Line 1",
                    }
                }
            });

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);
            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, Enumerable.Empty<CalculationCurrentVersion>()));

            CreateCalculationPageModel pageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: mockAuthHelper);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .IsAuthorizedtoEdit
                .Should()
                .BeFalse();
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

            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ApiResponse<Calculation> calcApiResponse = new ApiResponse<Calculation>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResponse = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiResponse);

            specsClient
              .GetSpecification(Arg.Is(specificationId))
              .Returns(apiResponse);

            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(baselineCalculationsResponse);

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

            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            CalculationCreateModel createModel = new CalculationCreateModel
            {
                SpecificationId = specificationId
            };

            ApiResponse<Calculation> calcApiResponse = new ApiResponse<Calculation>(HttpStatusCode.NotFound);

            ApiResponse<Specification> apiResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResponse = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiResponse);

            specsClient
            .GetSpecification(Arg.Is(specificationId))
            .Returns(apiResponse);

            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(baselineCalculationsResponse);

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

            ValidatedApiResponse<Calculation> newCalcApiResponse = new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, new Calculation
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

            ValidatedApiResponse<Calculation> newCalcApiResponse = new ValidatedApiResponse<Calculation>(HttpStatusCode.InternalServerError, new Calculation
            {
                Id = "new-calc-id",
            });

            newCalcApiResponse.ModelState = new Dictionary<string, IEnumerable<string>>();

            ISpecsApiClient specsClient = CreateSpecsApiClient();

            specsClient
                .GetCalculationBySpecificationIdAndCalculationName(Arg.Is(specificationId), Arg.Is(viewModel.Name))
                .Returns(calcApiRespnse);

            specsClient
                .CreateCalculation(Arg.Is(createModel))
                .Returns(newCalcApiResponse);

            List<FundingStream> fundingStreams = new List<FundingStream>();
            fundingStreams.Add(new FundingStream
            {
                Id = fundingStreamId,
                AllocationLines = new List<AllocationLine>()
                {
                    new AllocationLine()
                    {
                        Id = "al1",
                        Name = "Allocation Line 1",
                    }
                }
            });

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);
            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, Enumerable.Empty<CalculationCurrentVersion>()));

            specsClient.GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

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
