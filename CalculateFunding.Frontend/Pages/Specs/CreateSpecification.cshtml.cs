namespace CalculateFunding.Frontend.Pages.Specs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Identity.Authorization.Models;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using CalculateFunding.Common.ApiClient.Policies;
    using PolicyModels = Common.ApiClient.Policies.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;

    public class CreateSpecificationPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CreateSpecificationPageModel(ISpecsApiClient specsClient, IPoliciesApiClient policiesApiClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _policiesApiClient = policiesApiClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        public IEnumerable<SelectListItem> ProviderVersions { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public string FundingPeriodId { get; set; }

        public bool IsAuthorizedToCreate { get; set; }

		[BindProperty]
        public CreateSpecificationViewModel CreateSpecificationViewModel { get; set; }

        public async Task<IActionResult> OnGetAsync(string fundingPeriodId = null, string fundingStreamId = null)
        {
            if (!string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                FundingPeriodId = fundingPeriodId;
            }

            await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(fundingPeriodId), PopulateFundingStreams(fundingStreamId));
			IsAuthorizedToCreate = FundingStreams.Count() != 0;
			return Page();
        }

	    public async Task<IActionResult> OnPostAsync(string fundingPeriodId = null, string fundingStreamId = null)
        {
            if (!ModelState.IsValid)
            {
                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(fundingPeriodId), PopulateFundingStreams(fundingStreamId));
	            IsAuthorizedToCreate = FundingStreams.Count() != 0;
				return Page();
            }

            CreateSpecificationModel specification = _mapper.Map<CreateSpecificationModel>(CreateSpecificationViewModel);

            if (!await _authorizationHelper.DoesUserHavePermission(User, specification.FundingStreamIds, FundingStreamActionTypes.CanCreateSpecification))
            {
                return new ForbidResult();
            }

            ValidatedApiResponse<Specification> result = await _specsClient.CreateSpecification(specification);
            if (result.StatusCode.IsSuccess())
            {
                return Redirect($"/specs/policies/{result.Content.Id}?operationType=SpecificationCreated&operationId={result.Content.Id}");
            }
            else if (result.StatusCode == HttpStatusCode.BadRequest)
            {
                result.AddValidationResultErrors(ModelState);

                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(fundingPeriodId), PopulateFundingStreams(fundingStreamId));

                return Page();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to create specification - result '{result.StatusCode}'");
            }
        }

        private async Task PopulateFundingStreams(string fundingStreamId)
        {
            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = await _policiesApiClient.GetFundingStreams();

            if (fundingStreamsResponse.StatusCode == HttpStatusCode.OK && !fundingStreamsResponse.Content.IsNullOrEmpty())
            {
                IEnumerable<PolicyModels.FundingStream> fundingStreams = await _authorizationHelper.SecurityTrimList(User, fundingStreamsResponse.Content, FundingStreamActionTypes.CanCreateSpecification);

                FundingStreams = fundingStreams.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Selected = m.Id == fundingStreamId
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Funding Streams. Status Code = {fundingStreamsResponse.StatusCode}");
            }
        }

        private async Task PopulateFundingPeriods(string fundingPeriodId)
        {
            ApiResponse<IEnumerable<PolicyModels.Period>> fundingPeriodsResponse = await _policiesApiClient.GetFundingPeriods();

            if (fundingPeriodsResponse.StatusCode == HttpStatusCode.OK && !fundingPeriodsResponse.Content.IsNullOrEmpty())
            {
                IEnumerable<PolicyModels.Period> fundingPeriods = fundingPeriodsResponse.Content;

                FundingPeriods = fundingPeriods.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                    Selected = m.Id == fundingPeriodId
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Funding Streams. Status Code = {fundingPeriodsResponse.StatusCode}");
            }
        }
    }
}