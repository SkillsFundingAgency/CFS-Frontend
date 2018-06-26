using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Pages.Specs;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Mvc.RazorPages;
//using Microsoft.VisualStudio.TestTools.UnitTesting;
//using NSubstitute;
//using Serilog;

namespace CalculateFunding.Frontend.PageModels.Specs
{

    //[TestClass]
    //public class EditPolicyPageModelTests
    //{
    //    private string specificationId = Guid.NewGuid().ToString();
    //    private const string policyName = "spec123";

    //    [TestMethod]
    //    public void EditPolicyModel_OnGet_When_SpecificationId_IsNull_ArgumentNullExceptionThrown()
    //    {
    //        //Arrange
    //        ISpecsApiClient specsApiClient = CreateSpecsApiClient();
    //        IMapper mapper = CreateMapper();
    //        ILogger logger = CreateLogger();

    //        EditPolicyPageModel editPolicyModel = GetEditPolicyModel(specsApiClient, mapper, logger);

    //        Func<Task> test = async () => await editPolicyModel.OnGetAsync(specificationId, Arg.Any<string>());

    //        // IActionResult result = await editPolicyModel.OnGetAsync(specificationId, Arg.Any<string>());

    //        test
    //            .Should()
    //            .ThrowExactly<ArgumentNullException>()
    //            .Which
    //            .Message
    //            .Should()
    //            .Be("Value cannot be null.\r\nParameter name: specificationId");
    //    }

    //    [TestMethod]
    //    public async Task OnGetAsync_GivenSpecificationIdButResponseIsBadRequest_ReturnsStatusCode_500()
    //    {
    //        //Arrange
    //        string policyId = "";
    //        ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.BadRequest);

    //        ApiResponse<Policy> policyResponse = new ApiResponse<Policy>(HttpStatusCode.OK);

    //        IMapper mapper = CreateMapper();
    //        ILogger logger = CreateLogger();
    //        ISpecsApiClient specsApiClient = CreateSpecsApiClient();

    //        specsApiClient
    //            .GetSpecification(Arg.Is(specificationId))
    //            .Returns(specificationResponse); 

    //        EditPolicyPageModel editPolicyModel = GetEditPolicyModel(specsApiClient, mapper, logger);

    //        //Act/Assert
    //        IActionResult result = await editPolicyModel.OnGetAsync(specificationId, policyId );

    //        result
    //            .Should()
    //            .NotBeNull();

    //        ObjectResult statusCodeResult = result as ObjectResult;

    //        statusCodeResult
    //            .StatusCode
    //            .Should()
    //            .Be(500);
    //    }

    //    [TestMethod]
    //    public async Task OnGetAsync_GivenSpecificationIdButResponseIsNull_ReturnsStatusCode_500()
    //    {
    //        //Arrange
    //        string policyId = "";
    //        ApiResponse<Specification> specificationResponse = null;

    //        ApiResponse<Policy> policyResponse = new ApiResponse<Policy>(HttpStatusCode.OK);

    //        IMapper mapper = CreateMapper();
    //        ILogger logger = CreateLogger();
    //        ISpecsApiClient specsApiClient = CreateSpecsApiClient();

    //        specsApiClient
    //            .GetSpecification(Arg.Is(specificationId))
    //            .Returns(specificationResponse);

    //        specsApiClient
    //            .GetPolicyBySpecificationIdAndPolicyName(specificationId, policyName)
    //            .Returns(policyResponse);

    //        EditPolicyPageModel editPolicyModel = GetEditPolicyModel(specsApiClient, mapper, logger);

    //        //Act
    //        IActionResult result = await editPolicyModel.OnGetAsync(specificationId, policyId );

    //        //Assert
    //        result
    //            .Should()
    //            .BeOfType<ObjectResult>()
    //            .Which
    //            .Value
    //            .Should()
    //            .Be("Specification Lookup API Failed and returned null");

    //        ObjectResult statusCodeResult = result as ObjectResult;

    //        statusCodeResult
    //            .StatusCode
    //            .Should()
    //            .Be(500);
    //    }

    //    [TestMethod]
    //    public async Task OnGetAsync_GivenPolicyNameButPolicyResponseIsBadRequest_ReturnsStatusCode_500()
    //    {
    //        //Arrange
    //        string policyId = "";
    //        ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);
    //        ApiResponse<Policy> policyResponse = new ApiResponse<Policy>(HttpStatusCode.BadRequest);

