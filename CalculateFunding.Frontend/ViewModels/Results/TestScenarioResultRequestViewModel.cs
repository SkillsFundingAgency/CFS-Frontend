using System.Collections.Generic;

namespace CalculateFunding.Frontend.ViewModels.Results
{
    public class TestScenarioResultRequestViewModel 
    {
        public string PeriodId { get; set; }

        public int? PageNumber { get; set; }

        public string SearchTerm { get; set; }

        public IDictionary<string, string[]> Filters { get; set; }

        /// <summary>
        /// Selected Specification ID
        /// </summary>
        public string SpecificationId { get; set; }
    }
}
