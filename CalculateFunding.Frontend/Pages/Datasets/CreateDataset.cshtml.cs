using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.DataSets.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class CreateDatasetPageModel : PageModel
    {
        private readonly IDatasetsApiClient _datasetApiClient;

        public CreateDatasetPageModel(IDatasetsApiClient datasetApiClient)
        {
            Guard.ArgumentNotNull(datasetApiClient, nameof(datasetApiClient));

            _datasetApiClient = datasetApiClient;
        }

        [BindProperty]
        public CreateDatasetViewModel CreateDatasetViewModel { get; set; }

        public IEnumerable<GdsSelectListItem> DatasetDefinitions { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await TaskHelper.WhenAllAndThrow(PopulateDefinitions());

            return Page();
        }

        private async Task PopulateDefinitions()
        {
            ApiResponse<IEnumerable<DatasetDefinition>> definitionsResponse = await _datasetApiClient.GetDatasetDefinitions();
            if (definitionsResponse.StatusCode == HttpStatusCode.OK)
            {
                IEnumerable<DatasetDefinition> defintions = definitionsResponse.Content;

                DatasetDefinitions = defintions.Select(m => new GdsSelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Description = m.Description
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive data definitions. Status Code = {definitionsResponse.StatusCode}");
            }
        }
    }
}