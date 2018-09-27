using System.Globalization;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class AllocationLineResult
    {
        public string AllocationLine { get; set; }

        public double? SubTotal { get; set; }

        public string TotalFormatted
        {
            get
            {
                if (SubTotal.HasValue)
                {
                    return SubTotal.Value.ToString("C", new CultureInfo("en-GB"));
                }
                else
                {
                    return Properties.PageText.ExcludedText;
                }
            }
        }
    }
}
