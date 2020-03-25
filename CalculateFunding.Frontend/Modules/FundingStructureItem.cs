using System.Collections.Generic;

namespace CalculateFunding.Frontend.Modules
{
	public class FundingStructureItem
	{
		public int Level { get; }
		public string Name { get; }
		public string CalculationId { get; }
		public FundingStructureType Type { get; }

		public List<FundingStructureItem> FundingStructureItems { get; set; }

		public FundingStructureItem(
			int level,
			string name,
			string calculationId,
			FundingStructureType type, 
			List<FundingStructureItem> fundingStructureItems = null)
		{
			Level = level;
			Name = name;
			CalculationId = calculationId;
			Type = type;
			FundingStructureItems = fundingStructureItems;
		}
	}
}