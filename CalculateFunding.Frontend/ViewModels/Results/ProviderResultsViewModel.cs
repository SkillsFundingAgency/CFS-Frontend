using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class ProviderResultsViewModel
    {
        public ProviderResultsViewModel()
        {
            AllocationLineItems = Enumerable.Empty<AllocationLineResult>();

            CalculationItems = Enumerable.Empty<CalculationItemResult>();
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
                return Total.ToString("C");
            }
        }

        public IEnumerable<AllocationLineResult> AllocationLineItems { get; set; }

        public IEnumerable<CalculationItemResult> CalculationItems { get; set; }
    }

    public class AllocationLineResult
    {
        public string AllocationLine { get; set; }

        public double SubTotal { get; set; }

        public string TotalFormatted
        {
            get
            {
                return SubTotal.ToString("C");
            }
        }
    }

    public class CalculationItemResult
    {
        public string Calculation { get; set; }

        public double SubTotal { get; set; }

        public string TotalFormatted
        {
            get
            {
                return SubTotal.ToString("C");
            }
        }
    }
}
