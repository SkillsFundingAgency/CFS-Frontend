using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;

namespace CalculateFunding.Frontend.Interfaces.APiClient
{
    public interface ICalculationsApiClient
    {
        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);
    }
}