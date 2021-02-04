using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class AdditionalCalculationViewModel : SearchResultViewModel
    {
        public AdditionalCalculationViewModel(IEnumerable<AdditionalCalculationSearchResultViewModel> results,
            int totalCount,
            int currentPage,
            int totalPages,
            int pageSize,
            int totalErrorCount,
            IEnumerable<SearchFacet> facets)
            : base(totalCount, currentPage)
        {
            Calculations = results;
            PagerState = new PagerState(currentPage, totalPages);
            PageSize = pageSize;

            InitializeStartingAndEndingItemNumbers();
        }

        private void InitializeStartingAndEndingItemNumbers()
        {
            if (TotalResults == 0)
            {
                StartItemNumber = 0;
                EndItemNumber = 0;
            }
            else
            {
                StartItemNumber = ((CurrentPage - 1) * PageSize) + 1;
                EndItemNumber = StartItemNumber + PageSize - 1;
            }

            if (EndItemNumber > Calculations.Count())
            {
                EndItemNumber = Calculations.Count();
            }
        }

        public IEnumerable<AdditionalCalculationSearchResultViewModel> Calculations { get; }

        public int PageSize { get; }

        public int TotalErrorCount { get; set; }

        public IEnumerable<SearchFacet> Facets { get; set; }
    }
}
