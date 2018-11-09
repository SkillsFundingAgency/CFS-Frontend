using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.UsersClient.Models;
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

        public async Task<ApiResponse<IEnumerable<FundingStreamPermission>>> GetFundingStreamPermissionsForUser(string userId)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));

            return await GetAsync<IEnumerable<FundingStreamPermission>>($"{userId}/permissions");
        }

        public async Task<ApiResponse<EffectiveSpecificationPermission>> GetEffectivePermissionsForUser(string userId, string specificationId)
        {
            Guard.IsNullOrWhiteSpace(userId, nameof(userId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await GetAsync<EffectiveSpecificationPermission>($"{userId}/effectivepermissions/{specificationId}");
        }
    }
}
