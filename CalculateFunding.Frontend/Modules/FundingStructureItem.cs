using System;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Modules
{
	public class FundingStructureItem
	{
		public int Level { get; }
		public string Name { get; }
		public string CalculationId { get; }
		public string CalculationPublishStatus { get; }
		public FundingStructureType Type { get; }
		public string Value { get; set; }
		public string CalculationType { get; }
        public List<FundingStructureItem> FundingStructureItems { get; }
        public DateTimeOffset? LastUpdatedDate { get; }

		public FundingStructureItem(
			int level,
			string name,
			string calculationId,
			string calculationPublishStatus, 
			FundingStructureType type, 
			string calculationType = null,
			List<FundingStructureItem> fundingStructureItems = null,
			string value = null, 
            DateTimeOffset? lastUpdatedDate = null)
		{
			Level = level;
			Name = name;
			CalculationId = calculationId;
			Type = type;
			CalculationPublishStatus = calculationPublishStatus;
			FundingStructureItems = fundingStructureItems;
			Value = value;
			CalculationType = calculationType;
            LastUpdatedDate = lastUpdatedDate;
        }
	}
}