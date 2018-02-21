namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.Collections.Generic;
    using System.Linq;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;

    public class SpecificationDatasetRelationshipsViewModel
    {
        public SpecificationDatasetRelationshipsViewModel(Specification specification)
        {
            Items = Enumerable.Empty<SpecificationDatasetRelationshipItemViewModel>();

            Specification = specification;
        }

        public IEnumerable<SpecificationDatasetRelationshipItemViewModel> Items { get; set; }

        public Specification Specification { get; set; }

        public string GetCountPhrase()
        {
            int totalCount = Items.Count();

            int selectedCount = Items.Count(m => !string.IsNullOrWhiteSpace(m.DatasetId));

            return $"{selectedCount} of {totalCount} data sources selected for {Specification.Name}";
        }
    }
}