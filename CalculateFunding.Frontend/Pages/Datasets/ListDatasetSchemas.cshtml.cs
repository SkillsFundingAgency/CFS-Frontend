namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ListDatasetSchemasModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly IMapper _mapper;

        public ListDatasetSchemasModel(ISpecsApiClient specsClient, IDatasetsApiClient datasetsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(specsClient, nameof(mapper));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _mapper = mapper;
        }

        public Specification Specification { get; set; }

        ////public DatasetDefinition DataDefinitions { get; set; }

        ////public IEnumerable<DatasetSchemaListForSpecification> DataTypeListForSpecification { get; set; }

        public IEnumerable<AssignedDataDefinitionToSpecificationViewModel> DatasetDefinitions { get; set; }

        public async Task<IActionResult> OnGet(string specificationId)
        {
            ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

            if (specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Specification not found");
            }

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                return new StatusCodeResult(500);
            }
            else
            {
                this.Specification = specificationResponse.Content;

                ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = await _datasetsClient.GetAssignedDatasetSchemasForSpecification(specificationId);

                if (datasetSchemaResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    return new NotFoundObjectResult("Data schema not found");
                }

                if (datasetSchemaResponse.StatusCode != HttpStatusCode.OK)
                {
                    return new StatusCodeResult(500);
                }

                Dictionary<string, AssignedDataDefinitionToSpecificationViewModel> dataDefinitions = new Dictionary<string, AssignedDataDefinitionToSpecificationViewModel>();
                Dictionary<string, List<AssignedDatasetViewModel>> datasets = new Dictionary<string, List<AssignedDatasetViewModel>>();
                foreach (DatasetSchemasAssigned datasetSchema in datasetSchemaResponse.Content.OrderBy(d => d.Name))
                {
                    if (!dataDefinitions.ContainsKey(datasetSchema.DatasetDefinition.Id))
                    {
                        if (!datasets.ContainsKey(datasetSchema.DatasetDefinition.Id))
                        {
                            datasets.Add(datasetSchema.DatasetDefinition.Id, new List<AssignedDatasetViewModel>());
                        }

                        AssignedDataDefinitionToSpecificationViewModel definition = new AssignedDataDefinitionToSpecificationViewModel()
                        {
                            Id = datasetSchema.DatasetDefinition.Id,
                            Name = datasetSchema.DatasetDefinition.Name,
                            Datasets = datasets[datasetSchema.DatasetDefinition.Id],
                        };

                        dataDefinitions.Add(datasetSchema.DatasetDefinition.Id, definition);
                    }

                    AssignedDatasetViewModel dataset = new AssignedDatasetViewModel()
                    {
                        Id = datasetSchema.Id,
                        Name = datasetSchema.Name,
                        Description = datasetSchema.Description,
                    };

                    datasets[datasetSchema.DatasetDefinition.Id].Add(dataset);
                }

                DatasetDefinitions = dataDefinitions.Values.OrderBy(d => d.Name).AsEnumerable();

                return Page();
            }
        }
    }
}