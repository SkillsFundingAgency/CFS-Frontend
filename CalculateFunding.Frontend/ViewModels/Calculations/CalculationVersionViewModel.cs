using System;
using CalculateFunding.Frontend.Clients.Models;

namespace CalculateFunding.Frontend.ViewModels.Calculations
{
    public class CalculationVersionViewModel
    {
        public int DecimalPlaces { set; get; }

        public string SourceCode { set; get; }

        public string Version { get; set; }

        public DateTime Date { get; set; }

        public Reference Author { get; set; }

        public string Status { get; set; }
    }
}
