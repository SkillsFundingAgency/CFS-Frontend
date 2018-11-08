﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Errors
{
    public class Error500PageModel : PageModel
    {
        [AllowAnonymous]
        public IActionResult OnGet()
        {
            return Page();
        }
    }
}