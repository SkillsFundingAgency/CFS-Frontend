using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.TemplateMetadata.Models;

namespace CalculateFunding.Frontend.Interfaces.Services
{
    public interface ITemplateMetadataContentsAssemblerService
    {
        Task<IEnumerable<TemplateMetadataContents>> Assemble(SpecificationSummary specification);
    }
}
