namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class SpecificationRelationshipsPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsApiClient;
        private readonly IDatasetsApiClient _datasetsApiClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public SpecificationRelationshipsPageModel(ISpecsApiClient specsApiClient, IDatasetsApiClient datasetsApiClient, ILogger logger, IMapper mapper)
        {
            _specsApiClient = specsApiClient;
            _datasetsApiClient = datasetsApiClient;
            _logger = logger;
            _mapper = mapper;
        }

        public SpecificationDatasetRelationshipsViewModel ViewModel { get; set; }

        public bool ShowSuccessMessage { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId, bool wasSuccess = false)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ShowSuccessMessage = wasSuccess;

            ApiResponse<SpecificationSummary> specificationResponse = await _specsApiClient.GetSpecificationSummary(specificationId);

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error($"Failed to fetch specification with status code {specificationResponse.StatusCode.ToString()}");
                return new StatusCodeResult((int)specificationResponse.StatusCode);
            }

            SpecificationDatasetRelationshipsViewModel viewModel = await PopulateViewModel(specificationResponse.Content);

            if (viewModel == null)
            {
                _logger.Error($"A null view model was returned");
                return new StatusCodeResult(500);
            }

            ViewModel = viewModel;

            return Page();
        }

        private async Task<SpecificationDatasetRelationshipsViewModel> PopulateViewModel(SpecificationSummary specification)
        {
            SpecificationSummaryViewModel vm = _mapper.Map<SpecificationSummaryViewModel>(specification);
            SpecificationDatasetRelationshipsViewModel viewModel = new SpecificationDatasetRelationshipsViewModel(vm);

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipModel>> apiResponse = await _datasetsApiClient.GetDatasetSpecificationRelationshipsBySpecificationId(specification.Id);

            if (apiResponse.StatusCode != HttpStatusCode.OK || apiResponse.Content == null)
            {
                _logger.Error($"Failed to fetch specification relationships for specification id: {specification.Id}");

                return null;
            }

            viewModel.Items = apiResponse.Content.Select(m => new SpecificationDatasetRelationshipItemViewModel
            {
                DatasetId = m.DatasetId,
                DatasetName = m.DatasetName,
                DefinitionName = m.Definition != null ? m.Definition.Name : string.Empty,
                DefinitionId = m.Definition != null ? m.Definition.Id : string.Empty,
                DefinitionDescription = m.Definition != null ? m.Definition.Description : string.Empty,
                DatasetVersion = m.Version.HasValue ? m.Version.Value : 0,
                RelationName = m.Name,
                RelationshipId = m.Id,
                RelationshipDescription = m.RelationshipDescription
            });

            return viewModel;
        }
    }
}