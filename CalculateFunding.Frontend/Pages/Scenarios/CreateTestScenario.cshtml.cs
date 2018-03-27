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

        [BindProperty]
       public string PeriodId { get; set; }

        public async Task<IActionResult> OnGetAsync(string periodId = null )
        {
            Guard.IsNullOrWhiteSpace(periodId, nameof(periodId));

            PeriodId = periodId;

            await PopulateSpecifications(periodId);

            return Page();

        }
       
        public async Task PopulateSpecifications(string periodId)
        {
            ApiResponse<List<Specification>> apiResponse = await _specsClient.GetSpecifications(periodId);

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Specification information: Status Code = {apiResponse.StatusCode}");
            }

            var specifications = apiResponse.Content.Where(m => m.AcademicYear.Id == periodId);

            Specifications = specifications.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name
            }).ToList();
        }
    }
}