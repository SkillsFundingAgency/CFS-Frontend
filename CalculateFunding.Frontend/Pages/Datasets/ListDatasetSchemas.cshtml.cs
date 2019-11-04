using CalculateFunding.Common.ApiClient.DataSets;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Datasets;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class ListDatasetSchemasModel : PageModel
    {
        private readonly ISpecificationsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly IMapper _mapper;

        public ListDatasetSchemasModel(ISpecificationsApiClient specsClient, IDatasetsApiClient datasetsClient, IMapper mapper)
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

            Task<ApiResponse<SpecificationSummary>> specificationResponseTask = _specsClient.GetSpecificationSummaryById(specificationId);
            Task<ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>>> datasetSchemaResponseTask = _datasetsClient.GetRelationshipsBySpecificationId(specificationId);

            await TaskHelper.WhenAllAndThrow(specificationResponseTask, datasetSchemaResponseTask);

            ApiResponse<SpecificationSummary> specificationResponse = specificationResponseTask.Result;
            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> datasetSchemaResponse = datasetSchemaResponseTask.Result;

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
            foreach (DatasetSpecificationRelationshipViewModel datasetSchema in datasetSchemaResponse.Content.OrderBy(d => d.Name))
            {
                if (!dataDefinitions.ContainsKey(datasetSchema.Definition.Id))
                {
                    if (!datasets.ContainsKey(datasetSchema.Definition.Id))
                    {
                        datasets.Add(datasetSchema.Definition.Id, new List<AssignedDatasetViewModel>());
                    }

                    AssignedDataDefinitionToSpecificationViewModel definition = new AssignedDataDefinitionToSpecificationViewModel()
                    {
                        Id = datasetSchema.Definition.Id,
                        Name = datasetSchema.Definition.Name,
                        Datasets = datasets[datasetSchema.Definition.Id],
                    };

                    dataDefinitions.Add(datasetSchema.Definition.Id, definition);
                }

                AssignedDatasetViewModel dataset = new AssignedDatasetViewModel()
                {
                    Id = datasetSchema.Id,
                    Name = datasetSchema.Name,
                    Description = datasetSchema.RelationshipDescription,
                    IsSetAsProviderData = datasetSchema.IsProviderData
                };

                datasets[datasetSchema.Definition.Id].Add(dataset);
            }

            DatasetDefinitions = dataDefinitions.Values.OrderBy(d => d.Name).AsEnumerable();

            HasProviderDatasetsAssigned = datasetSchemaResponse.Content.Any(d => d.IsProviderData);

            return Page();
        }
    }
}