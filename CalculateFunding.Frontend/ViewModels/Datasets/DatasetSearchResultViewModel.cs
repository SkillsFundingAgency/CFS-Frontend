namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class DatasetSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<DatasetSearchResultItemViewModel> Datasets { get; set; }
    }
}
