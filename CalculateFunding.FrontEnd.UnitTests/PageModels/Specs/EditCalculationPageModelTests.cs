//using System.Collections.Generic;
//using System.Linq;
//using System.Net;
//using System.Security.Claims;
//using System.Threading.Tasks;
//using AutoMapper;
//using CalculateFunding.Common.ApiClient.Calcs;
//using CalculateFunding.Common.ApiClient.Calcs.Models;
//using CalculateFunding.Common.ApiClient.Models;
//using CalculateFunding.Common.ApiClient.Policies;
//using CalculateFunding.Common.ApiClient.Policies.Models;
//using CalculateFunding.Common.ApiClient.Specifications;
//using CalculateFunding.Common.ApiClient.Specifications.Models;
//using CalculateFunding.Common.Identity.Authorization.Models;
//using CalculateFunding.Common.Models;
//using CalculateFunding.Frontend.Extensions;
//using CalculateFunding.Frontend.Helpers;
//using CalculateFunding.Frontend.Pages.Specs;
//using CalculateFunding.Frontend.UnitTests.Helpers;
//using CalculateFunding.Frontend.ViewModels.Common;
//using CalculateFunding.Frontend.ViewModels.Specs;
//using FluentAssertions;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Mvc.RazorPages;
//using Microsoft.AspNetCore.Mvc.Rendering;
//using Microsoft.VisualStudio.TestTools.UnitTesting;
//using NSubstitute;
//using Serilog;

//namespace CalculateFunding.Frontend.UnitTests.PageModels.Specs
//{
//    [TestClass]
//    public class EditCalculationPageModelTests
//    {
//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationFound_ThenEditFormIsDisplayed()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            Calculation calculation = new Calculation()
//            {
//                Id = calculationId,
//                Name = "Calculation Name",
//                AllocationLine = new Reference("al1", "Allocation Line"),
//                CalculationType = CalculationSpecificationType.Funding,
//                Description = "Calculation Description"
//            };

//            FundingStream fundingStream1 = new FundingStream()
//            {
//                Id = "fsId",
//                Name = "Funding Stream 1",
//                AllocationLines = new List<AllocationLine>()
//                {
//                    new AllocationLine("al1", "Funding Stream - Allocation Line 1"),
//                    new AllocationLine("al2", "Funding Stream - Allocation Line 2"),
//                }
//            };

//            FundingStream fundingStream2 = new FundingStream()
//            {
//                Id = "fs2Id",
//                Name = "Funding Stream 2",
//                AllocationLines = new List<AllocationLine>()
//                        {
//                            new AllocationLine("al3", "Funding Stream 2 - Allocation Line 1"),
//                            new AllocationLine("al4", "Funding Stream 2 - Allocation Line 2"),
//                        }
//            };

//            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();
//            baselineCalculations.Add(new CalculationCurrentVersion()
//            {
//                AllocationLine = new Reference("AL1", "Allocation Line 1"),
//            });

//            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResponse = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

//            SpecificationSummary specification = CreateSpecification(specificationId);

//            ISpecificationsApiClient specsClient = CreateSpecsClient();

//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            IPoliciesApiClient policiesClient = CreatePoliciesClient();

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calculation));

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

//            specsClient
//                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
//                .Returns(baselineCalculationsResponse);

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fsId"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream1));

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fs2Id"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream2));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, calcsClient: calcsClient, policiesClient: policiesClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<PageResult>()
//                .Which
//                .Should()
//                .NotBeNull();

//            pageModel
//                .EditCalculationViewModel
//                .Should()
//                .BeEquivalentTo<EditCalculationViewModel>(new EditCalculationViewModel()
//                {

//                    Name = "Calculation Name",
//                    AllocationLineId = "al1",
//                    CalculationType = "Funding",
//                    Description = "Calculation Description"
//                });

