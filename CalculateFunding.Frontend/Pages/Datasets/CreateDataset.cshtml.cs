namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;

    public class CreateDatasetPageModel : PageModel
    {
        private readonly IDatasetsApiClient _datasetApiClient;

        public CreateDatasetPageModel(IDatasetsApiClient datasetApiClient)
        {
            _datasetApiClient = datasetApiClient;
        }

        [BindProperty]
        public CreateDatasetViewModel CreateDatasetViewModel { get; set; }

        public IEnumerable<SelectListItem> DatasetDefinitions { get; set; }

        async public Task<IActionResult> OnGetAsync()
        {
            await TaskHelper.WhenAllAndThrow(PopulateDefinitions());

            return Page();
        }

        async private Task PopulateDefinitions()
        {
            var definitionsResponse = await _datasetApiClient.GetListOfDatasetSchemaDefinitions();
            if (definitionsResponse.StatusCode == HttpStatusCode.OK)
            {
                var defintions = definitionsResponse.Content;

                DatasetDefinitions = defintions.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive data definitions. Status Code = {definitionsResponse.StatusCode}");
            }
        }
    }
}