using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class ProviderResultsViewModel
    {
        public ProviderResultsViewModel()
        {
            AllocationLineItems = Enumerable.Empty<AllocationLineResult>();

            CalculationItems = Enumerable.Empty<CalculationItemResult>();

            ScenarioItems = Enumerable.Empty<ScenarioItemResult>();
        }

        public string ProviderName { get; set; }

        public string ProviderType { get; set; }

        public string ProviderSubtype { get; set; }

        public string LocalAuthority { get; set; }

        public int? Upin { get; set; }

        public int? Ukprn { get; set; }

        public int? Urn { get; set; }

        public string DateOpened { get; set; }

        public string TotalDescription { get; set; }

        public double Total
        {
            get
            {
                if (!AllocationLineItems.IsNullOrEmpty())
                {
                    return AllocationLineItems.Sum(m => m.SubTotal);
                }

                return 0;
            }
        }

        public string TotalFormatted
        {
            get
            {
                return Total.ToString("C", new CultureInfo("en-GB"));
            }
        }

        public IEnumerable<AllocationLineResult> AllocationLineItems { get; set; }

        public IEnumerable<CalculationItemResult> CalculationItems { get; set; }

        public IEnumerable<ScenarioItemResult> ScenarioItems { get; set; }
    }
}
