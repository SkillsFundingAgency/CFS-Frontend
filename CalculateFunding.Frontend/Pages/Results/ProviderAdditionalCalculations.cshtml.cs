namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Calcs;
    using CalculateFunding.Common.ApiClient.Calcs.Models;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using Serilog;
    using System.Collections.Generic;


    public class ProviderAdditionalCalculationsPageModel : ProviderResultsBasePageModel
    {
        private ILogger _logger;
        private ICalculationsApiClient _calculationsApiClient;
        public List<ProviderCalculationItemViewModel> AdditionalCalculationList;


        public ProviderAdditionalCalculationsPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger, ICalculationsApiClient calculationsApiClient)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
	        _logger = logger;
	        _calculationsApiClient = calculationsApiClient;
        }

        public override void PopulateResults(ApiResponse<ProviderResults> providerResponse)
        {
			AdditionalCalculationList =new List<ProviderCalculationItemViewModel>();

			foreach (var calculationResultItem in providerResponse.Content.CalculationResults)
			{
				if (calculationResultItem.CalculationType == CalculationSpecificationType.Additional)
				{
					var calculation = _calculationsApiClient.GetCalculationById(calculationResultItem.Calculation.Id).Result;
					
					AdditionalCalculationList.Add(new ProviderCalculationItemViewModel
					{
						Name = calculationResultItem.Calculation.Name,
						ValueType = calculation.Content.Current.ValueType.ToString(),
						Value = calculationResultItem.Value
					});
				}
			}
        }
    }
}