import { TemplateItemType } from "./TemplateItemType";

export interface DatasetMetadata {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  fundingLines: DatasetTemplateMetadata[];
  calculations: DatasetTemplateMetadata[];
}

export interface DatasetTemplateMetadata {
  templateId: number;
  name: string;
  isObsolete: boolean;
  isSelected: boolean;
  IsUsedInCalculation: boolean;
}

export interface DatasetTemplateMetadataWithType extends DatasetTemplateMetadata {
  type: TemplateItemType;
}
