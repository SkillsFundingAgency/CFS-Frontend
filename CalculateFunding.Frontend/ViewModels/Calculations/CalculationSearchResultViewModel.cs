namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class CalculationSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<CalculationSearchResultItemViewModel> Calculations { get; set; }
    }
}
