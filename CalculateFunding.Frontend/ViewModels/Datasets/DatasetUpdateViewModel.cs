using System.ComponentModel.DataAnnotations;

namespace CalculateFunding.Frontend.ViewModels.Datasets
{
    public class DatasetUpdateViewModel
    { 
        [Required]
        public string Filename { get; set; }
    }
}
