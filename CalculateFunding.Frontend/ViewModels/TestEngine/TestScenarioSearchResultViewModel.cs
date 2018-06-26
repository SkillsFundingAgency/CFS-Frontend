using CalculateFunding.Frontend.ViewModels.Common;
using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    public class TestScenarioSearchResultViewModel : SearchResultViewModel
    {
        public TestScenarioSearchResultViewModel()
        {
            TestScenarios = Enumerable.Empty<TestScenarioSearchResultItemViewModel>();
        }
        public IEnumerable<TestScenarioSearchResultItemViewModel> TestScenarios { get; set; }
    }
}
