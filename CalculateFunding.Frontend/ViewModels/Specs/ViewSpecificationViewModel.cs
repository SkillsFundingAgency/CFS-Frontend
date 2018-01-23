using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Clients.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ViewModels.Specs
{
    public class ViewSpecificationViewModel
    {
        public Reference AcademicYear { get; set; }
        public string Description { get; set; }
        public string Name { get; set; }
        public string Id { get; set; }
    }
}
