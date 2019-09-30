﻿using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class EditAdditionalCalculationPageModel : PageModel
    {
        private ISpecificationsApiClient _specsClient;
        private ICalculationsApiClient _calcClient;
        private IMapper _mapper;

        public EditAdditionalCalculationPageModel(ISpecificationsApiClient specsClient, ICalculationsApiClient calcClient, IMapper mapper, IFeatureToggle features)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(calcClient, nameof(calcClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(features, nameof(features));

            _specsClient = specsClient;
            _calcClient = calcClient;
            _mapper = mapper;
            ShouldNewEditCalculationPageBeEnabled = features.IsNewEditCalculationPageEnabled();
        }

        public bool ShouldNewEditCalculationPageBeEnabled { get; private set; }

        public Calculation Calculation { get; set; }

        public CalculationEditModel EditModel { get; set; }

        public string SpecificationId { get; set; }

        public string VariablesJson { get; set; }

        public string SpecificationName { get; set; }

        public string DoesUserHavePermissionToApproveOrEdit { get; set; }

        public bool CalculationHasResults { get; set; }

		public Reference FundingPeriod { get; set; }

        public string FundingStreams { get; set; }

        public async Task<IActionResult> OnGet(string calculationId)
        {
            if (string.IsNullOrWhiteSpace(calculationId))
            {
                return new BadRequestObjectResult("Specification not found");
            }

            ViewData["GreyBackground"] = ShouldNewEditCalculationPageBeEnabled.ToString();

            var calculationResponse = await _calcClient.GetCalculationById(calculationId);

            Calculation = calculationResponse.Content;

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(Calculation.SpecificationId);

            SpecificationId = specificationResponse.Content.Id;

            FundingStreams = JsonConvert.SerializeObject(specificationResponse.Content.FundingStreams);

            FundingPeriod = specificationResponse.Content.FundingPeriod;

            if (specificationResponse != null && specificationResponse.StatusCode == HttpStatusCode.OK)
            {
                SpecificationName = specificationResponse.Content.Name;
            }
            else
            {
                SpecificationName = "Unknown";
            }
       
            return Page();
        }
    }
}