    //        IMapper mapper = CreateMapper();
    //        ILogger logger = CreateLogger();
    //        ISpecsApiClient specsApiClient = CreateSpecsApiClient();

    //        specsApiClient
    //            .GetSpecification(Arg.Is(specificationId))
    //            .Returns(specificationResponse);

    //        specsApiClient
    //            .GetPolicyBySpecificationIdAndPolicyName(specificationId, policyName)
    //            .Returns(policyResponse);

    //        EditPolicyPageModel editPolicyModel = GetEditPolicyModel(specsApiClient, mapper, logger);

    //        //Act/Assert
    //        IActionResult result = await editPolicyModel.OnGetAsync(specificationId, policyId);

    //        result
    //            .Should()
    //            .NotBeNull();

    //        ObjectResult statusCodeResult = result as ObjectResult;

    //        statusCodeResult
    //            .StatusCode
    //            .Should()
    //            .Be(500);
    //    }

    //    [TestMethod]
    //    public async Task OnGetAsync_GivenPolicyNameButPolicyResponseIsNotFound_ReturnsStatusCode_404()
    //    {
    //        //Arrange
    //        string policyId = "";
    //        ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK);
    //        ApiResponse<Policy> policyResponse = new ApiResponse<Policy>(HttpStatusCode.NotFound);

    //        IMapper mapper = CreateMapper();
    //        ILogger logger = CreateLogger();
    //        ISpecsApiClient specsApiClient = CreateSpecsApiClient();

    //        specsApiClient
    //            .GetSpecification(Arg.Is(specificationId))
    //            .Returns(specificationResponse);

    //        specsApiClient
    //            .GetPolicyBySpecificationIdAndPolicyName(specificationId, policyName)
    //            .Returns(policyResponse);

    //        EditPolicyPageModel editPolicyModel = GetEditPolicyModel(specsApiClient, mapper, logger);

    //        //Act/Assert
    //        IActionResult result = await editPolicyModel.OnGetAsync(specificationId,  policyId );

    //        result
    //            .Should()
    //            .BeOfType<NotFoundObjectResult>()
    //            .Which
    //            .Value
    //            .Should()
    //            .Be("Policy for given specification and policy name is not found");

    //        NotFoundObjectResult resultStatus = result as NotFoundObjectResult;

    //        resultStatus
    //            .StatusCode
    //            .Should()
    //            .Be(404)
    //          ;
    //    }

    //    //[TestMethod]
    //    //public async Task OnGetAsync_GivenAllResponsesReturned_ReturnsPage()
    //    //{
    //    //    //Arrange

    //    //    SpecificationSummary specification = new SpecificationSummary
    //    //    {
    //    //        Id = specificationId,
    //    //         Description = "",
    //    //          FundingPeriod = ,
    //    //           FundingStreams =  ,
    //    //            Name = "Spec Name"

    //    //    };


    //    //    ApiResponse<Specification> specificationResponse = new ApiResponse<Specification>(HttpStatusCode.OK, new Specification());

    //    //    ApiResponse<Policy> policyResponse = new ApiResponse<Policy>(HttpStatusCode.OK, new Policy());

    //    //    IMapper mapper = CreateMapper();
    //    //    ILogger logger = CreateLogger();
    //    //    ISpecsApiClient specsApiClient = CreateSpecsApiClient();

    //    //    specsApiClient
    //    //        .GetSpecification(Arg.Is(specificationId))
    //    //        .Returns(specificationResponse);

    //    //    specsApiClient
    //    //        .GetPolicyBySpecificationIdAndPolicyName(specificationId, policyName)
    //    //        .Returns(policyResponse);

    //    //    EditPolicyPageModel editPolicyModel = GetEditPolicyModel(specsApiClient, mapper, logger);

    //    //    IActionResult result = await editPolicyModel.OnGetAsync(specificationId, policyName);

    //    //    result
    //    //        .Should()
    //    //        .NotBeNull();

    //    //    result
    //    //    .Should()
    //    //    .BeAssignableTo<PageResult>();

    //    //}

