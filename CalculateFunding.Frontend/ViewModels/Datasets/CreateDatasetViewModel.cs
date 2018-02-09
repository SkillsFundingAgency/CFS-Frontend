namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Properties;
    using Microsoft.AspNetCore.Http;

    public class CreateDatasetViewModel
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string DataDefinitionId { get; set; }

        public string Filename { get; set; }
    }
}
