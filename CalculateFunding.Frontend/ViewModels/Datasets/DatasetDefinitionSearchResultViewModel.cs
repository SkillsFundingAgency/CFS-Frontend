namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class DatasetDefinitionSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<DatasetDefinitionSearchResultItemViewModel> DatasetDefinitions { get; set; }
    }
}
