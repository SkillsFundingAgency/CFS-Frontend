using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Serilog;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Specs
{
    [TestClass]
    public class EditCalculationPageModelTests
    {
        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationFound_ThenEditFormIsDisplayed()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            CalculationCurrentVersion calculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Calculation Name",
                AllocationLine = new Reference("al1", "Allocation Line"),
                CalculationType = CalculationSpecificationType.Funding,
                Description = "Calculation Description",
                IsPublic = false,
                PolicyId = "policyId",
                PolicyName = "Policy Name"
            };

            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();
            baselineCalculations.Add(new CalculationCurrentVersion()
            {
                AllocationLine = new Reference("AL1", "Allocation Line 1"),
            });

            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResponse = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

            Specification specification = CreateSpecification(specificationId);

            ISpecsApiClient specsClient = CreateSpecsClient();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, calculation));

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(baselineCalculationsResponse);

            EditCalculationPageModel pageModel = CreatePageModel(specsClient);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            pageModel
                .EditCalculationViewModel
                .Should()
                .BeEquivalentTo<EditCalculationViewModel>(new EditCalculationViewModel()
                {

                    Name = "Calculation Name",
                    AllocationLineId = "al1",
                    CalculationType = "Funding",
                    Description = "Calculation Description",
                    IsPublic = false,
                    PolicyId = "policyId",
                });

            pageModel
                .Specification
                .Should()
                .BeEquivalentTo(new SpecificationViewModel()
                {
                    Id = specificationId,
                    Name = "Specification Name",
                    FundingStreams = new List<ReferenceViewModel>()
                    {
                        new ReferenceViewModel("fsId", "Funding Stream 1"),
                        new ReferenceViewModel("fs2Id", "Funding Stream 2"),
                    },
                });

            pageModel
                .Policies
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 1",
                        Value = "p1",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 1",
                        Value = "sub1",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 2",
                        Value = "sub2",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 2",
                        Value = "p2",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 3",
                        Value = "p3",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 3",
                        Value = "sub3",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 4",
                        Value = "p4",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    }
                });

            pageModel
                .AllocationLines
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = true,
                        Text = "Funding Stream - Allocation Line 1",
                        Value = "al1",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream - Allocation Line 2",
                        Value = "al2",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream 2 - Allocation Line 1",
                        Value = "al3",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream 2 - Allocation Line 2",
                        Value = "al4",
                    }
                });

            pageModel
                .HideAllocationLinesForBaselinesJson
                .Should()
                .Be("[\"AL1\"]");

            pageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();
        }

        private static Specification CreateSpecification(string specificationId)
        {
            return new Specification()
            {
                Id = specificationId,
                Name = "Specification Name",
                FundingStreams = new List<FundingStream>()
                 {
                    new FundingStream()
                    {
                        Id="fsId",
                        Name= "Funding Stream 1",
                        AllocationLines = new List<AllocationLine>()
                        {
                            new AllocationLine("al1", "Funding Stream - Allocation Line 1"),
                            new AllocationLine("al2", "Funding Stream - Allocation Line 2"),
                        }
                    },
                    new FundingStream()
                    {
                        Id="fs2Id",
                        Name= "Funding Stream 2",
                        AllocationLines = new List<AllocationLine>()
                        {
                            new AllocationLine("al3", "Funding Stream 2 - Allocation Line 1"),
                            new AllocationLine("al4", "Funding Stream 2 - Allocation Line 2"),
                        }
                    }
                 },
                Policies = new List<Policy>()
                 {
                     new Policy()
                     {
                         Id = "p1",
                         Name = "Policy 1",
                         SubPolicies = new List<Policy>()
                         {
                            new Policy()
                            {
                                Id = "sub1",
                                Name= "Sub Policy 1",
                            },
                            new Policy()
                            {
                                Id = "sub2",
                                Name = "Sub Policy 2",
                            },
                         }
                     },
                     new Policy()
                     {
                         Id = "p2",
                         Name= "Policy 2",
                     },
                     new Policy()
                     {
                         Id = "p3",
                         Name = "Policy 3",
                         SubPolicies = new List<Policy>()
                         {
                            new Policy()
                            {
                                Id = "sub3",
                                Name= "Sub Policy 3",
                            },
                         }
                     },
                     new Policy()
                     {
                         Id = "p4",
                         Name= "Policy 4",
                     },
                 }
            };
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationNotFound_ThenNotFoundIsReturned()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            ISpecsApiClient specsClient = CreateSpecsClient();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.NotFound, null));

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<NotFoundObjectResult>()
                .Which
                .Value
                .Should()
                .Be("Calculation not found");

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            await specsClient
                .Received(1)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationApiResponseIsNull_ThenInternalErrorIsReturned()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            ISpecsApiClient specsClient = CreateSpecsClient();
            ILogger logger = CreateLogger();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns((ApiResponse<CalculationCurrentVersion>)null);

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Calculation Result API response returned null");

            logger
                .Received(1)
                .Error("Calculation Result API response returned null for calculation ID '{calculationId}' on specificationId '{specificationId}'", calculationId, specificationId);

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            await specsClient
                .Received(1)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationApiResponseIsNotSuccessful_ThenInternalErrorIsReturned()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            ISpecsApiClient specsClient = CreateSpecsClient();
            ILogger logger = CreateLogger();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.InternalServerError, null));

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Unexpected status code from Calculation API call 'InternalServerError'");

            logger
                .Received(1)
                .Warning($"Unexpected status code from Calculation API call 'InternalServerError'");

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            await specsClient
                .Received(1)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenCalculationApiResponseContentIsNull_ThenInternalErrorIsReturned()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            ISpecsApiClient specsClient = CreateSpecsClient();
            ILogger logger = CreateLogger();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, null));

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification()));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Calculation content returned null");

            logger
                .Received(1)
                .Warning("Calculation Result API response content returned null for calculation ID '{calculationId}' on specificationId '{specificationId}'", calculationId, specificationId);

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            await specsClient
                .Received(1)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenSpecificationNotFound_ThenPreconditionFailedReturned()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            ISpecsApiClient specsClient = CreateSpecsClient();
            ILogger logger = CreateLogger();

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.NotFound, new Specification()));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient, logger);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<PreconditionFailedResult>()
                .Which
                .Value
                .Should()
                .Be("Specification not found");

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            await specsClient
                .Received(0)
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId));
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnGetAsync_WhenUserDoesNotHaveEditSpecificationPermission_ThenReturnOkWithAuthorizedToEditFlagSetToFalse()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            CalculationCurrentVersion calculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Calculation Name",
                AllocationLine = new Reference("al1", "Allocation Line"),
                CalculationType = CalculationSpecificationType.Funding,
                Description = "Calculation Description",
                IsPublic = false,
                PolicyId = "policyId",
                PolicyName = "Policy Name"
            };

            Specification specification = CreateSpecification(specificationId);

            ISpecsApiClient specsClient = CreateSpecsClient();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, calculation));

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            List<FundingStream> fundingStreams = new List<FundingStream>();
            fundingStreams.Add(new FundingStream
            {
                Id = "fs1",
                AllocationLines = new List<AllocationLine>()
                {
                    new AllocationLine()
                    {
                        Id = "al1",
                        Name = "Allocation Line 1",
                    }
                }
            });

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specification.Id))
                .Returns(new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, Enumerable.Empty<CalculationCurrentVersion>()));

            ApiResponse<IEnumerable<FundingStream>> fundingStreamResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);
            specsClient
                .GetFundingStreamsForSpecification(Arg.Is(specification.Id))
                .Returns(fundingStreamResponse);


            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            EditCalculationPageModel pageModel = CreatePageModel(specsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            pageModel
                .IsAuthorizedToEdit
                .Should()
                .BeFalse();
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnPostAsync_WhenValidCalculationDetailsProvided_ThenCalculationIsEdited()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            EditCalculationViewModel viewModel = new EditCalculationViewModel()
            {
                Name = "Updated Name",
                AllocationLineId = "al2",
                CalculationType = "Number",
                Description = "Updated description",
                IsPublic = true,
                PolicyId = "pol2",
            };

            Calculation resultCalculation = new Calculation()
            {
                Id = calculationId,
                Name = "Calculation Name",
                AllocationLine = new Reference("al1", "Allocation Line"),
                CalculationType = CalculationSpecificationType.Funding,
                Description = "Calculation Description",
                IsPublic = false,
            };

            ISpecsApiClient specsClient = CreateSpecsClient();

            specsClient
                .UpdateCalculation(Arg.Is(specificationId), Arg.Is(calculationId), Arg.Any<CalculationUpdateModel>())
                .Returns(new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, resultCalculation));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient);

            pageModel.PageContext = new PageContext();

            pageModel.EditCalculationViewModel = viewModel;

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<RedirectResult>()
                .Which
                .Url
                .Should()
                .Be($"/specs/policies/{specificationId}?operationId={calculationId}&operationType=CalculationUpdated");

            await specsClient
                .Received(1)
                .UpdateCalculation(
                    Arg.Is(specificationId),
                    Arg.Is(calculationId),
                    Arg.Is<CalculationUpdateModel>(
                        m => m.AllocationLineId == viewModel.AllocationLineId &&
                        m.Description == viewModel.Description &&
                        m.IsPublic == viewModel.IsPublic &&
                        m.Name == viewModel.Name &&
                        m.PolicyId == viewModel.PolicyId
                    ));
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnPostAsync_WhenInvalidCalculationDetailsProvided_ThenCalculationPageIsReturnedWithModelStateErrors()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            EditCalculationViewModel viewModel = new EditCalculationViewModel()
            {
                Name = null,
                AllocationLineId = "al2",
                CalculationType = "Number",
                Description = "Updated description",
                IsPublic = true,
                PolicyId = "pol2",
            };

            Calculation resultCalculation = new Calculation()
            {
                Id = calculationId,
                Name = "Calculation Name",
                AllocationLine = new Reference("al1", "Allocation Line"),
                CalculationType = CalculationSpecificationType.Funding,
                Description = "Calculation Description",
                IsPublic = false,
            };

            List<CalculationCurrentVersion> baselineCalculations = new List<CalculationCurrentVersion>();

            ISpecsApiClient specsClient = CreateSpecsClient();

            specsClient
                .UpdateCalculation(Arg.Is(specificationId), Arg.Is(calculationId), Arg.Any<CalculationUpdateModel>())
                .Returns(new ValidatedApiResponse<Calculation>(HttpStatusCode.OK, resultCalculation));

            Specification specification = CreateSpecification(specificationId);

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            ApiResponse<IEnumerable<CalculationCurrentVersion>> baselineCalculationsResponse = new ApiResponse<IEnumerable<CalculationCurrentVersion>>(HttpStatusCode.OK, baselineCalculations);

            specsClient
                .GetBaselineCalculationsBySpecificationId(Arg.Is(specificationId))
                .Returns(baselineCalculationsResponse);

            EditCalculationPageModel pageModel = CreatePageModel(specsClient);

            pageModel.PageContext = new PageContext();

            pageModel.EditCalculationViewModel = viewModel;

            pageModel.ModelState.AddModelError(nameof(EditCalculationViewModel.Name), "Invalid Name");

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            pageModel
               .EditCalculationViewModel
               .Should()
               .BeEquivalentTo<EditCalculationViewModel>(new EditCalculationViewModel()
               {

                   AllocationLineId = "al2",
                   CalculationType = "Number",
                   Description = "Updated description",
                   IsPublic = true,
                   PolicyId = "pol2",
                   Name = null,
               });

            pageModel
                .Specification
                .Should()
                .BeEquivalentTo(new SpecificationViewModel()
                {
                    Id = specificationId,
                    Name = "Specification Name",
                    FundingStreams = new List<ReferenceViewModel>()
                    {
                        new ReferenceViewModel("fsId", "Funding Stream 1"),
                        new ReferenceViewModel("fs2Id", "Funding Stream 2"),
                    },
                });

            pageModel
                .Policies
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 1",
                        Value = "p1",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 1",
                        Value = "sub1",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 2",
                        Value = "sub2",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 2",
                        Value = "p2",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 3",
                        Value = "p3",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 3",
                        Value = "sub3",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 4",
                        Value = "p4",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    }
                });

            pageModel
                .AllocationLines
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream - Allocation Line 1",
                        Value = "al1",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = true,
                        Text = "Funding Stream - Allocation Line 2",
                        Value = "al2",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream 2 - Allocation Line 1",
                        Value = "al3",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream 2 - Allocation Line 2",
                        Value = "al4",
                    }
                });

            pageModel
                .ModelState
                .IsValid
                .Should()
                .BeFalse();

            pageModel
                .ModelState
                .Should()
                .HaveCount(1);

            pageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnPostAsync_WhenInvalidCalculationDetailsProvidedAndValidationMessagesComeFromApi_ThenCalculationPageIsReturnedWithModelStateErrors()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            EditCalculationViewModel viewModel = new EditCalculationViewModel()
            {
                Name = null,
                AllocationLineId = "al2",
                CalculationType = "Number",
                Description = "Updated description",
                IsPublic = true,
                PolicyId = "pol2",
            };

            Calculation resultCalculation = new Calculation()
            {
                Id = calculationId,
                Name = "Calculation Name",
                AllocationLine = new Reference("al1", "Allocation Line"),
                CalculationType = CalculationSpecificationType.Funding,
                Description = "Calculation Description",
                IsPublic = false,
            };

            ISpecsApiClient specsClient = CreateSpecsClient();

            ValidatedApiResponse<Calculation> validatedResponse = new ValidatedApiResponse<Calculation>(HttpStatusCode.BadRequest, resultCalculation)
            {
                ModelState = new Dictionary<string, IEnumerable<string>>()
                {
                    { "name", new string[] { "Name was not provided" } }
                }
            };

            specsClient
                .UpdateCalculation(Arg.Is(specificationId), Arg.Is(calculationId), Arg.Any<CalculationUpdateModel>())
                .Returns(validatedResponse);

            Specification specification = CreateSpecification(specificationId);

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            EditCalculationPageModel pageModel = CreatePageModel(specsClient);

            pageModel.PageContext = new PageContext();

            pageModel.EditCalculationViewModel = viewModel;

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<PageResult>()
                .Which
                .Should()
                .NotBeNull();

            await specsClient
                .Received(1)
                .GetSpecification(Arg.Is(specificationId));

            pageModel
               .EditCalculationViewModel
               .Should()
               .BeEquivalentTo<EditCalculationViewModel>(new EditCalculationViewModel()
               {

                   AllocationLineId = "al2",
                   CalculationType = "Number",
                   Description = "Updated description",
                   IsPublic = true,
                   PolicyId = "pol2",
                   Name = null,
               });

            pageModel
                .Specification
                .Should()
                .BeEquivalentTo(new SpecificationViewModel()
                {
                    Id = specificationId,
                    Name = "Specification Name",
                    FundingStreams = new List<ReferenceViewModel>()
                    {
                        new ReferenceViewModel("fsId", "Funding Stream 1"),
                        new ReferenceViewModel("fs2Id", "Funding Stream 2"),
                    },
                });

            pageModel
                .Policies
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 1",
                        Value = "p1",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 1",
                        Value = "sub1",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 2",
                        Value = "sub2",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 2",
                        Value = "p2",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 3",
                        Value = "p3",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Sub Policy 3",
                        Value = "sub3",
                        Group = new SelectListGroup()
                        {
                             Name = "Subpolicies",
                             Disabled = false,
                        },
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Policy 4",
                        Value = "p4",
                        Group = new SelectListGroup()
                        {
                             Name = "Policies",
                             Disabled = false,
                        },
                    }
                });

            pageModel
                .AllocationLines
                .Should()
                .BeEquivalentTo(new List<SelectListItem>()
                {
                    new SelectListItem()
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream - Allocation Line 1",
                        Value = "al1",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = true,
                        Text = "Funding Stream - Allocation Line 2",
                        Value = "al2",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream 2 - Allocation Line 1",
                        Value = "al3",
                    },
                    new SelectListItem
                    {
                        Disabled = false,
                        Selected = false,
                        Text = "Funding Stream 2 - Allocation Line 2",
                        Value = "al4",
                    }
                });

            pageModel
                .ModelState
                .IsValid
                .Should()
                .BeFalse();

            pageModel
                .ModelState
                .Should()
                .HaveCount(1);

            pageModel
                .ModelState
                .Values
                .First()
                .Errors
                .First()
                .ErrorMessage
                .Should()
                .Be("Name was not provided");

            pageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task EditCalculationPageModel_OnPostAsync_WhenUserDoesNotHaveEditSpecificationPermission_ThenForbidResultReturned()
        {
            // Arrange
            const string specificationId = "spec1";
            const string calculationId = "calculationId";

            CalculationCurrentVersion calculation = new CalculationCurrentVersion()
            {
                Id = calculationId,
                Name = "Calculation Name",
                AllocationLine = new Reference("al1", "Allocation Line"),
                CalculationType = CalculationSpecificationType.Funding,
                Description = "Calculation Description",
                IsPublic = false,
                PolicyId = "policyId",
                PolicyName = "Policy Name"
            };

            Specification specification = CreateSpecification(specificationId);

            ISpecsApiClient specsClient = CreateSpecsClient();

            specsClient
                .GetCalculationById(Arg.Is(specificationId), Arg.Is(calculationId))
                .Returns(new ApiResponse<CalculationCurrentVersion>(HttpStatusCode.OK, calculation));

            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            EditCalculationPageModel pageModel = CreatePageModel(specsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId, calculationId);

            // Assert
            result
                .Should()
                .BeOfType<ForbidResult>();

            pageModel
                .IsAuthorizedToEdit
                .Should().BeFalse();
        }

        public static EditCalculationPageModel CreatePageModel(
            ISpecsApiClient specsClient = null,
            ILogger logger = null,
            IMapper mapper = null,
            IAuthorizationHelper authorizationHelper = null)
        {
            EditCalculationPageModel pageModel = new EditCalculationPageModel(
                specsClient ?? CreateSpecsClient(),
                logger ?? CreateLogger(),
                mapper ?? MappingHelper.CreateFrontEndMapper(),
                authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();
            return pageModel;
        }

        private static ISpecsApiClient CreateSpecsClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static ILogger CreateLogger()
        {
            return Substitute.For<ILogger>();
        }

    }
}
