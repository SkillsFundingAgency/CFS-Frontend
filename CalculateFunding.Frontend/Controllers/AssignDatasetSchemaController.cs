namespace CalculateFunding.Frontend.Controllers
{
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;

    public class AssignDatasetSchemaController : Controller
    {
        private ISpecsApiClient _specsClient;
        private IDatasetsApiClient _datasetsClient;
        private IMapper _mapper;

        public AssignDatasetSchemaController(ISpecsApiClient specsClient, IDatasetsApiClient datasetsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _mapper = mapper;
        }

        [HttpPost]
        [Route("api/datasets/ListDatasetSchemas/{specificationId}")]

        public async Task<IActionResult> AssignDatasetSchema(string specificationId, [FromBody] AssignDatasetSchemaViewModel vm)
        {
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(vm, nameof(vm));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AssignDatasetSchemaModel datasetSchema = _mapper.Map<AssignDatasetSchemaModel>(vm);

            datasetSchema.SpecificationId = specificationId;

            HttpStatusCode newAssignDatasetResponse = await _datasetsClient.AssignDatasetSchema(datasetSchema);

            if (newAssignDatasetResponse.Equals(HttpStatusCode.OK))
            {
                return Redirect($"/datasets/ListDatasetSchemas/{specificationId}");
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
