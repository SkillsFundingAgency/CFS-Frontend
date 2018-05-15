namespace CalculateFunding.Frontend.Pages.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Properties;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class AssignDatasetSchemaPageModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IDatasetsApiClient _datasetsClient;
        private readonly IMapper _mapper;

        public AssignDatasetSchemaPageModel(ISpecsApiClient specsClient, IDatasetsApiClient datasetsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(specsClient, nameof(mapper));
            Guard.ArgumentNotNull(datasetsClient, nameof(datasetsClient));

            _specsClient = specsClient;
            _datasetsClient = datasetsClient;
            _mapper = mapper;
        }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodId { get; set; }

        public string FundingPeriodName { get; set; }

        public string SpecificationDescription { get; set; }

        public IEnumerable<GdsSelectListItem> Datasets { get; set; }

        [BindProperty]
        public AssignDatasetSchemaViewModel AssignDatasetSchemaViewModel { get; set; }

        public async Task<IActionResult> OnGet(string specificationId)
        {
            if (string.IsNullOrWhiteSpace(specificationId))
            {
                return new BadRequestObjectResult(ErrorMessages.SpecificationIdNullOrEmpty);
            }

            SpecificationId = specificationId;

            ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(specificationId);

            if (specificationResponse == null || specificationResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult($"Unable to get specification response. Specification Id value = {SpecificationId}");
            }

            if (specificationResponse.StatusCode.IsSuccess())
            {
                SpecificationSummary specContent = specificationResponse.Content;

                if (specContent == null)
                {
                    throw new InvalidOperationException(message: $"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
                }
                else
                {
                    SpecificationName = specContent.Name;

                    SpecificationDescription = specContent.Description;

                    FundingPeriodId = specContent.FundingPeriod.Id;

                    FundingPeriodName = specContent.FundingPeriod.Name;
               
                }

                ApiResponse<IEnumerable<DatasetDefinition>> datasetResponse = await _datasetsClient.GetDataDefinitions();

                if (datasetResponse == null || datasetResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    return new NotFoundObjectResult(ErrorMessages.DatasetDefinitionNotFoundInDatasetService);
                }

                if (datasetResponse.StatusCode.IsSuccess())
                {
                    IEnumerable<DatasetDefinition> datasetDefinitionList = datasetResponse.Content;

                    if (datasetDefinitionList.IsNullOrEmpty())
                    {
                        throw new InvalidOperationException($"Unable to retrieve Dataset definition from the response. Specification Id value = {SpecificationId}");
                    }
                    else
                    {
                        PopulateDatasetSchemas(datasetDefinitionList);
                    }
                }
                else
                {
                    return new StatusCodeResult(500);
                }
            }
            else
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!string.IsNullOrWhiteSpace(AssignDatasetSchemaViewModel.Name))
            {
                ApiResponse<DatasetSchemasAssigned> existingRelationshipResponse = await _datasetsClient.GetAssignedDatasetSchemasForSpecificationAndRelationshipName(specificationId, AssignDatasetSchemaViewModel.Name);

                if (existingRelationshipResponse.StatusCode != HttpStatusCode.NotFound)
                {
                    this.ModelState.AddModelError($"{nameof(AssignDatasetSchemaViewModel)}.{nameof(AssignDatasetSchemaViewModel.Name)}", ValidationMessages.RelationshipNameAlreadyExists);
                }
            }

            if (!ModelState.IsValid)
            {
                ApiResponse<SpecificationSummary> specificationResponse = await _specsClient.GetSpecificationSummary(specificationId);

                if (specificationResponse == null || specificationResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    return new NotFoundObjectResult($"Unable to get specification response. Specification Id value = {SpecificationId}");
                }

                if (specificationResponse.StatusCode == HttpStatusCode.OK)
                {
                    SpecificationSummary specContent = specificationResponse.Content;

                    if (specContent == null)
                    {
                        throw new InvalidOperationException($"Unable to retrieve specification model from the response. Specification Id value = {SpecificationId}");
                    }

                    ApiResponse<IEnumerable<DatasetDefinition>> datasetResponse = await _datasetsClient.GetDataDefinitions();

                    if (datasetResponse == null || datasetResponse.StatusCode == HttpStatusCode.NotFound)
                    {
                        return new NotFoundObjectResult(ErrorMessages.DatasetDefinitionNotFoundInDatasetService);
                    }

                    if (datasetResponse.StatusCode == HttpStatusCode.OK)
                    {
                        IEnumerable<DatasetDefinition> datasetDefinitionList = datasetResponse.Content;

                        if (datasetDefinitionList == null)
                        {
                            throw new InvalidOperationException($"Unable to retrieve Dataset definition from the response. Specification Id value = {SpecificationId}");
                        }

                        SpecificationName = specContent.Name;

                        SpecificationDescription = specContent.Description;

                        FundingPeriodId = specContent.FundingPeriod.Id;

                        FundingPeriodName = specContent.FundingPeriod.Name;

                        PopulateDatasetSchemas(datasetDefinitionList);

                        return Page();
                    }
                    else
                    {
                        return new StatusCodeResult(500);
                    }
                }
            }

            AssignDatasetSchemaModel datasetSchema = _mapper.Map<AssignDatasetSchemaModel>(AssignDatasetSchemaViewModel);

            datasetSchema.SpecificationId = specificationId;

            HttpStatusCode newAssignDatasetResponse = await _datasetsClient.AssignDatasetSchema(datasetSchema);

            if (newAssignDatasetResponse.Equals(HttpStatusCode.OK))
            {
                return Redirect($"/datasets/ListDatasetSchemas/{specificationId}");
            }
            else
            {
                return new StatusCodeResult(500);
            }
        }

        public void PopulateDatasetSchemas(IEnumerable<DatasetDefinition> datsetDefn)
        {
            Guard.ArgumentNotNull(datsetDefn, nameof(datsetDefn));

            Datasets = datsetDefn != null ? datsetDefn.Select(m => new GdsSelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Description = m.Description,
            }).ToList() : Enumerable.Empty<GdsSelectListItem>();
        }
    }
}
