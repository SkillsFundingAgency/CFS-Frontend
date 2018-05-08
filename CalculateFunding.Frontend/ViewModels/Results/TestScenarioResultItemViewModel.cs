namespace CalculateFunding.Frontend.ViewModels.Results
{
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.ViewModels.Common;
    using System;

    public class TestScenarioResultItemViewModel : ReferenceViewModel
    {
        public int Failures { get; set; }

        public int Passes { get; set; }

        public int Ignored { get; set; }

        public decimal TestCoverage
        {
            get
            {
                int totalRecords = Passes + Failures + Ignored;
                if (totalRecords == 0)
                {
                    return 0;
                }

                return Math.Round((decimal)(Passes + Failures) / totalRecords * 100, 1);
            }
        }

        public DateTime? LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay
        {
            get
            {
                return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "Unknown";
            }
        }
    }
}
