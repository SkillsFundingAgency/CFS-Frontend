import * as fundingConfigurationHook from "../../hooks/useFundingConfiguration";
import { FundingConfigurationQueryResult } from "../../hooks/useFundingConfiguration";
import { FundingConfiguration } from "../../types/FundingConfiguration";

const createFundingConfigResult = (
  fundingConfig: FundingConfiguration,
  overrides: Partial<FundingConfigurationQueryResult> = {}
) => {
  return {
    fundingConfiguration: fundingConfig,
    isLoadingFundingConfiguration: false,
    isErrorLoadingFundingConfiguration: false,
    errorLoadingFundingConfiguration: "",
    ...overrides,
  };
};

const spy: jest.SpyInstance = jest.spyOn(fundingConfigurationHook, "useFundingConfiguration");

const hasFundingConfigurationResult = (
  fundingConfig: FundingConfiguration,
  overrides: Partial<FundingConfigurationQueryResult> = {}
) => spy.mockImplementation(() => createFundingConfigResult(fundingConfig, overrides));

export const useFundingConfigurationUtils = {
  spy,
  hasFundingConfigurationResult,
};
