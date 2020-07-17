using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.UnitTests.Helpers;
using CalculateFunding.Frontend.ViewModels;
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
        private ISpecificationsApiClient _specsClient;
        private IPoliciesApiClient _policiesClient;
        private IMapper _mapper;
        private IAuthorizationHelper _authorizationHelper;
        private EditSpecificationPageModel _pageModel;

        [TestInitialize]
        public void TestSetup()
        {
            _specsClient = Substitute.For<ISpecificationsApiClient>();
            _policiesClient = Substitute.For<IPoliciesApiClient>();
            _mapper = CreateMapper();
            _authorizationHelper = Substitute.For<IAuthorizationHelper>();

            _pageModel = CreatePageModel(_specsClient, _policiesClient, _mapper, _authorizationHelper);
        }

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
                .Be("Value cannot be null. (Parameter 'specificationId')");
        }

        [TestMethod]
        [DataRow(HttpStatusCode.BadRequest)]
        [DataRow(HttpStatusCode.Conflict)]
        public async Task OnGetAsync_GivenSpecificationIdButResponseIsBadRequest_ReturnsError(HttpStatusCode responseCode)
        {
            //Arrange
            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(responseCode);

            ISpecificationsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
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
                .Be($"Unable to retrieve specification. Status Code = {responseCode}");
        }

        [TestMethod]
        public async Task OnGetAsync_GivenSpecificationIdWithOKResponseButContentIsNull_ReturnsNoContent()
        {
            //Arrange
            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK);

            ISpecificationsApiClient apiClient = CreateApiClient();
            apiClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
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
            SpecificationSummary specification = new SpecificationSummary();

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = null;

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.BadRequest);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK);

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenNullFundingStreamsReturnsReturned_ThrowsInvalidOperationException()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<FundingPeriod> fundingPeriods = new[]
            {
                new FundingPeriod { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = null;

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsIsOKButFundingStreamsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<FundingPeriod> fundingPeriods = new[]
            {
                new FundingPeriod { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.BadRequest);

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsIsOKButFundingStreamsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<FundingPeriod> fundingPeriods = new[]
            {
                new FundingPeriod { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK);

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnGetAsync(specificationId);

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenPagePopulates_ReturnsPage()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId,
                Name = specName
            };

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);


            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            //Act
            IActionResult result = await _pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            _pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            _pageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();

            _pageModel
                .EditSpecificationViewModel.OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenPagePopulatesAndPeriodIdProvided_ReturnsPageSetsPeriodInSelectAsDefault()
        {
            //Arrange
            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId,
                Name = specName
            };

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);


            //Act
            IActionResult result = await _pageModel.OnGetAsync(specificationId);

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            _pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            _pageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();

            _pageModel.EditSpecificationViewModel
                .OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);
        }

        [TestMethod]
        public async Task OnGetAsync_GivenUserDoesNotHaveEditSpecificationPermission_ThenReturnPageResultWithAuthorizedToEditFlagSetToFalse()
        {
            // Arrange
            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };
            SpecificationSummary specification = new SpecificationSummary { Id = specificationId, Name = specName };

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);
            ApiResponse<SpecificationSummary> specificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification);

            EditSpecificationViewModel viewModelReturned = CreateEditSpecificationViewModel();

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(specificationResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            // Act
            IActionResult pageResult = await _pageModel.OnGetAsync(specificationId);

            // Assert
            pageResult
                .Should()
                .BeOfType<PageResult>();

            _pageModel
                .EditSpecificationViewModel
                .OriginalSpecificationName
                .Should()
                .BeEquivalentTo(specName);

            _pageModel
                .IsAuthorizedToEdit
                .Should().BeFalse();
        }

        [TestMethod]
        public async Task OnGetAsync_WhenUserDoesNotHaveCreateSpecPermissionOnExistingFundingStream_ThenExistingFundingStreamsAvailableForList()
        {
            // Arrange
            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId,
                Name = "Test Spec",
                FundingStreams = new List<FundingStream>
                {
                    new FundingStream { Id = "fs1", Name = "FS One" }
                },
                FundingPeriod = new Reference { Id = "fp1", Name = "FP One" }
            };

            IEnumerable<FundingPeriod> fundingPeriods = new[]
            {
                new FundingPeriod { Id = "fp1", Name = "Funding Period 1" },
                new FundingPeriod { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fs1", Name = "FS One" },
                new FundingStream { Id = "fs2", Name = "FS Two" }
            };

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

            _policiesClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            _policiesClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams));

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<FundingStream>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(Enumerable.Empty<FundingStream>());

            // Act
            await _pageModel.OnGetAsync(specificationId);

            // Assert
            _pageModel
                .FundingStreams
                .Should()
                .HaveCount(1);
        }

        [TestMethod]
        public async Task OnGetAsync_WhenUserDoesNotHaveCreateSpecPermissionOnAllExistingFundingStream_ThenExistingFundingStreamsAvailableForList()
        {
            // Arrange
            SpecificationSummary specification = new SpecificationSummary
            {
                Id = specificationId,
                Name = "Test Spec",
                FundingStreams = new List<FundingStream>
                {
                    new FundingStream { Id = "fs1", Name = "FS One" }
                },
                FundingPeriod = new Reference { Id = "fp1", Name = "FP One" }
            };

            IEnumerable<FundingPeriod> fundingPeriods = new[]
            {
                new FundingPeriod { Id = "fp1", Name = "Funding Period 1" },
                new FundingPeriod { Id = "fp2", Name = "Funding Period 2" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fs1", Name = "FS One" },
                new FundingStream { Id = "fs2", Name = "FS Two" }
            };

            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, specification));

            _policiesClient
                .GetFundingPeriods()
                .Returns(new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods));

            _policiesClient
                .GetFundingStreams()
                .Returns(new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams));

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);

            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Any<IEnumerable<FundingStream>>(), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(new List<FundingStream>
                {
                    new FundingStream { Id = "fs1", Name = "FS One" }
                });

            // Act
            await _pageModel.OnGetAsync(specificationId);

            // Assert
            _pageModel.FundingStreams.Should().HaveCount(1);
        }

        [TestMethod]
        public void OnPostAsync_GivenNameAlreadyExistsAndPopulateFundingPeriodsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.BadRequest);

            ApiResponse<SpecificationSummary> existingSpecificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK);

            _specsClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);


            _pageModel.PageContext = new PageContext();

            _pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName
            };

            AndUserCanEditSpecification();

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnPostAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnPostAsync_GivenNameAlreadyExistsPopulateFundingPeriodsIsOKButFundingStreamsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            IEnumerable<FundingPeriod> fundingPeriods = new[]
            {
                new FundingPeriod { Id = "fp1", Name = "funding" }
            };

            ApiResponse<SpecificationSummary> existingSpecificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<FundingPeriod>> fundingPeriodsResponse = new ApiResponse<IEnumerable<FundingPeriod>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.BadRequest);

            _specsClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            _policiesClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            _pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName
            };

            _pageModel.PageContext = new PageContext();
            AndUserCanEditSpecification();

            //Act/Assert
            Func<Task> test = async () => await _pageModel.OnPostAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>()
                .WithMessage("Unable to retrieve Funding Streams. Status Code = BadRequest");
        }

        [TestMethod]
        public async Task OnPostAsync_GivenPagePopulatesButModelStateIsInvalid_ReturnsPage()
        {
            //Arrange
            IEnumerable<FundingStream> fundingStreams = new[]
            {
                new FundingStream { Id = "fs1", Name = "funding stream" }
            };

            ApiResponse<SpecificationSummary> existingSpecificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.OK);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            _specsClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            _policiesClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);

            _pageModel.EditSpecificationViewModel = new EditSpecificationViewModel
            {
                Name = specName,
                FundingStreamId = "fs1"
            };

            _pageModel.PageContext = new PageContext();

            //Act
            IActionResult result = await _pageModel.OnPostAsync();

            //Assert
            result
                .Should()
                .BeOfType<PageResult>();

            _pageModel
                .FundingStreams
                .Count()
                .Should()
                .Be(1);

            _pageModel
                .IsAuthorizedToEdit
                .Should().BeTrue();
        }

        [TestMethod]
        public async Task OnPostAsync_GivenViewModelIsValid_ThenSpecificationIsEditedAndReturnsToSpecificationPageWithOperationTypeUpdated()
        {
            //Arrange
            ApiResponse<SpecificationSummary> existingSpecificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound);

            EditSpecificationModel editModel = new EditSpecificationModel();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            _specsClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            _specsClient
                .UpdateSpecification(Arg.Is(specificationId), Arg.Any<EditSpecificationModel>())
                .Returns(new ValidatedApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary()));

            _pageModel.EditSpecificationViewModel = viewModel;

            _pageModel.PageContext = new PageContext();

            AndUserCanEditSpecification();

            //Act
            IActionResult result = await _pageModel.OnPostAsync(specificationId);

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be($"/specs/fundinglinestructure/{specificationId}?operationType=SpecificationUpdated&operationId={specificationId}");

            await
                _specsClient
                    .Received(1)
                    .UpdateSpecification(Arg.Is(specificationId), Arg.Is<EditSpecificationModel>(
                        c => c.Name == viewModel.Name
                        && c.FundingPeriodId == viewModel.FundingPeriodId
                        && c.Description == viewModel.Description
                        && c.ProviderVersionId == viewModel.ProviderVersionId));
        }
		
        [TestMethod]
        public async Task OnPostAsync_GivenViewModelIsValidAndUpdateSpecificationCallFails_ThenInternalServerErrorReturned()
        {
            // Arrange
            ApiResponse<SpecificationSummary> existingSpecificationResponse = new ApiResponse<SpecificationSummary>(HttpStatusCode.NotFound);

            EditSpecificationModel editModel = new EditSpecificationModel();

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            _specsClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            _specsClient
                .UpdateSpecification(Arg.Is(specificationId), Arg.Any<EditSpecificationModel>())
                .Returns(new ValidatedApiResponse<SpecificationSummary>(HttpStatusCode.InternalServerError));

            _pageModel.EditSpecificationViewModel = viewModel;

            _pageModel.PageContext = new PageContext();

            AndUserCanEditSpecification();

            // Act
            IActionResult result = await _pageModel.OnPostAsync(specificationId, EditSpecificationRedirectAction.Specifications);

            //Assert
            result
                .Should()
                .BeOfType<InternalServerErrorResult>()
                .Which
                .Value
                .Should()
                .Be("Unable to update specification. API returned 'InternalServerError'");

            await
                _specsClient
                    .Received(1)
                    .UpdateSpecification(Arg.Is(specificationId), Arg.Is<EditSpecificationModel>(
                        c => c.Name == viewModel.Name
                        && c.FundingPeriodId == viewModel.FundingPeriodId
                        && c.Description == viewModel.Description
                        && c.ProviderVersionId == viewModel.ProviderVersionId));
        }

        [TestMethod]
        public async Task OnPostAsync_GivenUserDoesNotHaveEditSpecificationPermission_ThenForbidResultReturned()
        {
            // Arrange
            _specsClient
                .GetSpecificationSummaryById(Arg.Is(specificationId))
                .Returns(new ApiResponse<SpecificationSummary>(HttpStatusCode.OK, new SpecificationSummary { Id = specificationId }));

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Is(specificationId), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(false);

            EditSpecificationViewModel viewModel = CreateEditSpecificationViewModel();

            _pageModel.EditSpecificationViewModel = viewModel;

            // Act
            IActionResult result = await _pageModel.OnPostAsync(specificationId);

            // Assert
            _pageModel
                .IsAuthorizedToEdit
                .Should().BeFalse();

            result.Should().BeOfType<ForbidResult>();
        }

        private static EditSpecificationPageModel CreatePageModel(ISpecificationsApiClient specsClient = null, IPoliciesApiClient policiesApiClient = null, IMapper mapper = null, IAuthorizationHelper authorizationHelper = null)
        {
            EditSpecificationPageModel pageModel = new EditSpecificationPageModel(specsClient ?? CreateApiClient(), policiesApiClient ?? CreatePoliciesApiClient(), mapper ?? CreateMapper(), authorizationHelper ?? TestAuthHelper.CreateAuthorizationHelperSubstitute(SpecificationActionTypes.CanEditSpecification));

            pageModel.PageContext = TestAuthHelper.CreatePageContext();

            return pageModel;
        }

        private static ISpecificationsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecificationsApiClient>();
        }

        private static IPoliciesApiClient CreatePoliciesApiClient()
        {
            return Substitute.For<IPoliciesApiClient>();
        }

        private static IMapper CreateMapper()
        {
            MapperConfiguration mapperConfiguration = new MapperConfiguration(c =>
            {
                c.AddProfile<FrontEndMappingProfile>();
            });

            return mapperConfiguration.CreateMapper();
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

        private void AndUserCanEditSpecification()
        {
            IEnumerable<FundingStream> fundingStreams = new[]
                        {
                new FundingStream { Id = "fs1", Name = "funding stream" }
            };

            _authorizationHelper
                .DoesUserHavePermission(Arg.Any<ClaimsPrincipal>(), Arg.Any<string>(), Arg.Is(SpecificationActionTypes.CanEditSpecification))
                .Returns(true);
            _authorizationHelper
                .SecurityTrimList(Arg.Any<ClaimsPrincipal>(), Arg.Is(fundingStreams), Arg.Is(FundingStreamActionTypes.CanCreateSpecification))
                .Returns(fundingStreams);
        }
    }
}
