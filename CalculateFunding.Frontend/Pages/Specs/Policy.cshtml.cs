using System.Collections.Generic;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class PolicyModel : PageModel
    {

        public Policy Policy { get; set; }
    
        public void OnGet()
        {
            Policy = new Policy();
        }
    }


}