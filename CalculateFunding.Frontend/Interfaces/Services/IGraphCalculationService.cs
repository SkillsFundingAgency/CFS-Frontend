using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.Services
{
    public interface IGraphCalculationService
    {
        Task<IActionResult> GetCalculationCircularDependencies(string specificationId);
    }
}
