using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ViewModels.Calculations;

namespace CalculateFunding.Frontend.Services
{
    public interface ICalculationSearchService
    {
        Task<CalculationSearchResultViewModel> PerformSearch(CalculationSearchRequestViewModel request);
    }
}
