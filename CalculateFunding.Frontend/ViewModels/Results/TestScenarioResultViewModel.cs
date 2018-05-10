
namespace CalculateFunding.Frontend.ViewModels.Results
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using System.Collections.Generic;
    using System.Linq;

    public class TestScenarioResultViewModel : SearchResultViewModel
    {
        public TestScenarioResultViewModel()
        {
            TestResults = Enumerable.Empty<TestScenarioResultItemViewModel>();
        }
        public IEnumerable<TestScenarioResultItemViewModel> TestResults { get; set; }

        public IEnumerable<ReferenceViewModel> Specifications { get; set; }

        public string FundingPeriodId { get; set; }
    }
}
