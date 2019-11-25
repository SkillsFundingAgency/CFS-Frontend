using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Calculations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Calculation = CalculateFunding.Common.ApiClient.Calcs.Models.Calculation;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class EditTemplateCalculationPageModel : PageModel
    {
        private readonly ISpecificationsApiClient _specsClient;
        private readonly ICalculationsApiClient _calcClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;
        private readonly IResultsApiClient _resultsApiClient;
        private readonly IPoliciesApiClient _policiesApiClient;

        public EditTemplateCalculationPageModel(ISpecificationsApiClient specsClient,
            ICalculationsApiClient calcClient,
            IMapper mapper,
            IFeatureToggle features,
            IAuthorizationHelper authorizationHelper,
            IResultsApiClient resultsApiClient,
            IPoliciesApiClient policiesApiClient)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(features, nameof(features));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));

            _specsClient = specsClient;
            _calcClient = calcClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
            _resultsApiClient = resultsApiClient;
            ShouldNewEditCalculationPageBeEnabled = features.IsNewEditCalculationPageEnabled();
            _policiesApiClient = policiesApiClient;
        }

        public bool ShouldNewEditCalculationPageBeEnabled { get; private set; }

        public CalculationViewModel Calculation { get; set; }

        public CalculationEditViewModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public string FundingStreamName { get; set; }

        public string FundingStreamId { get; set; }

        public string FundingPeriodName { get; set; }

        public string SpecificationName { get; set; }

        public string DoesUserHavePermissionToApproveOrEdit { get; set; }

        public bool CalculationHasResults { get; set; }

        public string FundingLineName { get; set; }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult(ErrorMessages.CalculationIdNullOrEmpty);
            }

            try
            {
                await GetCalculation(calculationId);
            }
            catch (HttpCallException hex)
            {
                return (hex.StatusCode == HttpStatusCode.NotFound)
                    ? new NotFoundObjectResult(hex.Message)
                    : new ObjectResult(hex.Message) { StatusCode = (int)HttpStatusCode.InternalServerError };
            }

            ViewData["GreyBackground"] = ShouldNewEditCalculationPageBeEnabled.ToString();

            bool doesUserHavePermission = await _authorizationHelper.DoesUserHavePermission(User, SpecificationId, SpecificationActionTypes.CanEditCalculations);

            DoesUserHavePermissionToApproveOrEdit = doesUserHavePermission.ToString().ToLowerInvariant();

            await HandleSpecificationSummary(SpecificationId);

            await EnableEditCalculationPage(ShouldNewEditCalculationPageBeEnabled, Calculation.Id);

            return Page();
        }

        public async Task GetCalculation(string calculationId)
        {
            ApiResponse<Calculation> calculationResponse = await _calcClient.GetCalculationById(calculationId);

            if (calculationResponse == null || calculationResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new HttpCallException(calculationResponse?.StatusCode ?? HttpStatusCode.NotFound, ErrorMessages.CalculationNotFoundInCalcsService);
            }

            Calculation calculation = calculationResponse.Content;

            SpecificationId = calculation.SpecificationId;
            Calculation = _mapper.Map<CalculationViewModel>(calculation);
            EditModel = _mapper.Map<CalculationEditViewModel>(calculation);
        }

        public async Task<bool> EnableEditCalculationPage(bool shouldNewEditCalculationPageBeEnabled, string calculationId)
        {
            if (!shouldNewEditCalculationPageBeEnabled) return false;

            ApiResponse<bool> hasCalculationResponse = await _resultsApiClient.HasCalculationResults(calculationId);

            if (hasCalculationResponse != null && hasCalculationResponse.StatusCode == HttpStatusCode.OK)
            {
                return hasCalculationResponse.Content;
            }

            return false;
        }

        public async Task HandleSpecificationSummary(string specificationId)
        {
            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(specificationId);

            if (specificationResponse?.StatusCode != HttpStatusCode.OK)
            {
	            throw new Exception($"Bad response received from specification API: {specificationResponse?.StatusCode.ToString() ?? "No response"}");
            }

            SpecificationName = specificationResponse.Content.Name;
            FundingStreamName = specificationResponse.Content.FundingStreams.FirstOrDefault()?.Name;
            FundingStreamId = specificationResponse.Content.FundingStreams.FirstOrDefault()?.Id;
            FundingPeriodName = specificationResponse.Content.FundingPeriod.Name;

            string templateVersion = specificationResponse.Content.TemplateIds[FundingStreamId];

            ApiResponse<TemplateMetadataContents> templateMetadataContentsResponse = await _policiesApiClient.GetFundingTemplateContents(FundingStreamId, templateVersion);

            if (templateMetadataContentsResponse == null || !templateMetadataContentsResponse.StatusCode.IsSuccess())
            {
                throw new Exception($"Bad response received from policies API: {templateMetadataContentsResponse?.StatusCode.ToString() ?? "No response"}");
            }

            TemplateMetadataContents templateMetadataContents = templateMetadataContentsResponse.Content;

            var templateMappingResponse = await _calcClient.GetTemplateMapping(specificationId, FundingStreamId);
            
            if (templateMappingResponse == null || !templateMappingResponse.StatusCode.IsSuccess())
            {
                throw new Exception($"Bad response received from calcs API: {templateMappingResponse?.StatusCode.ToString() ?? "No response"}");
            }

            TemplateMapping mapping = templateMappingResponse.Content;

            uint templateId = mapping.TemplateMappingItems.SingleOrDefault(x => x.CalculationId == Calculation.Id).TemplateId;

            FundingLineName = templateMetadataContents
                .RootFundingLines
                .Flatten(f => f.FundingLines)
                .FirstOrDefault(f =>
                    f.Calculations
                    .FlattenDepthFirst()
                    .FirstOrDefault(c => c.TemplateCalculationId == templateId) != null).Name;
        }
    }
}