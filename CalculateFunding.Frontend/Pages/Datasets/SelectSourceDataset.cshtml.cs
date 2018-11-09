namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Serilog;

    public class SelectSourceDatasetPageModel : PageModel
    {
        private readonly IDatasetsApiClient _datasetClient;
        private readonly ILogger _logger;
        private readonly IAuthorizationHelper _authorizationHelper;

        public SelectSourceDatasetPageModel(IDatasetsApiClient datasetClient, ILogger logger, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(datasetClient, nameof(datasetClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _datasetClient = datasetClient;
            _logger = logger;
            _authorizationHelper = authorizationHelper;
        }

        public SelectDataSourceViewModel ViewModel { get; set; }

        public async Task<IActionResult> OnGetAsync(string relationshipId)
        {
            Guard.IsNullOrWhiteSpace(relationshipId, nameof(relationshipId));

            ApiResponse<SelectDataSourceModel> sourcesResponse = await _datasetClient.GetDatasourcesByRelationshipId(relationshipId);

            if (sourcesResponse.StatusCode != HttpStatusCode.OK || sourcesResponse.Content == null)
            {
                _logger.Error($"Failed to fetch data sources with status code {sourcesResponse.StatusCode.ToString()}");
                return NotFound();
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, sourcesResponse.Content, SpecificationActionTypes.CanMapDatasets))
            {
                return new ForbidResult();
            }

            SelectDataSourceViewModel viewModel = PopulateViewModel(sourcesResponse.Content);

            if (viewModel == null)
            {
                return new StatusCodeResult(500);
            }

            ViewModel = viewModel;

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string relationshipId, string specificationId, string datasetVersion = null)
        {
            Guard.IsNullOrWhiteSpace(relationshipId, nameof(relationshipId));

            ApiResponse<SelectDataSourceModel> sourcesResponse = await _datasetClient.GetDatasourcesByRelationshipId(relationshipId);

            if (sourcesResponse.StatusCode != HttpStatusCode.OK || sourcesResponse.Content == null)
            {
                _logger.Error($"Failed to fetch data sources with status code {sourcesResponse.StatusCode.ToString()}");
                return NotFound();
            }

            if (!await _authorizationHelper.DoesUserHavePermission(User, sourcesResponse.Content, SpecificationActionTypes.CanMapDatasets))
            {
                return new ForbidResult();
            }

            if (string.IsNullOrWhiteSpace(datasetVersion))
            {
                this.ModelState.AddModelError($"{nameof(ViewModel)}.{nameof(datasetVersion)}", "");

                SelectDataSourceViewModel viewModel = PopulateViewModel(sourcesResponse.Content);

                if (viewModel == null)
                {
                    return new StatusCodeResult(500);
                }

                ViewModel = viewModel;

                return Page();
            }

            string[] datasetVersionArray = datasetVersion.Split("_");
            if (datasetVersionArray.Length != 2)
            {
                _logger.Error($"Dataset version: {datasetVersion} is invalid");
                return new StatusCodeResult(500);
            }

            AssignDatasetVersion assignDatasetVersion = new AssignDatasetVersion
            {
                RelationshipId = relationshipId,
                DatasetId = datasetVersionArray[0],
                Version = Convert.ToInt32(datasetVersionArray[1])
            };

            HttpStatusCode httpStatusCode = await _datasetClient.AssignDataSourceVersionToRelationship(assignDatasetVersion);

            if (httpStatusCode.IsSuccess())
            {
                return Redirect($"/datasets/specificationrelationships?specificationId={specificationId}&wasSuccess=true");
            }

            _logger.Error($"Failed to assign dataset version with status code: {httpStatusCode.ToString()}");

            return new StatusCodeResult(500);
        }

        private SelectDataSourceViewModel PopulateViewModel(SelectDataSourceModel selectDatasourceModel)
        {
            SelectDataSourceViewModel viewModel = new SelectDataSourceViewModel
            {
                SpecificationId = selectDatasourceModel.SpecificationId,
                SpecificationName = selectDatasourceModel.SpecificationName,
                RelationshipId = selectDatasourceModel.RelationshipId,
                DefinitionId = selectDatasourceModel.DefinitionId,
                DefinitionName = selectDatasourceModel.DefinitionName,
                RelationshipName = selectDatasourceModel.RelationshipName
            };

            List<DatasetVersionsViewModel> datasets = new List<DatasetVersionsViewModel>();

            if (!selectDatasourceModel.Datasets.IsNullOrEmpty())
            {
                foreach (DatasetVersionsModel datasetVersionModel in selectDatasourceModel.Datasets)
                {
                    datasets.Add(new DatasetVersionsViewModel
                    {
                        Id = datasetVersionModel.Id,
                        Name = datasetVersionModel.Name,
                        IsSelected = datasetVersionModel.SelectedVersion.HasValue,
                        Versions = datasetVersionModel.Versions.Select(m =>
                            new DatasetVersionItemViewModel(datasetVersionModel.Id, datasetVersionModel.Name, m)
                            {
                                IsSelected = datasetVersionModel.SelectedVersion.HasValue && datasetVersionModel.SelectedVersion.Value == m
                            }).ToArraySafe()
                    });

                }
            }

            viewModel.Datasets = datasets;

            return viewModel;
        }
    }
}