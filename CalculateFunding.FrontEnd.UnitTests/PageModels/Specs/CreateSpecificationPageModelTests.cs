using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Specs;
using CalculateFunding.Frontend.ViewModels.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.UnitTests.PageModels.Specs
{
    [TestClass]
    public class CreateSpecificationPageModelTests
    {
        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.BadRequest);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulateFundingPeriodsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulayeFundingPeriodsIsOKButFundingStreamsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.BadRequest);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public void OnGetAsync_GivenToPopulayeFundingPeriodsIsOKButFundingStreamsReturnsOKButNullContent_ThrowsInvalidOperationException()
        {
            //Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act/Assert
            Func<Task> test = async () => await pageModel.OnGetAsync();

            test
                .Should()
                .ThrowExactly<InvalidOperationException>();
        }

        [TestMethod]
        public async Task OnGetAsync_GivenPagePopulates_ReturnsPage()
        {
            //Arrange
            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            IEnumerable<FundingStream> fundingStreams= new[]
            {
                new FundingStream { Id = "fp1", Name = "funding" }
            };

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK, fundingPeriods);

            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = new ApiResponse<IEnumerable<FundingStream>>(HttpStatusCode.OK, fundingStreams);

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync();

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
        public async Task OnGetAsync_GivenPagePopulatesAndPeriodIdProvided_ReturnsPageSetsPeriodInSelectAsDefaulr()
        {
            //Arrange
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

            ISpecsApiClient apiClient = CreateApiClient();
            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            apiClient
                .GetFundingStreams()
                .Returns(fundingStreamsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            //Act
            IActionResult result = await pageModel.OnGetAsync("fp2");

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

            pageModel
                .FundingPeriods
                .First(m => m.Value == "fp2")
                .Selected
                .Should()
                .BeTrue();
        }

        [TestMethod]
        public void OnPostAsync_GivenNameAlreadyExistsAndPopulateFundingPeriodsReturnsBadRequest_ThrowsInvalidOperationException()
        {
            //Arrange
            const string specName = "spec name";

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.BadRequest);

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);


            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.PageContext = new PageContext();

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
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
            const string specName = "spec name";

            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = new ApiResponse<IEnumerable<Reference>>(HttpStatusCode.OK);

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            apiClient
                .GetFundingPeriods()
                .Returns(fundingPeriodsResponse);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.PageContext = new PageContext();

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
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
            const string specName = "spec name";

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

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
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
            const string specName = "spec name";

            IEnumerable<Reference> fundingPeriods = new[]
            {
                new Reference { Id = "fp1", Name = "funding" }
            };

            IEnumerable<FundingStream> fundingStreams = new[]
           {
                new FundingStream { Id = "fp1", Name = "funding" }
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

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient);

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
            {
                Name = specName
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
        public async Task OnPostAsync_GivenViewModelIsValid_ReturnsRedirect()
        {
            //Arrange
            const string specName = "spec name";

            CreateSpecificationModel createModel = new CreateSpecificationModel
            {
                Name = specName,
                Description = "description",
                FundingStreamIds = new[] { "fs1" },
                FundingPeriodId = "fp1"
            };

            ApiResponse<Specification> existingSpecificationResponse = new ApiResponse<Specification>(HttpStatusCode.NotFound);

            ISpecsApiClient apiClient = CreateApiClient();

            apiClient
                .GetSpecificationByName(Arg.Is(specName))
                .Returns(existingSpecificationResponse);

            Specification createdSpecification = new Specification()
            {
                Id = "specId",
            };

            apiClient
                .CreateSpecification(Arg.Any<CreateSpecificationModel>())
                .Returns(new ValidatedApiResponse<Specification>(HttpStatusCode.OK, createdSpecification));

            IMapper mapper = CreateMapper();
            mapper
                .Map<CreateSpecificationModel>(Arg.Any<CreateSpecificationViewModel>())
                .Returns(createModel);

            CreateSpecificationPageModel pageModel = CreatePageModel(apiClient, mapper);

            pageModel.CreateSpecificationViewModel = new CreateSpecificationViewModel
            {
                Name = specName,
                Description = "description",
                FundingStreamIds = new[] {"fs1"},
                FundingPeriodId = "fp1"
            };

            pageModel.PageContext = new PageContext();

            //Act
            IActionResult result = await pageModel.OnPostAsync();

            //Assert
            result
                .Should()
                .BeOfType<RedirectResult>();

            RedirectResult redirectResult = result as RedirectResult;

            redirectResult
                .Url
                .Should()
                .Be("/specs?operationType=SpecificationCreated&operationId=specId");
        }

        private static CreateSpecificationPageModel CreatePageModel(ISpecsApiClient specsClient = null, IMapper mapper = null)
        {
            return new CreateSpecificationPageModel(specsClient ?? CreateApiClient(), mapper ?? CreateMapper());
        }

        private static ISpecsApiClient CreateApiClient()
        {
            return Substitute.For<ISpecsApiClient>();
        }

        private static IMapper CreateMapper()
        {
            return Substitute.For<IMapper>();
        }
    }
}
