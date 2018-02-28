using System.Globalization;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class CalculationItemResult
    {
        public string Calculation { get; set; }

        public double SubTotal { get; set; }

        public string TotalFormatted
        {
            get
            {
                return SubTotal.ToString("C", new CultureInfo("en-GB"));
            }
        }
    }
}
