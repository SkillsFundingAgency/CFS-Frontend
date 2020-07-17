using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.ViewModels.Datasets;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Serilog;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;

namespace CalculateFunding.Frontend.Pages.Datasets
{
	public class SpecificationRelationshipsPageModel : PageModel
    {
		private readonly IAuthorizationHelper _authorizationHelper;
        private readonly ISpecificationsApiClient _specsApiClient;
        private readonly IDatasetsApiClient _datasetsApiClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public SpecificationRelationshipsPageModel(ISpecificationsApiClient specsApiClient, IDatasetsApiClient datasetsApiClient, ILogger logger, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
	        Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
	        Guard.ArgumentNotNull(datasetsApiClient, nameof(datasetsApiClient));
	        Guard.ArgumentNotNull(logger, nameof(logger));
	        Guard.ArgumentNotNull(mapper, nameof(mapper));
	        Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

			_specsApiClient = specsApiClient;
            _datasetsApiClient = datasetsApiClient;
            _logger = logger;
            _mapper = mapper;
	        _authorizationHelper = authorizationHelper;
        }

        public SpecificationDatasetRelationshipsViewModel ViewModel { get; set; }

        public bool ShowSuccessMessage { get; set; }

		public bool IsAuthorizedToMap { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId, bool wasSuccess = false)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ShowSuccessMessage = wasSuccess;

            ApiResponse<SpecificationSummary> specificationResponse = await _specsApiClient.GetSpecificationSummaryById(specificationId);

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Error($"Failed to fetch specification with status code {specificationResponse.StatusCode.ToString()}");
                return new StatusCodeResult((int)specificationResponse.StatusCode);
            }

			IsAuthorizedToMap = await _authorizationHelper.DoesUserHavePermission(User, specificationResponse.Content.GetSpecificationId(),
				SpecificationActionTypes.CanMapDatasets);

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

            ApiResponse<IEnumerable<DatasetSpecificationRelationshipViewModel>> apiResponse = await _datasetsApiClient.GetRelationshipsBySpecificationId(specification.Id);

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
                DefinitionDescription = m.Definition?.Description ?? string.Empty,
                DatasetVersion = m.Version ?? 0,
                RelationName = m.Name,
                RelationshipId = m.Id,
                RelationshipDescription = m.RelationshipDescription,
				IsProviderData = m.IsProviderData
            });

            return viewModel;
        }
    }
}