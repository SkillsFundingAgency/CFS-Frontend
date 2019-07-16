using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Policies.Models;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Controllers
{
    public class PolicyController : Controller
    {
        private readonly IPoliciesApiClient _policiesApiClient;

        public PolicyController(IPoliciesApiClient policiesApiClient)
        {
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            _policiesApiClient = policiesApiClient;
        }

        [Route("api/policy/fundingperiods")]
        public async Task<IActionResult> GetFundingPeriods()
        {
            ApiResponse<IEnumerable<Period>> response = await _policiesApiClient.GetFundingPeriods();

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return Ok(response.Content);
            }

            throw new InvalidOperationException($"An error occurred while retrieving code context. Status code={response.StatusCode}");
        }
    }
}
