namespace CalculateFunding.Frontend.ViewModels.Users
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.ViewModels.Common;

    public class UserSearchResultViewModel : SearchResultViewModel
    {
        public IEnumerable<UserSearchResultItemViewModel> Users { get; set; }
    }
}
