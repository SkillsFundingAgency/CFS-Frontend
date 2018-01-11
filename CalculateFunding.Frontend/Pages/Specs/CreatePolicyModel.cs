using System.Collections.Generic;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class CreatePolicyPageModel : PageModel
    {
        public PolicySpecification Policy { get; set; }
        
        public Specification Specification { get; set; }

        public void OnGet(string specificationId)
        {
            //get the spec for id

            Policy = new PolicySpecification();
        }
    }


}