//            pageModel
//                .Specification
//                .Should()
//                .BeEquivalentTo(new SpecificationViewModel()
//                {
//                    Id = specificationId,
//                    Name = "Specification Name",
//                    FundingStreams = new List<ReferenceViewModel>()
//                    {
//                        new ReferenceViewModel("fsId", "Funding Stream 1"),
//                        new ReferenceViewModel("fs2Id", "Funding Stream 2"),
//                    },
//                });

//            pageModel
//                .AllocationLines
//                .Should()
//                .BeEquivalentTo(new List<SelectListItem>()
//                {
//                    new SelectListItem()
//                    {
//                        Disabled = false,
//                        Selected = true,
//                        Text = "Funding Stream - Allocation Line 1",
//                        Value = "al1",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream - Allocation Line 2",
//                        Value = "al2",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream 2 - Allocation Line 1",
//                        Value = "al3",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream 2 - Allocation Line 2",
//                        Value = "al4",
//                    }
//                });

//            pageModel
//                .HideAllocationLinesForBaselinesJson
//                .Should()
//                .Be("[\"AL1\"]");

//            pageModel
//                .IsAuthorizedToEdit
//                .Should().BeTrue();
//        }

//        private static SpecificationSummary CreateSpecification(string specificationId)
//        {
//            return new SpecificationSummary()
//            {
//                Id = specificationId,
//                Name = "Specification Name",
//                FundingStreams = new List<FundingStream>()
//                 {
//                    new FundingStream()
//                    {
//                        Id="fsId",
//                        Name= "Funding Stream 1",
//                        AllocationLines = new List<AllocationLine>()
//                        {
//                            new AllocationLine("al1", "Funding Stream - Allocation Line 1"),
//                            new AllocationLine("al2", "Funding Stream - Allocation Line 2"),
//                        }
//                    },
//                    new FundingStream()
//                    {
//                        Id="fs2Id",
//                        Name= "Funding Stream 2",
//                        AllocationLines = new List<AllocationLine>()
//                        {
//                            new AllocationLine("al3", "Funding Stream 2 - Allocation Line 1"),
//                            new AllocationLine("al4", "Funding Stream 2 - Allocation Line 2"),
//                        }
//                    }
//                 }
//            };
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationNotFound_ThenNotFoundIsReturned()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.NotFound, null));

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, calcsClient: calcsClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<NotFoundObjectResult>()
//                .Which
//                .Value
//                .Should()
//                .Be("Calculation not found");

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            await calcsClient
//                .Received(1)
//                .GetCalculationById(Arg.Is(calculationId));
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationApiResponseIsNull_ThenInternalErrorIsReturned()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ILogger logger = CreateLogger();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns((ApiResponse<Calculation>)null);

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger, calcsClient: calcsClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<InternalServerErrorResult>()
//                .Which
//                .Value
//                .Should()
//                .Be("Calculation Result API response returned null");

//            logger
//                .Received(1)
//                .Error("Calculation Result API response returned null for calculation ID '{calculationId}' on specificationId '{specificationId}'", calculationId, specificationId);

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            await calcsClient
//                .Received(1)
//                .GetCalculationById(Arg.Is(calculationId));
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationApiResponseIsNotSuccessful_ThenInternalErrorIsReturned()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ILogger logger = CreateLogger();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.InternalServerError, null));

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger, calcsClient: calcsClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<InternalServerErrorResult>()
//                .Which
//                .Value
//                .Should()
//                .Be("Unexpected status code from Calculation API call 'InternalServerError'");

//            logger
//                .Received(1)
//                .Warning($"Unexpected status code from Calculation API call 'InternalServerError'");

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            await calcsClient
//                .Received(1)
//                .GetCalculationById(Arg.Is(calculationId));
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationApiResponseContentIsNull_ThenInternalErrorIsReturned()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ILogger logger = CreateLogger();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, null));

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger, calcsClient: calcsClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<InternalServerErrorResult>()
//                .Which
//                .Value
//                .Should()
//                .Be("Calculation content returned null");

