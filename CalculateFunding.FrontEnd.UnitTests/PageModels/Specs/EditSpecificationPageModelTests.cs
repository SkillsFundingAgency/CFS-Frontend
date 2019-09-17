using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
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
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

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
        [DataRow(HttpStatusCode.BadRequest)]
        [DataRow(HttpStatusCode.Conflict)]
        public async Task OnGetAsync_GivenSpecificationIdButResponseIsBadRequest_ReturnsError(HttpStatusCode responseCode)
        {
            //Arrange
            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(responseCode);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act
            var result = await pageModel.OnGetAsync(specificationId);

			//Assert
			result.Should().BeOfType(typeof(ObjectResult));

			ObjectResult typedResult = (ObjectResult)result;

			typedResult
				.StatusCode
				.Should()
				.Be((int)responseCode);

			typedResult
				.Value.ToString()
				.Should()
				.Be($"Unable to retreive specification. Status Code = {responseCode}");
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSpecificationIdWithOKResponseButContentIsNull_ReturnsNoContent()
        {
            //Arrange
            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act
            var result = await pageModel.OnGetAsync(specificationId);

			//Assert
            result
                .Should()
                .BeOfType(typeof(InternalServerErrorResult));
			
			((InternalServerErrorResult)result).Value.ToString()
				.Should()
				.Be($"Blank specification returned");
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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper : mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper : mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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

            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            policiesApiClient
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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, policiesApiClient, mapper: mapper, authorizationHelper: authorizationHelper);

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
                .IsAuthorizedToEdit
                .Should().BeTrue();

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

            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            ISpecsApiClient apiClient = CreateApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            apiClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            policiesApiClient
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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, policiesApiClient, mapper, authorizationHelper);

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
                .IsAuthorizedToEdit
                .Should().BeTrue();

            viewModel
                .OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenUserDoesNotHaveEditSpecificationPermission_ThenReturnPageResultWithAuthorizedToEditFlagSetToFalse()
        {
            // Arrange
            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fp1", Name = "funding" }
            };
            Specification specification = new Specification { Id = specificationId, Name = specName };

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams);
            ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, specification);

            EditSpecificationViewModel viewModelReturned = CreateEditSpecificationViewModel();

            ISpecsApiClient mockSpecsClient = CreateApiClient();
            IPoliciesApiClient mockPoliciesClient = CreatePoliciesApiClient();
            mockSpecsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(specificationResponse);

            mockPoliciesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IAuthorizationHelper mockAuthorizationHelper = Substitute.For<IAuthorizationHelper>();
            mockAuthorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);
            mockAuthorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            IMapper mockMapper = CreateMapper();
            mockMapper
                .Map<EditSpecificationViewModel>(Arg.Is(specification))
                .Returns(viewModelReturned);

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: mockSpecsClient, policiesApiClient: mockPoliciesClient, authorizationHelper: mockAuthorizationHelper, mapper: mockMapper);

            // Act
            IActionResult pageResult = await pageModel.OnGetAsync(specificationId);

            // Assert
            pageResult
                .Should()
                .BeOfType<PageResult>();

            pageModel
                .EditSpecificationViewModel
                .OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);

            pageModel
                .IsAuthorizedToEdit
                .Should().BeFalse();
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
                    new FundingStream { Id = "fs1", Name = "FS One" }
                },
                FundingPeriod = new Reference { Id = "fp1", Name = "FP One" }
            };

            IEnumerable<PolicyModels.FundingPeriod> fundingPeriods = new[]
            {
                new PolicyModels.FundingPeriod { Id = "fp1", Name = "Funding Period 1" },
                new PolicyModels.FundingPeriod { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fs1", Name = "FS One" },
                new PolicyModels.FundingStream { Id = "fs2", Name = "FS Two" }
            };

            ISpecsApiClient specsClient = CreateApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            policiesApiClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<PolicyModels.FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            policiesApiClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<PolicyModels.FundingStream>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(Enumerable.Empty<PolicyModels.FundingStream>());

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: specsClient, policiesApiClient: policiesApiClient, authorizationHelper: authorizationHelper, mapper: MappingHelper.CreateFrontEndMapper());

            // Act
            await pageModel.OnGetAsync(specificationId);

            // Assert
            pageModel.FundingStreams.Should().HaveCount(1);
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
                    new FundingStream { Id = "fs1", Name = "FS One" }
                },
                FundingPeriod = new Reference { Id = "fp1", Name = "FP One" }
            };

            IEnumerable<PolicyModels.FundingPeriod> fundingPeriods = new[]
            {
                new PolicyModels.FundingPeriod { Id = "fp1", Name = "Funding Period 1" },
                new PolicyModels.FundingPeriod { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fs1", Name = "FS One" },
                new PolicyModels.FundingStream { Id = "fs2", Name = "FS Two" }
            };

            ISpecsApiClient specsClient = CreateApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();
            specsClient
                .GetSpecification(Arg.Is(specificationId))
                .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

            policiesApiClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<PolicyModels.FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            policiesApiClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams));

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<PolicyModels.FundingStream>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(new List<PolicyModels.FundingStream>
                {
                    new PolicyModels.FundingStream { Id = "fs1", Name = "FS One" }
                });

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: specsClient, policiesApiClient: policiesApiClient, authorizationHelper: authorizationHelper, mapper: MappingHelper.CreateFrontEndMapper());

            // Act
            await pageModel.OnGetAsync(specificationId);

            // Assert
            pageModel.FundingStreams.Should().HaveCount(1);
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
            IEnumerable<PolicyModels.FundingStream> fundingStreams = new[]
            {
                new PolicyModels.FundingStream { Id = "fs1", Name = "funding stream" }
            };

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<PolicyModels.FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ISpecsApiClient apiClient = CreateApiClient();
            IPoliciesApiClient policiesApiClient = CreatePoliciesApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            policiesApiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            IAuthorizationHelper authorizationHelper = Substitute.For<IAuthorizationHelper>();
            authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<ISpecificationAuthorizationEntity>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            EditSpecificationPageModel pageModel = CreatePageModel(specsClient: apiClient, policiesApiClient: policiesApiClient, authorizationHelper: authorizationHelper);

            pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName,
                FundingStreamId = "fs1"
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
                .IsAuthorizedToEdit
                .Should().BeTrue();
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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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

            EditSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper: mapper);

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
            pageModel
                .IsAuthorizedToEdit
                .Should().BeFalse();

            result.Should().BeOfType<ForbidResult>();
        }

        private static EditSpecificationPageModel CreatePageModel(ISpecsApiClient specsClient = null, IPoliciesApiClient policiesApiClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            EditSpecificationPageModel pageModel = new EditSpecificationPageModel(specsClient ?? CreateApiClient(), policiesApiClient ?? CreatePoliciesApiClient(), mapper ?? CreateMapper(), authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            return pageModel;
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IPoliciesApiClient CreatePoliciesApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
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
                FundingStreamId = "fs1"
            };
        }
    }
}
