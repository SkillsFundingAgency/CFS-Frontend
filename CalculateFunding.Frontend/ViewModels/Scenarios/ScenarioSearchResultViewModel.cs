namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class ScenarioSearchResultViewModel : SearchResultViewModel
    {
        public ScenarioSearchResultViewModel()
        {
            Scenarios = Enumerable.Empty<ScenarioSearchResultItemViewModel>();        
        }

        public IEnumerable<ScenarioSearchResultItemViewModel> Scenarios { get; set; }
    }
}
