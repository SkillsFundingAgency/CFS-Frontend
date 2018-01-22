using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Paging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class IndexModel : PageModel
    {
        private ICalculationsApiClient _calculationsApiClient;

        public int TotalResults { get; set; }

        public int CurrentPage { get; set; }

        public int StartItemNumber { get; set; }

        public int EndItemNumber { get; set; }

        public IEnumerable<Calculation> Calculations { get; set; }

        public PagerState PagerState { get; set; }

        public Calculation DraftSavedCalculation { get; set; }

        public Calculation PublishedCalculation { get; set; }


        public IndexModel(ICalculationsApiClient calculationsApiClient)
        {
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            _calculationsApiClient = calculationsApiClient;
        }

        public async Task<IActionResult> OnGet(int? pageNumber, string draftSavedId, string publishedId)
        {
            PagedQueryOptions pagedQueryOptions = new PagedQueryOptions()
            {
                Page = 1,
                PageSize = 50
            };

            if (pageNumber.HasValue && pageNumber.Value > 0)
            {
                pagedQueryOptions.Page = pageNumber.Value;
            }

            PagedResult<Calculation> calculationsResult = await _calculationsApiClient.GetCalculations(pagedQueryOptions);
            TotalResults = calculationsResult.TotalItems;
            CurrentPage = calculationsResult.PageNumber;
            Calculations = calculationsResult.Items;
            StartItemNumber = ((pagedQueryOptions.Page - 1) * pagedQueryOptions.PageSize) + 1;
            EndItemNumber = StartItemNumber + pagedQueryOptions.PageSize - 1;
            if (EndItemNumber > calculationsResult.TotalItems)
            {
                EndItemNumber = calculationsResult.TotalItems;
            }

            PagerState = new PagerState(pagedQueryOptions.Page, calculationsResult.TotalPages, 4);

            if (!string.IsNullOrWhiteSpace(draftSavedId))
            {
                DraftSavedCalculation = await this._calculationsApiClient.GetCalculationById(draftSavedId);
            }

            if (!string.IsNullOrWhiteSpace(publishedId))
            {
                PublishedCalculation = await this._calculationsApiClient.GetCalculationById(publishedId);
            }

            return Page();
        }
    }
}