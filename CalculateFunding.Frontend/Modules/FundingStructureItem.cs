namespace CalculateFunding.Frontend.Modules
{
	public class FundingStructureItem
	{
		public int Level { get; }
		public string Name { get; }
		public string CalculationId { get; }
		public FundingStructureType Type { get; }

		public FundingStructureItem(
			int level,
			string name,
			string calculationId,
			FundingStructureType type)
		{
			Level = level;
			Name = name;
			CalculationId = calculationId;
			Type = type;
		}
	}
}