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
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class EditSpecificationPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public EditSpecificationPageModel(ISpecsApiClient specsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _specsClient = specsClient;
            _mapper = mapper;
            _authorizationHelper = authorizationHelper;
        }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public MultiSelectList FundingStreams { get; set; }

        [BindProperty]
        public EditSpecificationViewModel EditSpecificationViewModel { get; set; }

	    public bool IsAuthorizedToEdit { get; set; }

		public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

            if (specificationResponse.StatusCode == HttpStatusCode.OK && specificationResponse.Content != null)
            {
	            EditSpecificationViewModel = _mapper.Map<EditSpecificationViewModel>(specificationResponse.Content);
	            IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User,
		            specificationResponse.Content, SpecificationActionTypes.CanEditSpecification);

				EditSpecificationViewModel.OriginalSpecificationName = specificationResponse.Content.Name;
                EditSpecificationViewModel.OriginalFundingStreams = string.Join(",", EditSpecificationViewModel.FundingStreamIds);
                EditSpecificationViewModel.OriginalFundingPeriodId = EditSpecificationViewModel.FundingPeriodId;

                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(EditSpecificationViewModel.FundingPeriodId), PopulateFundingStreams(EditSpecificationViewModel.FundingStreamIds));

                return Page();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive specification. Status Code = {specificationResponse.StatusCode}");
            }
        }

        public async Task<IActionResult> OnPostAsync(string specificationId = null, [FromQuery] EditSpecificationRedirectAction returnPage = EditSpecificationRedirectAction.ManagePolicies)
        {
            if (!await _authorizationHelper.DoesUserHavePermission(User, EditSpecificationViewModel, SpecificationActionTypes.CanEditSpecification))
            {
                return new ForbidResult();
            }

            if (!string.IsNullOrWhiteSpace(EditSpecificationViewModel.Name) && EditSpecificationViewModel.Name != EditSpecificationViewModel.OriginalSpecificationName)
            {
                ApiResponse<Specification> existingSpecificationResponse = await this._specsClient.GetSpecificationByName(EditSpecificationViewModel.Name);

                if (existingSpecificationResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.Name)}", ValidationMessages.SpecificationAlreadyExists);
                }
            }

            if (EditSpecificationViewModel.IsSelectedForFunding)
            {
                ModelState.Remove($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.FundingPeriodId)}");
                ModelState.Remove($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.FundingStreamIds)}");

                EditSpecificationViewModel.FundingPeriodId = EditSpecificationViewModel.OriginalFundingPeriodId;
                EditSpecificationViewModel.FundingStreamIds = EditSpecificationViewModel.OriginalFundingStreams.Split(",").ToArraySafe();
            }

            if (!ModelState.IsValid)
            {
                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(EditSpecificationViewModel.FundingPeriodId), PopulateFundingStreams(EditSpecificationViewModel.FundingStreamIds));
                return Page();
            }

            EditSpecificationModel specification = _mapper.Map<EditSpecificationModel>(EditSpecificationViewModel);

            HttpStatusCode editResult = await _specsClient.UpdateSpecification(specificationId, specification);
            if (editResult == HttpStatusCode.OK)
            {
                if (returnPage == EditSpecificationRedirectAction.ManagePolicies)
                {
                    return Redirect($"/specs/policies/{specificationId}?operationType=SpecificationUpdated&operationId={specificationId}");
                }
                else
                {
                    return Redirect($"/specs?operationType=SpecificationUpdated&operationId={specificationId}");
                }
            }
            else
            {
                return new InternalServerErrorResult($"Unable to update specification. API returned '{editResult}'");
            }
        }

        private async Task PopulateFundingStreams(IEnumerable<string> fundingStreamIds)
        {
            ApiResponse<IEnumerable<FundingStream>> fundingStreamsResponse = await _specsClient.GetFundingStreams();

            if (fundingStreamsResponse == null)
            {
                throw new InvalidOperationException($"Null funding streams response returned");
            }

            if (fundingStreamsResponse.StatusCode == HttpStatusCode.OK && !fundingStreamsResponse.Content.IsNullOrEmpty())
            {
                // Need to make sure existing funding stream ids on the spec are still included on the list to display in the list as the security trimmed list is based on Create permission not Edit
                IEnumerable<FundingStream> existingFundingStreams = fundingStreamsResponse.Content.Where(fs => fundingStreamIds.Contains(fs.Id));
                IEnumerable<FundingStream> trimmedResults = await _authorizationHelper.SecurityTrimList(User, fundingStreamsResponse.Content, FundingStreamActionTypes.CanCreateSpecification);

                IEnumerable<FundingStream> fundingStreams = trimmedResults.Union(existingFundingStreams, new FundingStreamComparer());
                IEnumerable <SelectListItem> fundingStreamListItems = fundingStreams.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                }).ToList();

                FundingStreams = new MultiSelectList(fundingStreamListItems, "Value", "Text", fundingStreamIds);
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive Funding Streams. Status Code = {fundingStreamsResponse.StatusCode}");
            }
        }

        private async Task PopulateFundingPeriods(string fundingPeriodId)
        {
            ApiResponse<IEnumerable<Reference>> fundingPeriodsResponse = await _specsClient.GetFundingPeriods();

            if (fundingPeriodsResponse == null)
            {
                throw new InvalidOperationException($"Null funding periods response returned");
            }

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