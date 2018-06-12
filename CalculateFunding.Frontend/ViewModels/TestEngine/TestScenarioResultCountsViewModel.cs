using CalculateFunding.Frontend.Helpers;
using System;

namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    public class TestScenarioResultCountsViewModel : ResultCountsViewModel
    {
        public string TestScenarioId { get; set; }

        public string TestScenarioName { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay
        {
            get
            {
                return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString(FormatStrings.DateTimeFormatString) : "";
            }
        }
    }
}
