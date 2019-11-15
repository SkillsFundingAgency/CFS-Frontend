using System;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationVersionViewModel
    {
        public int DecimalPlaces { get; set; }

        public string SourceCode { get; set; }

        public int Version { get; set; }

        public DateTime Date { get; set; }

        public ReferenceViewModel Author { get; set; }

        public string Status { get; set; }
    }
}