//            logger
//                .Received(1)
//                .Warning("Calculation Result API response content returned null for calculation ID '{calculationId}' on specificationId '{specificationId}'", calculationId, specificationId);

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            await calcsClient
//                .Received(1)
//                .GetCalculationById(Arg.Is(calculationId));
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenSpecificationNotFound_ThenPreconditionFailedReturned()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ILogger logger = CreateLogger();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound, new SpecificationSummary()));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger, calcsClient: calcsClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<PreconditionFailedResult>()
//                .Which
//                .Value
//                .Should()
//                .Be("Specification not found");

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            await calcsClient
//                .Received(0)
//                .GetCalculationById(Arg.Is(calculationId));
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnGetAsync_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturnOkWithAuthorizedToEditFlagSetToFalse()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            Calculation calculation = new Calculation()
//            {
//                Id = calculationId,
//                Name = "Calculation Name",
//                AllocationLine = new Reference("al1", "Allocation Line"),
//                CalculationType = CalculationSpecificationType.Funding,
//                Description = "Calculation Description",
//            };

//            FundingStream fundingStream1 = new FundingStream()
//            {
//                Id = "fsId",
//                Name = "Funding Stream 1",
//                AllocationLines = new List<AllocationLine>()
//                {
//                    new AllocationLine("al1", "Funding Stream - Allocation Line 1"),
//                    new AllocationLine("al2", "Funding Stream - Allocation Line 2"),
//                }
//            };

//            FundingStream fundingStream2 = new FundingStream()
//            {
//                Id = "fs2Id",
//                Name = "Funding Stream 2",
//                AllocationLines = new List<AllocationLine>()
//                        {
//                            new AllocationLine("al3", "Funding Stream 2 - Allocation Line 1"),
//                            new AllocationLine("al4", "Funding Stream 2 - Allocation Line 2"),
//                        }
//            };

//            SpecificationSummary specification = CreateSpecification(specificationId);

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            IPoliciesApiClient policiesClient = CreatePoliciesClient();

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fsId"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream1));

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fs2Id"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream2));

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calculation));

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

//            List<FundingStream> fundingStreams = new List<FundingStream>();
//            fundingStreams.Add(new FundingStream
//            {
//                Id = "fs1",
//                AllocationLines = new List<AllocationLine>()
//                {
//                    new AllocationLine()
//                    {
//                        Id = "al1",
//                        Name = "Allocation Line 1",
//                    }
//                }
//            });

//            specsClient
//                .GetBaselineCalculationsBySpecificationId(Arg.Is(specification.Id))
//                .Returns(new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, Enumerable.Empty<CalculationCurrentVersion>()));

//            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);
//            specsClient
//                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
//                .Returns(fundingStreamResponse);


//            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
//            authorizationHelper
//                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
//                .Returns(false);

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, authorizationHelper: authorizationHelper, calcsClient: calcsClient, policiesClient: policiesClient);

//            // Act
//            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<PageResult>()
//                .Which
//                .Should()
//                .NotBeNull();

//            pageModel
//                .IsAuthorizedToEdit
//                .Should()
//                .BeFalse();
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnPostAsync_WhenValidCalculationDetailsProvided_ThenCalculationIsEdited()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            EditCalculationViewModel viewModel = new EditCalculationViewModel()
//            {
//                Name = "Updated Name",
//                AllocationLineId = "al2",
//                CalculationType = "Number",
//                Description = "Updated description"
//            };

//            Calculation resultCalculation = new Calculation()
//            {
//                Id = calculationId,
//                Name = "Calculation Name",
//                AllocationLine = new Reference("al1", "Allocation Line"),
//                CalculationType = CalculationSpecificationType.Funding,
//                Description = "Calculation Description"
//            };

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            calcsClient
//                .EditCalculation(Arg.Is(specificationId), Arg.Is(calculationId), Arg.Any<CalculationEditModel>())
//                .Returns(new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, resultCalculation));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, calcsClient: calcsClient);

//            pageModel.PageContext = new PageContext();

//            pageModel.EditCalculationViewModel = viewModel;

