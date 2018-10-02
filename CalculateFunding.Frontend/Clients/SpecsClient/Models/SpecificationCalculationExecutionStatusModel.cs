using System;

namespace CalculateFunding.Frontend.Clients.SpecsClient.Models
{
	public class SpecificationCalculationExecutionStatusModel
	{
		public string SpecificationId { get; set; }

		public int PercentageCompleted { get; set; }

		public CalculationProgressStatus CalculationProgress { get; set; }

		public string ErrorMessage { get; set; }

        public DateTimeOffset? PublishedResultsRefreshedAt { get; set; }
    }
}
