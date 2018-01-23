using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationViewModel
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string PeriodName { get; set; }

        public string Status { get; set; }

        public DateTime LastModified { get; set; }

        public string LastModifiedBy { get; set; }
    }
}
