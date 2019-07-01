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

        public string DateClosed { get; set; }

        public string TrustStatus { get; set; }

        public string Successor { get; set; }

        public string ReasonEstablishmentClosed { get; set; }

        public string ReasonEstablishmentOpened { get; set; }

        public string PhaseOfEducation { get; set; }

        public string Status { get; set; }

        public string LegalName { get; set; }

        public string CrmAccountId { get; set; }

        public string NavVendorNo { get; set; }

        public string LaCode { get; set; }

        public string ProviderProfileIdType { get; set; }

        public string DfeEstablishmentNumber { get; set; }

        public string EstablishmentNumber { get; set; }

        public string TrustName { get; set; }

        public string TrustCode { get; set; }

        public string TotalDescription { get; set; }

        public double? Total
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
                if (Total.HasValue)
                {
                    return Total.Value.ToString("C", new CultureInfo("en-GB"));
                }
                else
                {
                    return Properties.PageText.ExcludedText;
                }
            }
        }

        public IEnumerable<AllocationLineResult> AllocationLineItems { get; set; }

        public IEnumerable<CalculationItemResult> CalculationItems { get; set; }

        public IEnumerable<ScenarioItemResult> ScenarioItems { get; set; }
    }
}
