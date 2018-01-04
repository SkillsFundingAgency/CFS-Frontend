using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class IndexModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        public IList<Specification> Specifications;
        public IList<SelectListItem> Years;

        public IndexModel(ISpecsApiClient specsClient)
        {
            _specsClient = specsClient;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var specstask = _specsClient.GetSpecifications();
            var yearsTask = _specsClient.GetAcademicYears();

            await TaskHelper.WhenAllAndThrow(specstask, yearsTask);

            Specifications = specstask.Result.Content;
            Years = yearsTask.Result.Content.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name
            }).ToList();

            return Page();
        }
    }
}
