using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface IPreviewApiClient
    {
        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);
    }
}
