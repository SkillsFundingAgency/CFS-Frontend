﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Errors
{
    [AllowAnonymous]
    public class Error401PageModel : PageModel
    {
        public IActionResult OnGet()
        {
            IStatusCodeReExecuteFeature feature = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();
            if (feature?.OriginalPath != null && feature.OriginalPath.StartsWith("/api"))
            {
                return new UnauthorizedResult();
            }

            return Page();
        }
    }
}
