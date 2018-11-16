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
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;

    public class CreateSpecificationPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public CreateSpecificationPageModel(ISpecsApiClient specsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public string FundingPeriodId { get; set; }

        [BindProperty]
        public CreateSpecificationViewModel CreateSpecificationViewModel { get; set; }

        public async Task<IActionResult> OnGetAsync(string fundingPeriodId = null)
        {
            if (!string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                FundingPeriodId = fundingPeriodId;
            }

            await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(fundingPeriodId), PopulateFundingStreams());

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string fundingPeriodId = null)
        {
            if (!ModelState.IsValid)
            {
                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(fundingPeriodId), PopulateFundingStreams());
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

                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(fundingPeriodId), PopulateFundingStreams());

                return Page();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to create specification - result '{result.StatusCode}'");
            }
        }

        private async Task PopulateFundingStreams()
        {
            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = await _specsClient.GetFundingStreams();

            if (fundingStreamsResponse.StatusCode == HttpStatusCode.OK && !fundingStreamsResponse.Content.IsNullOrEmpty())
            {
                IEnumerable<FundingStream> fundingStreams = await _authorizationHelper.SecurityTrimList(User, fundingStreamsResponse.Content, FundingStreamActionTypes.CanCreateSpecification);

                FundingStreams = fundingStreams.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name
                }).ToList();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Funding Streams. Status Code = {fundingStreamsResponse.StatusCode}");
            }
        }

        private async Task PopulateFundingPeriods(string fundingPeriodId)
        {
            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = await _specsClient.GetFundingPeriods();

            if (fundingPeriodsResponse.StatusCode == HttpStatusCode.OK && !fundingPeriodsResponse.Content.IsNullOrEmpty())
            {
                IEnumerable<Reference> fundingPeriods = fundingPeriodsResponse.Content;

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