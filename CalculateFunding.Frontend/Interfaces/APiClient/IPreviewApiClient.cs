using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.APiClient
{
    public interface IPreviewApiClient
    {
        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);
    }
}
