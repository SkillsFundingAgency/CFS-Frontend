namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.ViewModels.Specs;

    public class SpecificationDatasetRelationshipsViewModel
    {
        public SpecificationDatasetRelationshipsViewModel(SpecificationSummaryViewModel specification)
        {
            Items = Enumerable.Empty<SpecificationDatasetRelationshipItemViewModel>();

            Specification = specification;
	        SpecificationTrimmedViewModel = ToSpecificationTrimmedViewModel(specification);
        }

        public IEnumerable<SpecificationDatasetRelationshipItemViewModel> Items { get; set; }

        public SpecificationSummaryViewModel Specification { get; set; }

		public SpecificationViewModel SpecificationTrimmedViewModel { get; set; }

	    public SpecificationViewModel ToSpecificationTrimmedViewModel(SpecificationSummaryViewModel specificationSummaryViewModel)
	    {
			return new SpecificationViewModel()
		    {
			    FundingPeriod = specificationSummaryViewModel.FundingPeriod,
			    Description = specificationSummaryViewModel.Description,
			    FundingStreams = specificationSummaryViewModel.FundingStreams,
			    Id = specificationSummaryViewModel.Id,
			    Name = specificationSummaryViewModel.Name
		    };
		}

        public string GetCountPhrase()
        {
            int totalCount = Items.Count();

            if (totalCount == 0)
                return string.Empty;

            int selectedCount = Items.Count(m => !string.IsNullOrWhiteSpace(m.DatasetId));

            return $"{selectedCount} of {totalCount} datasets mapped with data source file";
        }
    }
}