namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class ProviderTestsSearchResultViewModel : SearchResultViewModel
    {
        public ProviderTestsSearchResultViewModel()
        {
            Providers = Enumerable.Empty<ProviderTestSearchResultItemViewModel>();
        }

        public IEnumerable<ProviderTestSearchResultItemViewModel> Providers { get; set; }
    }
}
