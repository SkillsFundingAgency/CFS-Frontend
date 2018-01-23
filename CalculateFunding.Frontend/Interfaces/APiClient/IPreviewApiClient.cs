using CalculateFunding.Frontend.Clients;
using CalculateFunding.Frontend.Clients.PreviewClient.Models;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface IPreviewApiClient
    {
        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);
    }
}
