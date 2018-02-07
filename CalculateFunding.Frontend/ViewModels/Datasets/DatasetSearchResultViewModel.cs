using System.Collections.Generic;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class DatasetSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<DatasetSearchResultItemViewModel> Datasets { get; set; }
    }
}
