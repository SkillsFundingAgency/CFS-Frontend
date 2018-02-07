using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class PoliciesModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;

        public Specification Specification { get; set; }

        public PoliciesModel(ISpecsApiClient specsClient)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));

            _specsClient = specsClient;

        }
        public async Task<IActionResult> OnGet(string specificationId)
        {
            ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

            if(specificationResponse.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult("Specification not found");
            }

            if(specificationResponse.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new StatusCodeResult(500);
            }

            this.Specification = specificationResponse.Content;

            return Page();
        }
    }
}