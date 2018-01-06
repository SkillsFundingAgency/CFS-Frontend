using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class ViewSpecificationModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;

        public ViewSpecificationModel(ISpecsApiClient specsClient)
        {
            _specsClient = specsClient;
        }
    }
}
