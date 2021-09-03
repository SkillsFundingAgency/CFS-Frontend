namespace CalculateFunding.Frontend.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Users;

    public interface IUserSearchService
    {
        Task<UserSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}