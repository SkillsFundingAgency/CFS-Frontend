namespace CalculateFunding.Frontend.Pages.Scenarios
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;

    public class CreateTestScenarioPageModel : PageModel
    {
        private ISpecsApiClient _specsClient;
        private IScenariosApiClient _scenariosClient;
        private IMapper _mapper;

        public CreateTestScenarioPageModel(ISpecsApiClient specsClient, IScenariosApiClient scenariosApiClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _scenariosClient = scenariosApiClient;
            _mapper = mapper;
        }

        [BindProperty]
        public ScenarioCreateViewModel CreateTestScenarioModel { get; set; }

        public IEnumerable<SelectListItem> Specifications { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {

            await PopulateSpecifications();

            return Page();

        }

        public async Task PopulateSpecifications()
        {
            ApiResponse<IEnumerable<Specification>> apiResponse = await _specsClient.GetSpecifications();

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Specification information: Status Code = {apiResponse.StatusCode}");
            }

            Specifications = apiResponse.Content.OrderBy(s => s.Name).Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name
            }).ToList();
        }
    }
}