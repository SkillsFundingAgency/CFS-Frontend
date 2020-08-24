using AutoMapper;
using CalculateFunding.Common.ApiClient.Graph;
using CalculateFunding.Common.ApiClient.Graph.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Graph;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Services
{
    public class GraphCalculationService : IGraphCalculationService
    {
        private readonly IGraphApiClient _graphApiClient;
        private readonly IMapper _mapper;

        public GraphCalculationService(
            IGraphApiClient graphApiClient,
            IMapper mapper)
        {
            _graphApiClient = graphApiClient;
            _mapper = mapper;
        }

        public async Task<IActionResult> GetCalculationCircularDependencies(string specificationId)
        {
            ApiResponse<IEnumerable<Entity<Calculation>>> getCircularDependenciesApiResponse
                = await _graphApiClient.GetCircularDependencies(specificationId);

            IActionResult errorResult = getCircularDependenciesApiResponse.IsSuccessOrReturnFailureResult(
                $"Get Circular Dependencies by specification ID:{specificationId}");

            if(errorResult != null)
            {
                return errorResult;
            }

            IEnumerable<GraphCalculationEntityViewModel<GraphCalculationViewModel>> graphCalculationEntities =
                _mapper.Map<IEnumerable<GraphCalculationEntityViewModel<GraphCalculationViewModel>>>(
                    getCircularDependenciesApiResponse.Content);

            return new OkObjectResult(graphCalculationEntities);
        }
    }
}
