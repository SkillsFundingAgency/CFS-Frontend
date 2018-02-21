namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class SelectSourceDatasetPageModel : PageModel
    {
        private IDatasetsApiClient _datasetClient;

        public SelectSourceDatasetPageModel(IDatasetsApiClient datasetClient)
        {
            Guard.ArgumentNotNull(datasetClient, nameof(datasetClient));

            _datasetClient = datasetClient;
        }

        public string AcademicYear { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string DatasetDefinitionName { get; set; }

        public async Task<IActionResult> OnGetAsync(string relationshipId)
        {
            ApiResponse<DefinitionSpecificationRelationship> relationshipResponse = await _datasetClient.GetDefinitionSpecificationRelationshipById(relationshipId);
            DefinitionSpecificationRelationship relationship = relationshipResponse.Content;

            SpecificationId = relationship.Specification.Id;
            SpecificationName = relationship.Specification.Name;
            DatasetDefinitionName = relationship.DatasetDefinition.Name;

            return Page();
        }
    }
}