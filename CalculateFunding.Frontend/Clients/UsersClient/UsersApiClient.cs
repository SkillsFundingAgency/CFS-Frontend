using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.UsersClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.UsersClient
{
    public class UsersApiClient : BaseApiClient, IUsersApiClient
    {
        public UsersApiClient(IHttpClientFactory httpClientFactory, ILogger logger)
           : base(httpClientFactory, HttpClientKeys.Users, logger)
        {
        }

        public Task<ApiResponse<User>> GetUserByUsername(string username)
        {
            Guard.IsNullOrWhiteSpace(username, nameof(username));

            return GetAsync<User>($"get-user-by-username?username={username}");
        }

        public Task<HttpStatusCode> ConfirmSkills(string username)
        {
            Guard.IsNullOrWhiteSpace(username, nameof(username));

            return PostAsync($"confirm-skills?username={username}");
        }
    }
}
