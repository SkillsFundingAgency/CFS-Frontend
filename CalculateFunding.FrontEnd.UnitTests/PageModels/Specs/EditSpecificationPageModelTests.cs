using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.ApiClient.Models;
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

namespace CalculateFunding.Frontend.UnitTests.PageModels.Specs
{
    [TestClass]
    public class EditSpecificationPageModelTests
    {
        private const string specificationId = "spec-id";
        private const string specName = "spec name";

        [TestMethod]
        public void OnGetAsync_GivenNullOrEmptySpecificationId_ThrowsArgumentException()
        {
            //Arrange
            EditSpecificationPageModel pageModel = CreatePageModel();

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync("");

            test
                .Should()
                .ThrowExactly<ArgumentNullException>()
                .Which
                .Message
                .Should()
                .Be("Value cannot be null.\r\nParameter name: specificationId");
        }

        [TestMethod]
        public void OnGetAsync_GivenSpecificationIdButResponseIsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.BadRequest);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>()
                .Which
                .Message
                .Should()
                .Be($"Unable to retreive specification. Status Code = {specificationResponse.StatusCode}");
        }

        [TestMethod]
        public void OnGetAsync_GivenSpecificationIdWithOKResponseButContentIsNull_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>()
                .Which
                .Message
                .Should()
                .Be("Unable to retreive specification. Status Code = OK");
        }

        [TestMethod]
        public void OnGetAsync_GivenNullFundingPeriodsReturns_ThrowsInvalidOperationException()
        {
            //Arrange
            Specification specification = new Specification();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = null;

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            Specification specification = new Specification();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.BadRequest);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            Specification specification = new Specification();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenNullFundingStreamsReturnsReturned_ThrowsInvalidOperationException()
        {
            //Arrange
            Specification specification = new Specification();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = null;

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsIsOKButFundingStreamsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            Specification specification = new Specification();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.BadRequest);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsIsOKButFundingStreamsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            Specification specification = new Specification();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenPagePopulates_ReturnsPage()
        {
            //Arrange
            Specification specification = new Specification
            {
                Id = specificationId,
                Name = specName
            };

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper, authorizationHelper);

            //Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            pageModel
               .FundingPeriods
               .Count()
               .Should()
               .Be(1);

            viewModel
                .OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenPagePopulatesAndPeriodIdProvided_ReturnsPageSetsPeriodInSelectAsDefault()
        {
            //Arrange
            Specification specification = new Specification
            {
                Id = specificationId,
                Name = specName
            };

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "Funding Period 1" },
                new Reference { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModel);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper, authorizationHelper);

            //Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            pageModel
               .FundingPeriods
               .Count()
               .Should()
               .Be(2);

            viewModel
                .OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenUserDoesNotHaveEditSpecificationPermission_ThenForbidResultReturned()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification { Id = specificationId }));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnGetAsync(specificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task OnGetAsync_WhenUserDoesNotHaveCreateSpecPermissionOnExistingFundingStream_ThenExistingFundingStreamsAvailableForList()
        {
            // Arrange
            Specification specification = new Specification
            {
                Id = specificationId,
                Name = "Test Spec",
                FundingStreams = new List<FundingStream>
                {
                    new FundingStream { Id = "fs1", Name = "FS One" },
                    new FundingStream { Id = "fs2", Name = "FS Two" }
                },
                FundingPeriod = new Reference { Id = "fp1", Name = "FP One" }
            };

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "Funding Period 1" },
                new Reference { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fs1", Name = "FS One" },
                new FundingStream { Id = "fs2", Name = "FS Two" }
            };

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            specsClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            specsClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<FundingStream>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(Enumerable.Empty<FundingStream>());

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: authorizationHelper, mapper: MappingHelper.CreateFrontEndMapper());

            // Act
            await pageModel.OnGetAsync(specificationId);

            // Assert
            pageModel.FundingStreams.Should().HaveCount(2);
        }

        [TestMethod]
        public async Task OnGetAsync_WhenUserDoesNotHaveCreateSpecPermissionOnAllExistingFundingStream_ThenExistingFundingStreamsAvailableForList()
        {
            // Arrange
            Specification specification = new Specification
            {
                Id = specificationId,
                Name = "Test Spec",
                FundingStreams = new List<FundingStream>
                {
                    new FundingStream { Id = "fs1", Name = "FS One" },
                    new FundingStream { Id = "fs2", Name = "FS Two" }
                },
                FundingPeriod = new Reference { Id = "fp1", Name = "FP One" }
            };

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "Funding Period 1" },
                new Reference { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fs1", Name = "FS One" },
                new FundingStream { Id = "fs2", Name = "FS Two" }
            };

            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            specsClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods));

            specsClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<FundingStream>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(new List<FundingStream>
                {
                    new FundingStream { Id = "fs1", Name = "FS One" }
                });

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: authorizationHelper, mapper: MappingHelper.CreateFrontEndMapper());

            // Act
            await pageModel.OnGetAsync(specificationId);

            // Assert
            pageModel.FundingStreams.Should().HaveCount(2);
        }

        [TestMethod]
        public void OnPostAsync_GivenNameAlreadyExistsAndPopulateFundingPeriodsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.BadRequest);

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.PageContext = new PageContext();

            pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName
            };

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnPostAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnPostAsync_GivenNameAlreadyExistsAndPopulateFundingPeriodsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK);

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.PageContext = new PageContext();

            pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName
            };

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnPostAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnPostAsync_GivenNameAlreadyExistsPopulateFundingPeriodsIsOKButFundingStreamsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.BadRequest);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName
            };

            pageModel.PageContext = new PageContext();

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnPostAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenPagePopulatesButModelStateIsInvalid_ReturnsPage()
        {
            //Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fs1", Name = "funding stream" }
            };

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: apiClient, authorizationHelper: authorizationHelper);

            pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName,
                FundingStreamIds = new List<string> { "fs1"}
            };

            pageModel.PageContext = new PageContext();

            //Act
            IActionResult result = await pageModel.OnPostAsync();

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            pageModel
               .FundingPeriods
               .Count()
               .Should()
               .Be(1);
        }

        [TestMethod]
        public async Task OnPostAsync_GivenViewModelIsValidAndNoRedirectActionProvided_ThenSpecificationIsEditedAndReturnsRedirectToManagePolicies()
        {
            //Arrange
            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.NotFound);

            EditSpecificationModel editModel = new EditSpecificationModel();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .UpdateSpecification(Arg.Is(specificationId), Arg.Any<EditSpecificationModel>())
                .Returns(HttpStatusCode.OK);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationModel>(Arg.Is(viewModel))
                .Returns(editModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            pageModel.EditSpecificationViewModel = viewModel;

            pageModel.PageContext = new PageContext();

            //Act
            IActionResult result = await pageModel.OnPostAsync(specificationId);

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be($"/specs/policies/{specificationId}?operationType=SpecificationUpdated&operationId=spec-id");

            await
                apiClient
                    .Received(1)
                    .UpdateSpecification(Arg.Is(specificationId), Arg.Is(editModel));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenViewModelIsValidAndRedirectToSpecificationsActionProvided_ThenSpecificationIsEditedAndReturnsRedirectToSpecificationsPage()
        {
            //Arrange
            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.NotFound);

            EditSpecificationModel editModel = new EditSpecificationModel();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .UpdateSpecification(Arg.Is(specificationId), Arg.Any<EditSpecificationModel>())
                .Returns(HttpStatusCode.OK);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationModel>(Arg.Is(viewModel))
                .Returns(editModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            pageModel.EditSpecificationViewModel = viewModel;

            pageModel.PageContext = new PageContext();

            //Act
            IActionResult result = await pageModel.OnPostAsync(specificationId, EditSpecificationRedirectAction.Specifications);

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be("/specs?operationType=SpecificationUpdated&operationId=spec-id");

            await
                apiClient
                    .Received(1)
                    .UpdateSpecification(Arg.Is(specificationId), Arg.Is(editModel));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenViewModelIsValidAndUpdateSpecificationCallFails_ThenInternalServerErrorReturned()
        {
            // Arrange
            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.NotFound);

            EditSpecificationModel editModel = new EditSpecificationModel();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .UpdateSpecification(Arg.Is(specificationId), Arg.Any<EditSpecificationModel>())
                .Returns(HttpStatusCode.InternalServerError);

            IMapper mapper = CreateMapper();
            mapper
                .Map<EditSpecificationModel>(Arg.Is(viewModel))
                .Returns(editModel);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            pageModel.EditSpecificationViewModel = viewModel;

            pageModel.PageContext = new PageContext();

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId, EditSpecificationRedirectAction.Specifications);

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Unable to update specification. API returned 'InternalServerError'");

            await
                apiClient
                    .Received(1)
                    .UpdateSpecification(Arg.Is(specificationId), Arg.Is(editModel));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenUserDoesNotHaveEditSpecificationPermission_ThenForbidResultReturned()
        {
            // Arrange
            ISpecsApiClient specsClient = Substitute.For<ISpecsApiClient>();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, new Specification { Id = specificationId }));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: specsClient, authorizationHelper: authorizationHelper);

            // Act
            IActionResult result = await pageModel.OnPostAsync(specificationId);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        private static EditSpecificationPageModel CreatePageModel(ISpecsApiClient specsClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            EditSpecificationPageModel pageModel = new EditSpecificationPageModel(specsClient ?? CreateApiClient(), mapper ?? CreateMapper(), authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            return pageModel;
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }

        private static EditSpecificationViewModel CreateEditSpecificationViewModel()
        {
            return new EditSpecificationViewModel
            {
                Id = specificationId,
                Name = specName,
                FundingPeriodId = "fp1",
                FundingStreamIds = new[] { "fs1, fs2" }
            };
        }
    }
}
