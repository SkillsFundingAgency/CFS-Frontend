using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface ICalculationsApiClient
    {
        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);

        Task<PagedResult<Calculation>> GetCalculations(PagedQueryOptions queryOptions);
        Task<Calculation> GetCalculationById(string draftSavedId);
    }
}