    //    private EditPolicyPageModel GetEditPolicyModel(
    //       ISpecsApiClient specsApiClient = null,
    //       IMapper mapper = null,
    //       ILogger logger = null
    //       )
    //    {
    //        return new EditPolicyPageModel(
    //            specsApiClient ?? CreateSpecsApiClient(),
    //            mapper ?? CreateMapper(),
    //            logger ?? CreateLogger()
    //          );
    //    }


    //    //[TestMethod]
    //    //public async EditPolicyPageModel_OnGet_WhenPolcyIsRequestedForSpecification_ThenResultIsReturned()
    //    //{
    //    //    //Arrange
    //    //    ISpecsApiClient specsApiClient = CreateSpecsApiClient();
    //    //    IDatasetsApiClient datasetsApiClient = CreateDatasetsApiClient();

    //    //    Specification specification = getSpecification();

    //    //    specsApiClient.GetSpecification(Arg.Any<string>())
    //    //        .Returns(new ApiResponse<Specification>(HttpStatusCode.OK, specification));

    //    //    //SpecificationViewModel expectedResult = new SpecificationViewModel()
    //    //    //{
    //    //    //    Id = specificationId,
    //    //    //    Name = "Test Specification",
    //    //    //    FundingPeriod = new ReferenceViewModel("1617", "2016/2017"),
    //    //    //    Description = "Test Description",
    //    //    //    FundingStreams = new List<ReferenceViewModel>() { new ReferenceViewModel("fs1", "Funding Stream Name"), },
    //    //    //    Policies = new List<PolicyViewModel>()
    //    //    //    {
    //    //    //        new PolicyViewModel()
    //    //    //        {
    //    //    //            Id = "pol1",
    //    //    //            Name = "Policy 1",
    //    //    //            Description = "Policy 1 Description",
    //    //    //            Calculations = new List<CalculationViewModel>()
    //    //    //            {
    //    //    //                new CalculationViewModel()
    //    //    //                {
    //    //    //                    Id ="calc1",
    //    //    //                    Name = "Calculation 1",
    //    //    //                    Description = "Calculation with allocation line",
    //    //    //                    AllocationLine = new ReferenceViewModel("al1", "Allocation Line 1"),
    //    //    //                },
    //    //    //                new CalculationViewModel()
    //    //    //                {
    //    //    //                    Id ="calc2",
    //    //    //                    Name = "Calculation Two",
    //    //    //                    Description = "Calculation without allocation line",
    //    //    //                    AllocationLine = null
    //    //    //                },
    //    //    //            },
    //    //    //            SubPolicies = new List<PolicyViewModel>(),
    //    //    //        },
    //    //    //    }
    //    //    //};
    //    //    return page

    //    //}

    //    private Specification getSpecification()
    //    {
    //        Specification specification = new Specification()
    //        {
    //            Id = policyName,
    //            Name = "Test Specification",
    //            FundingPeriod = new Reference("1617", "2016/2017"),
    //            Description = "Test Description",
    //            FundingStreams = new List<Reference>() { new Reference("fs1", "Funding Stream Name"), },
    //            Policies = new List<Policy>()
    //            {
    //                new Policy()
    //                {
    //                    Id = "pol1",
    //                    Name = "Policy 1",
    //                    Description = "Policy 1 Description",
    //                    Calculations = new List<Calculation>()
    //                    {
    //                        new Calculation()
    //                        {
    //                            Id ="calc1",
    //                            Name = "Calculation 1",
    //                            Description = "Calculation with allocation line",
    //                            AllocationLine = new Reference("al1", "Allocation Line 1"),
    //                        },
    //                        new Calculation()
    //                        {
    //                            Id ="calc2",
    //                            Name = "Calculation Two",
    //                            Description = "Calculation without allocation line",
    //                            AllocationLine = null
    //                        },
    //                    },
    //                    SubPolicies = new List<Policy>(),
    //                },
    //            }
    //        };

    //        return specification;
    //    }

    //    private static ISpecsApiClient CreateSpecsApiClient()
    //    {
    //        return Substitute.For<ISpecsApiClient>();
    //    }

    //    private static ILogger CreateLogger()
    //    {
    //        return Substitute.For<ILogger>();
    //    }

    //    private static IMapper CreateMapper()
    //    {
    //        return Substitute.For<IMapper>();
    //    }
    //}
}
