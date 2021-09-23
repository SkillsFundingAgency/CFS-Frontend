import { renderHook } from "@testing-library/react-hooks";
import * as redux from "react-redux";

import { useTemplatePermissions } from "../../hooks/TemplateBuilder/useTemplatePermissions";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { buildPermissions } from "../fakes/testFactories";

const useSelectorSpy = jest.spyOn(redux, "useSelector");

const permissionsState: FundingStreamPermissions[] = [
  buildPermissions({
    fundingStreamId: "DSG",
    setAllPermsEnabled: false,
    actions: [(p) => (p.canEditTemplates = true), (p) => (p.canApproveTemplates = true)],
  }),
  buildPermissions({ fundingStreamId: "GAG", setAllPermsEnabled: false }),
  buildPermissions({
    fundingStreamId: "1619",
    setAllPermsEnabled: false,
    actions: [(p) => (p.canEditTemplates = true)],
  }),
];

beforeEach(() => {
  useSelectorSpy.mockClear();
  useSelectorSpy.mockReturnValue(permissionsState);
});

it("handles empty parameters correctly", () => {
  const { result } = renderHook(() => useTemplatePermissions([]));
  expect(result.current.missingPermissions).toEqual([]);
  expect(result.current.canEditTemplate).toBeTruthy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeTruthy();
});

it("handles all parameters used correctly", () => {
  const { result } = renderHook(() =>
    useTemplatePermissions(["edit", "create", "delete", "approve"], ["DSG", "GAG", "1619"])
  );
  expect(result.current.missingPermissions).toEqual(["create"]);
  expect(result.current.canEditTemplate).toBeTruthy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeTruthy();
});

it("calculates missing create permissions correctly", () => {
  const { result } = renderHook(() => useTemplatePermissions(["create"]));
  expect(result.current.missingPermissions).toEqual(["create"]);
});

it("calculates permissions correctly for a funding stream", () => {
  const { result } = renderHook(() => useTemplatePermissions(["edit", "approve"], ["DSG"]));
  expect(result.current.missingPermissions).toEqual([]);
  expect(result.current.canEditTemplate).toBeTruthy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeTruthy();
});

it("calculates permissions correctly for multiple funding streams", () => {
  const { result } = renderHook(() =>
    useTemplatePermissions(["create", "edit", "delete", "approve"], ["DSG", "1619"])
  );
  expect(result.current.missingPermissions).toEqual(["create"]);
  expect(result.current.canEditTemplate).toBeTruthy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeTruthy();
});

it("calculates required funding streams correctly when user has permission", () => {
  const { result } = renderHook(() =>
    useTemplatePermissions(["create", "edit", "delete", "approve"], ["1619"])
  );
  expect(result.current.missingPermissions).toEqual(["create", "approve"]);
  expect(result.current.canEditTemplate).toBeTruthy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeFalsy();
});

it("calculates required funding streams correctly when user does not have permission", () => {
  const { result } = renderHook(() => useTemplatePermissions(["create"], ["DSG"]));
  expect(result.current.missingPermissions).toEqual(["create"]);
  expect(result.current.canCreateTemplate).toBeFalsy();
});

it("calculates correctly when user has no permissions for a funding stream", () => {
  const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "approve"], ["GAG"]));
  expect(result.current.missingPermissions).toEqual(["edit", "create", "approve"]);
  expect(result.current.canEditTemplate).toBeFalsy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeFalsy();
});

it("calculates correctly when user has permissions across multiple funding streams", () => {
  const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "approve"], ["GAG", "1619"]));
  expect(result.current.missingPermissions).toEqual(["create", "approve"]);
  expect(result.current.canEditTemplate).toBeTruthy();
  expect(result.current.canCreateTemplate).toBeFalsy();
  expect(result.current.canApproveTemplate).toBeFalsy();
});

it("calculates funding stream permissions correctly", () => {
  const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "approve"]));
  expect(result.current.fundingStreamPermissions).toEqual([
    {
      fundingStreamId: "DSG",
      permission: "edit",
    },
    {
      fundingStreamId: "DSG",
      permission: "approve",
    },
    {
      fundingStreamId: "1619",
      permission: "edit",
    },
  ]);
});

it("calculates funding stream permissions correctly (regardless of required permissions)", () => {
  const { result } = renderHook(() => useTemplatePermissions(["create", "edit"]));
  expect(result.current.fundingStreamPermissions).toEqual([
    {
      fundingStreamId: "DSG",
      permission: "edit",
    },
    {
      fundingStreamId: "DSG",
      permission: "approve",
    },
    {
      fundingStreamId: "1619",
      permission: "edit",
    },
  ]);
});
