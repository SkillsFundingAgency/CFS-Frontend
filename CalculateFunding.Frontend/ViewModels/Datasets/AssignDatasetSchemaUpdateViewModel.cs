namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Frontend.Properties;

    public class AssignDatasetSchemaUpdateViewModel
    {
        [Required(ErrorMessageResourceName = nameof(ValidationMessages.DatasetSchemaRequiredForSpecification), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string DatasetDefinitionId { get; set; }

        [Required(ErrorMessageResourceName = nameof(ValidationMessages.DatasetSchemaRelationshipNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
        public string Name { get; set; }

        public string Description { get; set; }
    }
}