//            // Act
//            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<RedirectResult>()
//                .Which
//                .Url
//                .Should()
//                .Be($"/specs/policies/{specificationId}?operationId={calculationId}&operationType=CalculationUpdated");

//            await calcsClient
//                .Received(1)
//                .EditCalculation(
//                    Arg.Is(specificationId),
//                    Arg.Is(calculationId),
//                    Arg.Is<CalculationEditModel>(
//                        m => 
//                        //m.AllocationLineId == viewModel.AllocationLineId &&
//                        m.Description == viewModel.Description &&
//                        m.Name == viewModel.Name
//                    ));
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnPostAsync_WhenInvalidCalculationDetailsProvided_ThenCalculationPageIsReturnedWithModelStateErrors()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            EditCalculationViewModel viewModel = new EditCalculationViewModel()
//            {
//                Name = null,
//                AllocationLineId = "al2",
//                CalculationType = "Number",
//                Description = "Updated description"
//            };

//            Calculation resultCalculation = new Calculation()
//            {
//                Id = calculationId,
//                Name = "Calculation Name",
//                AllocationLine = new Reference("al1", "Allocation Line"),
//                CalculationType = CalculationSpecificationType.Funding,
//                Description = "Calculation Description"
//            };

//            FundingStream fundingStream1 = new FundingStream()
//            {
//                Id = "fsId",
//                Name = "Funding Stream 1",
//                AllocationLines = new List<AllocationLine>()
//                {
//                    new AllocationLine("al1", "Funding Stream - Allocation Line 1"),
//                    new AllocationLine("al2", "Funding Stream - Allocation Line 2"),
//                }
//            };

//            FundingStream fundingStream2 = new FundingStream()
//            {
//                Id = "fs2Id",
//                Name = "Funding Stream 2",
//                AllocationLines = new List<AllocationLine>()
//                        {
//                            new AllocationLine("al3", "Funding Stream 2 - Allocation Line 1"),
//                            new AllocationLine("al4", "Funding Stream 2 - Allocation Line 2"),
//                        }
//            };

//            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            IPoliciesApiClient policiesClient = CreatePoliciesClient();

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fsId"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream1));

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fs2Id"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream2));

//            calcsClient
//                .GetCalculationById(calculationId)
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, resultCalculation));

//            calcsClient
//                .EditCalculation(Arg.Is(specificationId), Arg.Is(calculationId), Arg.Any<CalculationEditModel>())
//                .Returns(new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, resultCalculation));

//            SpecificationSummary specification = CreateSpecification(specificationId);

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

//            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResponse = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

//            specsClient
//                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
//                .Returns(baselineCalculationsResponse);

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, calcsClient: calcsClient, policiesClient: policiesClient);

//            pageModel.PageContext = new PageContext();

//            pageModel.EditCalculationViewModel = viewModel;

//            pageModel.ModelState.AddModelError(nameof(EditCalculationViewModel.Name), "Invalid Name");

//            // Act
//            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<PageResult>()
//                .Which
//                .Should()
//                .NotBeNull();

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            pageModel
//               .EditCalculationViewModel
//               .Should()
//               .BeEquivalentTo<EditCalculationViewModel>(new EditCalculationViewModel()
//               {

//                   AllocationLineId = "al2",
//                   CalculationType = "Number",
//                   Description = "Updated description",
//                   Name = null,
//               });

//            pageModel
//                .Specification
//                .Should()
//                .BeEquivalentTo(new SpecificationViewModel()
//                {
//                    Id = specificationId,
//                    Name = "Specification Name",
//                    FundingStreams = new List<ReferenceViewModel>()
//                    {
//                        new ReferenceViewModel("fsId", "Funding Stream 1"),
//                        new ReferenceViewModel("fs2Id", "Funding Stream 2"),
//                    },
//                });

//            pageModel
//                .AllocationLines
//                .Should()
//                .BeEquivalentTo(new List<SelectListItem>()
//                {
//                    new SelectListItem()
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream - Allocation Line 1",
//                        Value = "al1",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = true,
//                        Text = "Funding Stream - Allocation Line 2",
//                        Value = "al2",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream 2 - Allocation Line 1",
//                        Value = "al3",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream 2 - Allocation Line 2",
//                        Value = "al4",
//                    }
//                });

