using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.UsersClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace CalculateFunding.Frontend.Clients.UsersClient
{
    public class UsersApiClient : BaseApiClient, IUsersApiClient
    {
        public UsersApiClient(IHttpClientFactory httpClientFactory, ILogger logger, IHttpContextAccessor contextAccessor)
           : base(httpClientFactory, HttpClientKeys.Users, logger, contextAccessor)
        {
        }

        public async Task<ApiResponse<User>> GetUserByUserId(string userId)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));

            return await GetAsync<User>($"get-user-by-userid?userId={userId}");
        }

        public async Task<ValidatedApiResponse<User>> ConfirmSkills(string userId, UserConfirmModel userConfirmModel)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));

            return await ValidatedPostAsync<User, UserConfirmModel>($"confirm-skills?userId={userId}", userConfirmModel);
        }
    }
}
