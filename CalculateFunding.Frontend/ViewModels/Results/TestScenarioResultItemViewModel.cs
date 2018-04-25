namespace CalculateFunding.Frontend.ViewModels.Results
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using System;

    public class TestScenarioResultItemViewModel : ReferenceViewModel
    {
        public int Failures { get; set; }

        public int Passes { get; set; }

        public DateTime? LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay
        {
            get
            {
                return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString("dd/MM/yyyy  hh:mm:ss") : "Unknown";
            }
        }
    }
}