//            pageModel
//                .ModelState
//                .IsValid
//                .Should()
//                .BeFalse();

//            pageModel
//                .ModelState
//                .Should()
//                .HaveCount(1);

//            pageModel
//                .IsAuthorizedToEdit
//                .Should().BeTrue();
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnPostAsync_WhenInvalidCalculationDetailsProvidedAndValidationMessagesComeFromApi_ThenCalculationPageIsReturnedWithModelStateErrors()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            EditCalculationViewModel viewModel = new EditCalculationViewModel()
//            {
//                Name = null,
//                AllocationLineId = "al2",
//                CalculationType = "Number",
//                Description = "Updated description"
//            };

//            Calculation resultCalculation = new Calculation()
//            {
//                Id = calculationId,
//                Name = "Calculation Name",
//                AllocationLine = new Reference("al1", "Allocation Line"),
//                CalculationType = CalculationSpecificationType.Funding,
//                Description = "Calculation Description"
//            };

//            FundingStream fundingStream1 = new FundingStream()
//            {
//                Id = "fsId",
//                Name = "Funding Stream 1",
//                AllocationLines = new List<AllocationLine>()
//                {
//                    new AllocationLine("al1", "Funding Stream - Allocation Line 1"),
//                    new AllocationLine("al2", "Funding Stream - Allocation Line 2"),
//                }
//            };

//            FundingStream fundingStream2 = new FundingStream()
//            {
//                Id = "fs2Id",
//                Name = "Funding Stream 2",
//                AllocationLines = new List<AllocationLine>()
//                        {
//                            new AllocationLine("al3", "Funding Stream 2 - Allocation Line 1"),
//                            new AllocationLine("al4", "Funding Stream 2 - Allocation Line 2"),
//                        }
//            };

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();
//            IPoliciesApiClient policiesClient = CreatePoliciesClient();

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fsId"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream1));

//            policiesClient
//                .GetFundingStreamById(Arg.Is("fs2Id"))
//                .Returns(new ApiResponse<FundingStream>(HttpStatusCode.OK, fundingStream2));

//            ValidatedApiResponse<Calculation> validatedResponse = new ValidatedApiResponse<Calculation>(HttpStatusCode.BadRequest, resultCalculation)
//            {
//                ModelState = new Dictionary<string, IEnumerable<string>>()
//                {
//                    { "name", new string[] { "Name was not provided" } }
//                }
//            };

//            calcsClient
//                .EditCalculation(Arg.Is(specificationId), Arg.Is(calculationId), Arg.Any<CalculationEditModel>())
//                .Returns(validatedResponse);

//            SpecificationSummary specification = CreateSpecification(specificationId);

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, calcsClient: calcsClient, policiesClient: policiesClient);

//            pageModel.PageContext = new PageContext();

//            pageModel.EditCalculationViewModel = viewModel;

//            // Act
//            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<PageResult>()
//                .Which
//                .Should()
//                .NotBeNull();

//            await specsClient
//                .Received(1)
//                .GetSpecificationSummaryById(Arg.Is(specificationId));

//            pageModel
//               .EditCalculationViewModel
//               .Should()
//               .BeEquivalentTo<EditCalculationViewModel>(new EditCalculationViewModel()
//               {

//                   AllocationLineId = "al2",
//                   CalculationType = "Number",
//                   Description = "Updated description",
//                   Name = null,
//               });

//            pageModel
//                .Specification
//                .Should()
//                .BeEquivalentTo(new SpecificationViewModel()
//                {
//                    Id = specificationId,
//                    Name = "Specification Name",
//                    FundingStreams = new List<ReferenceViewModel>()
//                    {
//                        new ReferenceViewModel("fsId", "Funding Stream 1"),
//                        new ReferenceViewModel("fs2Id", "Funding Stream 2"),
//                    },
//                });

