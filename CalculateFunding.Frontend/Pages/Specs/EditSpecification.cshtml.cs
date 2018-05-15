using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
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

        public EditSpecificationPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
            _mapper = mapper;
        }

        public IEnumerable<SelectListItem> FundingPeriods { get; set; }

        public MultiSelectList FundingStreams { get; set; }

        [BindProperty]
        public EditSpecificationViewModel EditSpecificationViewModel { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<Specification> specificationResponse = await _specsClient.GetSpecification(specificationId);

            if (specificationResponse.StatusCode == HttpStatusCode.OK && specificationResponse.Content != null)
            {
                EditSpecificationViewModel = _mapper.Map<EditSpecificationViewModel>(specificationResponse.Content);
                EditSpecificationViewModel.OriginalSpecificationName = specificationResponse.Content.Name;
                EditSpecificationViewModel.OriginalFundingStreams = string.Join(",", EditSpecificationViewModel.FundingStreamIds);

                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(EditSpecificationViewModel.FundingPeriodId), PopulateFundingStreams(EditSpecificationViewModel.FundingStreamIds));

                return Page();
            }
            else
            {
                throw new InvalidOperationException($"Unable to retreive specification. Status Code = {specificationResponse.StatusCode}");
            }
        }

        public async Task<IActionResult> OnPostAsync(string specificationId = null)
        {
            if (!string.IsNullOrWhiteSpace(EditSpecificationViewModel.Name) && EditSpecificationViewModel.Name != EditSpecificationViewModel.OriginalSpecificationName)
            {
                ApiResponse<Specification> existingSpecificationResponse = await this._specsClient.GetSpecificationByName(EditSpecificationViewModel.Name);

                if (existingSpecificationResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(EditSpecificationViewModel)}.{nameof(EditSpecificationViewModel.Name)}", ValidationMessages.SpecificationAlreadyExists);
                }
            }

            if (!ModelState.IsValid)
            {
                await TaskHelper.WhenAllAndThrow(PopulateFundingPeriods(EditSpecificationViewModel.FundingPeriodId), PopulateFundingStreams(EditSpecificationViewModel.FundingStreamIds));
                return Page();
            }

            EditSpecificationModel specification = _mapper.Map<EditSpecificationModel>(EditSpecificationViewModel);

            HttpStatusCode editResult = await _specsClient.UpdateSpecification(specificationId, specification);
            if(editResult == HttpStatusCode.OK)
            {
                return Redirect($"/specs/policies/{specificationId}");
            }
            else
            {
                return new InternalServerErrorResult($"Unable to update specification. API returned {editResult}");
            }
        }

        private async Task PopulateFundingStreams(IEnumerable<string> fundingStreamIds)
        {
            var fundingStreamsResponse = await _specsClient.GetFundingStreams();

            if (fundingStreamsResponse == null)
            {
                throw new InvalidOperationException($"Null funding streams response returned");
            }

            if (fundingStreamsResponse.StatusCode == HttpStatusCode.OK && !fundingStreamsResponse.Content.IsNullOrEmpty())
            {
                IEnumerable<SelectListItem> fundingStreams = fundingStreamsResponse.Content.Select(m => new SelectListItem
                {
                    Value = m.Id,
                    Text = m.Name,
                }).ToList();

                FundingStreams = new MultiSelectList(fundingStreams, "Value", "Text", fundingStreamIds);
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
                var fundingPeriods = fundingPeriodsResponse.Content;

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