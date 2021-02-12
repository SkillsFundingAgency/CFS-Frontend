using System;
using System.Globalization;

namespace CalculateFunding.Frontend.ViewModels.Publish
{
	public class ProfilingInstallment
	{
		public int InstallmentYear { get; }
		public string InstallmentMonth { get; }
		public int InstallmentNumber { get; }
		public decimal InstallmentValue { get; }
        public string PeriodType { get; set; }
        public bool IsPaid { get; private set; }

        public ProfilingInstallment(
			int installmentYear, 
			string installmentMonth, 
			int installmentNumber, 
			decimal installmentValue,
            string periodType)
		{
			InstallmentYear = installmentYear;
			InstallmentMonth = installmentMonth;
			InstallmentNumber = installmentNumber;
			InstallmentValue = installmentValue;
            PeriodType = periodType;

			CalculateIsPaidValue();
		}

		private void CalculateIsPaidValue()
		{
			int month = DateTime.ParseExact(InstallmentMonth, "MMMM", CultureInfo.CurrentCulture).Month;
            IsPaid = InstallmentYear < DateTime.Now.Year ||
			         InstallmentYear == DateTime.Now.Year && month < DateTime.Now.Month;
		}
	}
}