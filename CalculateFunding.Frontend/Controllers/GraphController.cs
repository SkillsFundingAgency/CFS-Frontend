using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;

namespace CalculateFunding.Frontend.Controllers
{
    public class GraphController : ControllerBase
    {
        private readonly IGraphCalculationService _graphCalculationService;

        public GraphController(
            IGraphCalculationService graphCalculationService)
        {
            Guard.ArgumentNotNull(graphCalculationService, nameof(graphCalculationService));

            _graphCalculationService = graphCalculationService;
        }

        [Route("api/graph/calculation/circulardependencies/{specificationId}")]
        [HttpGet]
		public async Task<IActionResult> GetCalculationCircularDependencies(
            [FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            return await _graphCalculationService.GetCalculationCircularDependencies(specificationId);
        }
    }
}
