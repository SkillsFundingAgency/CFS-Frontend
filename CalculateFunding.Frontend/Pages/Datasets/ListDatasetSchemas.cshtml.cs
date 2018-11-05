namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using CalculateFunding.Frontend.ViewModels.Specs;
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

        public SpecificationViewModel Specification { get; set; }

        public IEnumerable<AssignedDataDefinitionToSpecificationViewModel> DatasetDefinitions { get; set; }

        public bool HasProviderDatasetsAssigned { get; set; }

        public async Task<IActionResult> OnGet(string specificationId)
        {
            if (string.IsNullOrWhiteSpace(specificationId))
            {
                return new BadRequestObjectResult(ErrorMessages.SpecificationIdNullOrEmpty);
            }

            Task<ApiResponse<Specification>> specificationResponseTask = _specsClient.GetSpecification(specificationId);
            Task<ApiResponse<IEnumerable<DatasetSchemasAssigned>>> datasetSchemaResponseTask = _datasetsClient.GetAssignedDatasetSchemasForSpecification(specificationId);

            await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

            ApiResponse<Specification> specificationResponse = specificationResponseTask.Result;
            ApiResponse<IEnumerable<DatasetSchemasAssigned>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

            if (specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Specification not found");
            }

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                return new StatusCodeResult(500);
            }

            if (datasetSchemaResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Data schemas not found");
            }

            if (datasetSchemaResponse.StatusCode != HttpStatusCode.OK)
            {
                return new StatusCodeResult(500);
            }

            this.Specification = _mapper.Map<SpecificationViewModel>(specificationResponse.Content);

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

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsSetAsProviderData);

            return Page();
        }
    }
}