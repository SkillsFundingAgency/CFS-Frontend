﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Errors
{
    [AllowAnonymous]
    public class Error404PageModel : PageModel
    {
        public IActionResult OnGet()
        {
            return Page();
        }
    }
}