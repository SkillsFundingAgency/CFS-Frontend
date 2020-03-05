using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.ViewModels.Publish
{
	public class ProfilingViewModel
	{
		public decimal TotalAllocation => ProfilingInstallments.Sum(p => p.InstallmentValue);
		public decimal PreviousAllocation { get; }

		public IEnumerable<ProfilingInstallment> ProfilingInstallments { get; }

		public ProfilingViewModel(IEnumerable<ProfilingInstallment> profilingInstallments, decimal previousAllocation = 0)
		{
			ProfilingInstallments = profilingInstallments;
			PreviousAllocation = previousAllocation;
		}
	}
} 