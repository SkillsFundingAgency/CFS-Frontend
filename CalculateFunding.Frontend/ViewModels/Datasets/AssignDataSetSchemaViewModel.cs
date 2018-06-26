namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Frontend.Properties;

    public class AssignDatasetSchemaViewModel
    {
         [Required(ErrorMessageResourceName = nameof(ValidationMessages.DatasetSchemaRequiredForSpecification), ErrorMessageResourceType = typeof(ValidationMessages))]
         public string DatasetDefinitionId { get; set; }

         [Required(ErrorMessageResourceName = nameof(ValidationMessages.DatasetSchemaRelationshipNameRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
         public string Name { get; set; }

         [Required(ErrorMessageResourceName = nameof(ValidationMessages.DatasetSchemaDescriptionRequired), ErrorMessageResourceType = typeof(ValidationMessages))]
         public string Description { get; set; }

         public bool IsSetAsProviderData { get; set; }

         public bool UsedInDataAggregations { get; set; }
    }
}
