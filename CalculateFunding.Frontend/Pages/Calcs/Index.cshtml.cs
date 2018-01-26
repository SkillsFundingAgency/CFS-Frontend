using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Paging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Serilog;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class IndexPageModel : PageModel
    {
        private ICalculationsApiClient _calculationsApiClient;
        private ILogger _logger;

        public int TotalResults { get; set; }

        public int CurrentPage { get; set; }

        public int StartItemNumber { get; set; }

        public int EndItemNumber { get; set; }

        public IEnumerable<CalculationSearchResultItem> Calculations { get; set; }

        public PagerState PagerState { get; set; }

        public Calculation DraftSavedCalculation { get; set; }

        public Calculation PublishedCalculation { get; set; }


        public IndexPageModel(ICalculationsApiClient calculationsApiClient, ILogger logger)
        {
            Guard.ArgumentNotNull(calculationsApiClient, nameof(calculationsApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _calculationsApiClient = calculationsApiClient;
            _logger = logger;
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

            PagedResult<CalculationSearchResultItem> calculationsResult = await _calculationsApiClient.FindCalculations(pagedQueryOptions);
            if (calculationsResult == null)
            {
                _logger.Error("Find calculations HTTP request failed");
                return new StatusCodeResult(500);
            }

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
                DraftSavedCalculation = (await this._calculationsApiClient.GetCalculationById(draftSavedId)).Content;
            }

            if (!string.IsNullOrWhiteSpace(publishedId))
            {
                PublishedCalculation = (await this._calculationsApiClient.GetCalculationById(publishedId)).Content;
            }

            return Page();
        }
    }
}