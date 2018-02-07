using System.Collections.Generic;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<CalculationSearchResultItemViewModel> Calculations { get; set; }
    }
}
