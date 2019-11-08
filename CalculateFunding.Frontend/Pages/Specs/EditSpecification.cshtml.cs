using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Properties;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using PolicyModels = CalculateFunding.Common.ApiClient.Policies.Models;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class EditSpecificationPageModel : PageModel
    {
        private readonly ISpecificationsApiClient _specsClient;
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public EditSpecificationPageModel(ISpecificationsApiClient specsClient, IPoliciesApiClient policiesApiClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
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

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public IEnumerable<SelectListItem> FundingStreams { get; set; }

        [BindProperty]
        public EditSpecificationViewModel EditSpecificationViewModel { get; set; }

        public bool IsAuthorizedToEdit { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummaryById(specificationId);

            if (specificationResponse.StatusCode != HttpStatusCode.OK)
            {
                return new ObjectResult($"Unable to retreive specification. Status Code = {specificationResponse.StatusCode}")
                { StatusCode = (int)specificationResponse.StatusCode };
            }
            if (specificationResponse.Content == null)
            {
                return new InternalServerErrorResult($"Blank specification returned");
            }

            EditSpecificationViewModel = _mapper.Map<EditSpecificationViewModel>(specificationResponse.Content);

            IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User,
                specificationResponse.Content, SpecificationActionTypes.CanEditSpecification);

            EditSpecificationViewModel.OriginalSpecificationName = specificationResponse.Content.Name;
            EditSpecificationViewModel.OriginalFundingStreamId = string.Join(",", EditSpecificationViewModel.FundingStreamId);
            EditSpecificationViewModel.OriginalFundingPeriodId = EditSpecificationViewModel.FundingPeriodId;

            await PopulateFundingStreams(EditSpecificationViewModel.FundingStreamId);

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId = null, [FromQuery] EditSpecificationRedirectAction returnPage = EditSpecificationRedirectAction.ManagePolicies)
        {
            IsAuthorizedToEdit = await _authorizationHelper.DoesUserHavePermission(User, EditSpecificationViewModel, SpecificationActionTypes.CanEditSpecification);

            if (!IsAuthorizedToEdit)
            {
                return new ForbidResult();
            }

            if (!string.IsNullOrWhiteSpace(EditSpecificationViewModel.Name) && EditSpecificationViewModel.Name != EditSpecificationViewModel.OriginalSpecificationName)
            {
                ApiResponse<SpecificationSummary> existingSpecificationResponse = await this._specsClient.GetSpecificationByName(EditSpecificationViewModel.Name);

                if (existingSpecificationResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.Name)}", ValidationMessages.SpecificationAlreadyExists);
                }
            }

            if (EditSpecificationViewModel.IsSelectedForFunding)
            {
                ModelState.Remove($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.FundingPeriodId)}");
                ModelState.Remove($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.FundingStreamId)}");

                EditSpecificationViewModel.FundingPeriodId = EditSpecificationViewModel.OriginalFundingPeriodId;
                EditSpecificationViewModel.FundingStreamId = EditSpecificationViewModel.OriginalFundingStreamId;
            }

            if (!ModelState.IsValid)
            {
                await PopulateFundingStreams(EditSpecificationViewModel.FundingStreamId);
                return Page();
            }

            EditSpecificationModel specification = _mapper.Map<EditSpecificationModel>(EditSpecificationViewModel);

            ValidatedApiResponse<SpecificationSummary> editResult = await _specsClient.UpdateSpecification(specificationId, specification);
            if (editResult.StatusCode == HttpStatusCode.OK)
            {
                return Redirect($"/specs/fundinglinestructure/{specificationId}?operationType=SpecificationUpdated&operationId={specificationId}");
            }
            else if (editResult.StatusCode == HttpStatusCode.BadRequest)
            {
                editResult.AddValidationResultErrors(ModelState);

                await PopulateFundingStreams(EditSpecificationViewModel.FundingStreamId);
                return Page();
            }
            else
            {
                return new InternalServerErrorResult($"Unable to update specification. API returned '{editResult?.StatusCode}'");
            }
        }

        private async Task PopulateFundingStreams(string fundingStreamId)
        {
            ApiResponse<IEnumerable<PolicyModels.FundingStream>> fundingStreamsResponse = await _policiesApiClient.GetFundingStreams();

            if (fundingStreamsResponse == null)
            {
                throw new InvalidOperationException($"Null funding streams response returned");
            }

            if (fundingStreamsResponse.StatusCode == HttpStatusCode.OK && !fundingStreamsResponse.Content.IsNullOrEmpty())
            {
                // Need to make sure existing funding stream ids on the spec are still included on the list to display in the list as the security trimmed list is based on Create permission not Edit
                IEnumerable<PolicyModels.FundingStream> existingFundingStreams = fundingStreamsResponse.Content.Where(fs => fs.Id == fundingStreamId);
                IEnumerable<PolicyModels.FundingStream> trimmedResults = await _authorizationHelper.SecurityTrimList(User, fundingStreamsResponse.Content, FundingStreamActionTypes.CanCreateSpecification);

                IEnumerable<PolicyModels.FundingStream> fundingStreams = trimmedResults.Union(existingFundingStreams, new PolicyModels.FundingStreamComparer());
                IEnumerable<SelectListItem> fundingStreamListItems = fundingStreams.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                }).ToList();

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

    }
}