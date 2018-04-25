using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Common;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class SpecificationController : Controller
    {
        private readonly ISpecsApiClient _specsClient;

        public SpecificationController(ISpecsApiClient specsApiClient)
        {
            _specsClient = specsApiClient;
        }

        [Route("api/specifications-by-period/{periodId}")]
        public async Task<IActionResult> GetSpecificationsByPeriod(string periodId)
        {
            ApiResponse<IEnumerable<Specification>> apiResponse = await _specsClient.GetSpecifications(periodId);
            if (apiResponse == null)
            {
                return new StatusCodeResult(500);
            }

            if (apiResponse.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new StatusCodeResult((int)apiResponse.StatusCode);
            }

            List<ReferenceViewModel> result = new List<ReferenceViewModel>();

            foreach (Specification specification in apiResponse.Content)
            {
                result.Add(new ReferenceViewModel(specification.Id, specification.Name));
            }

            return Ok(result);
        }
    }
}
