using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationDifferenceViewModel
    {
        public IEnumerable<CalculationViewModel> CalculationVersions { get; set; }
    }
}
