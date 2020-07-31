namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System.ComponentModel.DataAnnotations;
    using CalculateFunding.Frontend.Properties;

    public class AssignDatasetSchemaViewModel
    {
         public string DatasetDefinitionId { get; set; }

         public string Name { get; set; }

         public string Description { get; set; }

         public bool IsSetAsProviderData { get; set; }

         public bool UsedInDataAggregations { get; set; }
    }
}
