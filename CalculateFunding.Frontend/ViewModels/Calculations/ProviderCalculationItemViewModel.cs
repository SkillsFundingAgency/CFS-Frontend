namespace CalculateFunding.Frontend.ViewModels.Calculations
{
	public class ProviderCalculationItemViewModel
	{
		public string Name { get; set; }
        public string ExceptionType { get; set; }
        public string ExceptionMessage { get; set; }
        public bool HasException => !string.IsNullOrWhiteSpace(ExceptionType);
        public string ValueType { get; set; }
		public object Value { get; set; }
	}
}