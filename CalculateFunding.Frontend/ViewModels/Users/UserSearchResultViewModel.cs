using System.Collections.Generic;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.ViewModels.Users
{
    public class UserSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<UserSearchResultItemViewModel> Users { get; set; }
    }
}