//            pageModel
//                .AllocationLines
//                .Should()
//                .BeEquivalentTo(new List<SelectListItem>()
//                {
//                    new SelectListItem()
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream - Allocation Line 1",
//                        Value = "al1",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = true,
//                        Text = "Funding Stream - Allocation Line 2",
//                        Value = "al2",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream 2 - Allocation Line 1",
//                        Value = "al3",
//                    },
//                    new SelectListItem
//                    {
//                        Disabled = false,
//                        Selected = false,
//                        Text = "Funding Stream 2 - Allocation Line 2",
//                        Value = "al4",
//                    }
//                });

//            pageModel
//                .ModelState
//                .IsValid
//                .Should()
//                .BeFalse();

//            pageModel
//                .ModelState
//                .Should()
//                .HaveCount(1);

//            pageModel
//                .ModelState
//                .Values
//                .First()
//                .Errors
//                .First()
//                .ErrorMessage
//                .Should()
//                .Be("Name was not provided");

//            pageModel
//                .IsAuthorizedToEdit
//                .Should().BeTrue();
//        }

//        [TestMethod]
//        public async Task EditCalculationPageModel_OnPostAsync_WhenUserDoesNotHaveEditSpecificationPermission_ThenForbidResultReturned()
//        {
//            // Arrange
//            const string specificationId = "spec1";
//            const string calculationId = "calculationId";

//            Calculation calculation = new Calculation()
//            {
//                Id = calculationId,
//                Name = "Calculation Name",
//                AllocationLine = new Reference("al1", "Allocation Line"),
//                CalculationType = CalculationSpecificationType.Funding,
//                Description = "Calculation Description",
//            };

//            SpecificationSummary specification = CreateSpecification(specificationId);

//            ISpecificationsApiClient specsClient = CreateSpecsClient();
//            ICalculationsApiClient calcsClient = CreateCalcsClient();

//            calcsClient
//                .GetCalculationById(Arg.Is(calculationId))
//                .Returns(new ApiResponse<Calculation>(HttpStatusCode.OK, calculation));

//            specsClient
//                .GetSpecificationSummaryById(Arg.Is(specificationId))
//                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

//            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
//            authorizationHelper
//                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
//                .Returns(false);

//            EditCalculationPageModel pageModel = CreatePageModel(specsClient, authorizationHelper: authorizationHelper, calcsClient: calcsClient);

//            // Act
//            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

//            // Assert
//            result
//                .Should()
//                .BeOfType<ForbidResult>();

//            pageModel
//                .IsAuthorizedToEdit
//                .Should().BeFalse();
//        }

//        public static EditCalculationPageModel CreatePageModel(
//            ISpecificationsApiClient specsClient = null,
//            ILogger logger = null,
//            IMapper mapper = null,
//            IAuthorizationHelper authorizationHelper = null,
//            ICalculationsApiClient calcsClient = null,
//            IPoliciesApiClient policiesClient = null)
//        {
//            EditCalculationPageModel pageModel = new EditCalculationPageModel(
//                specsClient ?? CreateSpecsClient(),
//                logger ?? CreateLogger(),
//                mapper ?? MappingHelper.CreateFrontEndMapper(),
//                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditSpecification),
//                calcsClient ?? CreateCalcsClient(),
//                policiesClient ?? CreatePoliciesClient());

//            pageModel.PageContext = TestAuthHelper.CreatePageContext();
//            return pageModel;
//        }

//        private static ISpecificationsApiClient CreateSpecsClient()
//        {
//            return Substitute.For<ISpecificationsApiClient>();
//        }

//        private static ICalculationsApiClient CreateCalcsClient()
//        {
//            return Substitute.For<ICalculationsApiClient>();
//        }

//        private static IPoliciesApiClient CreatePoliciesClient()
//        {
//            return Substitute.For<IPoliciesApiClient>();
//        }

//        private static ILogger CreateLogger()
//        {
//            return Substitute.For<ILogger>();
//        }

//    }
//}
