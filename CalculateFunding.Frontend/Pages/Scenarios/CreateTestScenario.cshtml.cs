namespace CalculateFunding.Frontend.Pages.Scenarios
{
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
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
        private readonly ISpecsApiClient _specsClient;
        private readonly IScenariosApiClient _scenariosClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CreateTestScenarioPageModel(ISpecsApiClient specsClient, IScenariosApiClient scenariosApiClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(scenariosApiClient, nameof(scenariosApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _scenariosClient = scenariosApiClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
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
            ApiResponse<IEnumerable<SpecificationSummary>> apiResponse = await _specsClient.GetSpecificationSummaries();

            if (apiResponse.StatusCode != HttpStatusCode.OK && apiResponse.Content == null)
            {
                throw new InvalidOperationException($"Unable to retreive Specification information: Status Code = {apiResponse.StatusCode}");
            }

            IEnumerable<SpecificationSummary> trimmedSpecs = await _authorizationHelper.SecurityTrimList(User, apiResponse.Content, SpecificationActionTypes.CanCreateQaTests);

            Specifications = trimmedSpecs.OrderBy(s => s.Name).Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name
            }).ToList();
        }
    }
}