using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;

namespace CalculateFunding.Frontend.Interfaces
{
    public interface ITemplateBuilderApiClient
    {
        Task<ApiResponse<string>> CreateDraftTemplate(TemplateCreateCommand command);
    }
}