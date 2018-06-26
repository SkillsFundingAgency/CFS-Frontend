namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    using System;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class CalculationVersionViewModel
    {
        public int DecimalPlaces { get; set; }

        public string SourceCode { get; set; }

        public string Version { get; set; }

        public DateTime Date { get; set; }

        public ReferenceViewModel Author { get; set; }

        public string Status { get; set; }
    }
}
