namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.PreviewClient.Models;

    public interface IPreviewApiClient
    {
        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);
    }
}
