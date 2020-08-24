using AutoMapper;
using CalculateFunding.Common.ApiClient.Graph;
using CalculateFunding.Frontend.Services;
using CalculateFunding.Frontend.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using NSubstitute;
using FluentAssertions;
using CalculateFunding.Common.ApiClient.Models;
using System.Net;
using System.Collections.Generic;
using CalculateFunding.Common.ApiClient.Graph.Models;
using System.Linq;
using CalculateFunding.Frontend.ViewModels.Graph;

namespace CalculateFunding.Frontend.UnitTests.Services
{
    [TestClass]
    public class GraphCalculationServiceTests
    {
        private IMapper _mapper;
        private IGraphApiClient _graphApiClient;
        private const string SpecificationId = "SpecificationId";

        [TestInitialize]
        public void Initialize()
        {
            _mapper = CreateMapper();
            _graphApiClient = Substitute.For<IGraphApiClient>();
        }

        [TestMethod]
        public async Task GetCalculationCircularDependencies_ApiReturnsError_ResponseHasErrorState()
        {
            GraphCalculationService graphCalculationService = CreateGraphCalculationService();
            GivenGetCalculationCircularDependencies(HttpStatusCode.NotFound);

            IActionResult actionResult = await graphCalculationService.GetCalculationCircularDependencies(SpecificationId);

            ThenErrorObjectResultReturned<NotFoundObjectResult>(actionResult);
        }

        [TestMethod]
        public async Task GetCalculationCircularDependencies_ApiReturnsOk_ResponseHasApiObject()
        {
            const string CalculationId = "CalculationId";
            const string CalculationName = "CalculationName";
            const CalculationType CalculationType = Common.ApiClient.Graph.Models.CalculationType.Additional;
            const string FundingStream = "FundingStream";
            const string SpecificationId = "SpecificationId";

            IEnumerable<Entity<Calculation>> calculationEntities = new List<Entity<Calculation>>
            {
                new Entity<Calculation>
                {
                    Node = new Calculation
                    {
                        CalculationId = CalculationId,
                        CalculationName = CalculationName,
                        CalculationType = CalculationType,
                        FundingStream = FundingStream,
                        SpecificationId = SpecificationId,
                    }
                }
            };

            GraphCalculationService graphCalculationService = CreateGraphCalculationService();
            GivenGetCalculationCircularDependencies(HttpStatusCode.OK, calculationEntities);

            IActionResult actionResult = await graphCalculationService.GetCalculationCircularDependencies(SpecificationId);

            actionResult
                .Should()
                .NotBeNull()
                .And
                .BeOfType<OkObjectResult>();

            OkObjectResult okObjectResult = actionResult as OkObjectResult;

            okObjectResult
                .Value
                .Should()
                .NotBeNull()
                .And
                .BeOfType<List<GraphCalculationEntityViewModel<GraphCalculationViewModel>>>();

            List<GraphCalculationEntityViewModel<GraphCalculationViewModel>> actualCalculationEntities 
                = okObjectResult.Value as List<GraphCalculationEntityViewModel<GraphCalculationViewModel>>;

            actualCalculationEntities
                .Count()
                .Should()
                .Be(calculationEntities.Count());

            actualCalculationEntities
                .FirstOrDefault()
                .Should()
                .NotBeNull();

            GraphCalculationEntityViewModel<GraphCalculationViewModel> firstCalculationEntity 
                = actualCalculationEntities.FirstOrDefault();

            firstCalculationEntity
                .Node
                .Should()
                .NotBeNull();

            GraphCalculationViewModel firstCalculationNode = firstCalculationEntity.Node;

            firstCalculationNode
                .CalculationId
                .Should()
                .Be(CalculationId);

            firstCalculationNode
                .CalculationName
                .Should()
                .Be(CalculationName);

            firstCalculationNode
                .CalculationType
                .Should()
                .Be(CalculationType.ToString());

            firstCalculationNode
                .SpecificationId
                .Should()
                .Be(SpecificationId);

            firstCalculationNode
                .FundingStream
                .Should()
                .Be(FundingStream);
        }

        private void GivenGetCalculationCircularDependencies(
            HttpStatusCode httpStatusCode,
            IEnumerable<Entity<Calculation>> actualValue = null)
        {
            _graphApiClient
                .GetCircularDependencies(SpecificationId)
                .Returns(new ApiResponse<IEnumerable<Entity<Calculation>>>(httpStatusCode, actualValue));
        }

        private GraphCalculationService CreateGraphCalculationService()
        {
            return new GraphCalculationService(_graphApiClient, _mapper);
        }

        private void ThenErrorObjectResultReturned<T>(IActionResult actionResult)
            where T : class, IActionResult 
        {
            actionResult
                .Should()
                .NotBeNull()
                .And
                .BeOfType<T>();
        }

        private void ThenOkObjectResultReturned(IActionResult actionResult, object expectedOkObjectValue)
        {
            actionResult
                .Should()
                .NotBeNull()
                .And
                .BeOfType<OkObjectResult>();

            OkObjectResult okObjectResult = actionResult as OkObjectResult;

            okObjectResult
                .Value
                .Should()
                .NotBeNull()
                .And
                .BeSameAs(expectedOkObjectValue);
        }

        private static IMapper CreateMapper()
        {
            MapperConfiguration mapperConfig = new MapperConfiguration(c =>
            {
                c.AddProfile<FrontEndMappingProfile>();
            });

            return mapperConfig.CreateMapper();
        }
    }
}
