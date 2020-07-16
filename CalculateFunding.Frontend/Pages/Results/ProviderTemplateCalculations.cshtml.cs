using System;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;

namespace CalculateFunding.Frontend.Pages.Results
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Serilog;

    public class ProviderTemplateCalculationsPageModel : ProviderResultsBasePageModel
    {
        private ILogger _logger;
        private ICalculationsApiClient _calculationsApiClient;
        private IResultsApiClient _resultsApiClient;
        public List<ProviderCalculationItemViewModel> TemplateCalculationList;

        public ProviderTemplateCalculationsPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, IMapper mapper, ISpecificationsApiClient specsApiClient, ILogger logger, ICalculationsApiClient calculationsApiClient)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
            _logger = logger;
            _calculationsApiClient = calculationsApiClient;
            _resultsApiClient = resultsApiClient;
        }

        public override async Task<ApiResponse<ProviderResult>> GetProviderResult(string providerId, string specificationId)
        {
            return await _resultsApiClient.GetProviderResultByCalculationTypeTemplate(providerId, specificationId);
        }

        public override Task PopulateResults(ApiResponse<ProviderResult> providerResponse)
        {
            TemplateCalculationList = new List<ProviderCalculationItemViewModel>();

            foreach (CalculationResult calculationResultItem in providerResponse.Content.CalculationResults)
            {
                ApiResponse<Calculation> calculation = _calculationsApiClient.GetCalculationById(calculationResultItem.Calculation.Id).Result;

                TemplateCalculationList.Add(new ProviderCalculationItemViewModel
                {
                    Name = calculationResultItem.Calculation.Name,
                    ExceptionMessage = calculationResultItem.ExceptionMessage,
                    ExceptionType = calculationResultItem.ExceptionType,
                    ValueType = calculation.Content.ValueType.ToString(),
                    Value = calculationResultItem.Value as Nullable<Decimal>
                });
            }

			return Task.CompletedTask;
        }
    }
}