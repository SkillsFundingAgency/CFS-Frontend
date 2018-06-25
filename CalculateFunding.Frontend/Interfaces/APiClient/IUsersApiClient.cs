using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.UsersClient.Models;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.APiClient
{
    public interface IUsersApiClient
    {
        Task<ApiResponse<User>> GetUserByUsername(string username);

        Task<HttpStatusCode> ConfirmSkills(string username);
    }
}
