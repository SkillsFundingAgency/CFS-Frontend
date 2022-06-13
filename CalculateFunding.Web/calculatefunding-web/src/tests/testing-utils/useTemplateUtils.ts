import * as TemplateHook from "../../hooks/TemplateBuilder/useTemplate";
import { UseTemplateResult } from "../../hooks/TemplateBuilder/useTemplate";
import {
  TemplateResponse,
} from "../../types/TemplateBuilderDefinitions";
import { fakery } from "../fakes/fakery";

const createUseTemplateResponse = (
  overrides: Partial<TemplateResponse> = {},
): UseTemplateResult => {
  return {
    template: fakery.makeTemplate(overrides),
    isLoadingTemplate: false
  } as UseTemplateResult;
};

const spy: jest.SpyInstance = jest.spyOn(TemplateHook, "useTemplate");

const withTemplateResponse = (result: TemplateResponse) =>
  spy.mockImplementation(() => createUseTemplateResponse(result));

export const useTemplateUtils = {
  spy,
  withTemplateResponse,
  createUseTemplateResponse,
};
