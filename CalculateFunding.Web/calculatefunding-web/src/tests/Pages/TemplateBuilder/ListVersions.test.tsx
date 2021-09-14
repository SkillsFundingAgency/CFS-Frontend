import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import React from "react";
import * as redux from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { ListVersions } from "../../../pages/Templates/ListVersions";
import { FundingStreamPermissions } from "../../../types/FundingStreamPermissions";

const templateId = "xxxx-xxxx-xxxx-xxxx";
const fetchMock = new MockAdapter(axios);
const useSelectorSpy = jest.spyOn(redux, "useSelector");

const noFundingStreamPermissions: FundingStreamPermissions = {
  canApproveAllCalculations: false,
  canApproveAnyCalculations: false,
  canApproveCalculations: false,
  canRefreshPublishedQa: false,
  canUploadDataSourceFiles: false,
  fundingStreamId: "DSG",
  userId: "",
  canAdministerFundingStream: false,
  canApproveFunding: false,
  canApproveSpecification: false,
  canChooseFunding: false,
  canCreateQaTests: false,
  canCreateSpecification: false,
  canDeleteCalculations: false,
  canDeleteQaTests: false,
  canDeleteSpecification: false,
  canEditCalculations: false,
  canEditQaTests: false,
  canEditSpecification: false,
  canMapDatasets: false,
  canRefreshFunding: false,
  canReleaseFunding: false,
  canCreateTemplates: false,
  canEditTemplates: false,
  canDeleteTemplates: false,
  canApproveTemplates: false,
  canApplyCustomProfilePattern: false,
  canAssignProfilePattern: false,
  canDeleteProfilePattern: false,
  canEditProfilePattern: false,
  canCreateProfilePattern: false,
};
export const noPermissionsState: FundingStreamPermissions[] = [noFundingStreamPermissions];

describe("Template Versions page when there are two versions and I have no permissions ", () => {
  beforeEach(() => {
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(noPermissionsState);
    fetchMock.onGet("/api/templates/build/undefined").reply(200, {
      templateId: templateId,
      authorId: "testid",
      authorName: "testuser",
      comments: null,
      description: "testing 1 2 3",
      fundingPeriodId: "AY-2021",
      fundingStreamId: "PSG",
      lastModificationDate: "2020-06-30T11:40:46.1025319",
      majorVersion: 0,
      minorVersion: 1,
      current: {
        templateId: templateId,
        authorId: "testid",
        authorName: "testuser",
        comments: null,
        description: "testing 1 2 3",
        fundingPeriodId: "AY-2021",
        fundingStreamId: "PSG",
        lastModificationDate: "2020-06-30T11:40:46.1025319",
        majorVersion: 0,
        minorVersion: 2,
        version: 2,
        name: "PSG AY-2021",
        publishStatus: "Draft",
        schemaVersion: "1.1",
        status: "Draft",
      },
      name: "PSG AY-2021",
      publishStatus: "Draft",
      schemaVersion: "1.1",
      status: "Draft",
    });
    fetchMock
      .onGet(
        "/api/templates/build/undefined/versions?page=1&itemsPerPage=10&statuses=Draft&statuses=Published"
      )
      .reply(200, {
        totalCount: 2,
        pageResults: [
          {
            templateId: templateId,
            authorId: "testid",
            authorName: "testuser",
            comments: null,
            description: "testing 1 2 3",
            fundingPeriodId: "AY-2021",
            fundingStreamId: "PSG",
            lastModificationDate: "2020-06-30T11:40:46.1025319",
            majorVersion: 0,
            minorVersion: 1,
            version: 1,
            name: "PSG AY-2021",
            publishStatus: "Draft",
            schemaVersion: "1.1",
            status: "Draft",
          },
          {
            templateId: templateId,
            authorId: "testid",
            authorName: "testuser",
            comments: null,
            description: "testing 1 2 3",
            fundingPeriodId: "AY-2021",
            fundingStreamId: "PSG",
            lastModificationDate: "2020-06-30T11:40:46.1025319",
            majorVersion: 0,
            minorVersion: 2,
            version: 2,
            name: "PSG AY-2021",
            publishStatus: "Draft",
            schemaVersion: "1.1",
            status: "Draft",
          },
        ],
      });
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it("does not render a permission status warning", async () => {
    render(
      <MemoryRouter>
        <ListVersions />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.queryByText("You do not have permissions to perform the following actions")
      ).not.toBeInTheDocument();
    });
  });

  it("does render versions list correctly", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <ListVersions />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("version-1")).toBeInTheDocument();
      expect(getByTestId("version-2")).toBeInTheDocument();
    });
  });
});

describe("Template Versions page displays no results when filtered search returns no versions", () => {
  beforeEach(() => {
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(noPermissionsState);
    fetchMock.onGet("/api/templates/build/undefined").reply(200, {
      templateId: templateId,
      authorId: "testid",
      authorName: "testuser",
      comments: null,
      description: "testing 1 2 3",
      fundingPeriodId: "AY-2021",
      fundingStreamId: "PSG",
      lastModificationDate: "2020-06-30T11:40:46.1025319",
      majorVersion: 0,
      minorVersion: 1,
      current: {
        templateId: templateId,
        authorId: "testid",
        authorName: "testuser",
        comments: null,
        description: "testing 1 2 3",
        fundingPeriodId: "AY-2021",
        fundingStreamId: "PSG",
        lastModificationDate: "2020-06-30T11:40:46.1025319",
        majorVersion: 0,
        minorVersion: 2,
        version: 2,
        name: "PSG AY-2021",
        publishStatus: "Draft",
        schemaVersion: "1.1",
        status: "Draft",
      },
      name: "PSG AY-2021",
      publishStatus: "Draft",
      schemaVersion: "1.1",
      status: "Draft",
    });
    fetchMock
      .onGet(
        "/api/templates/build/undefined/versions?page=1&itemsPerPage=10&statuses=Draft&statuses=Published"
      )
      .reply(200, {
        totalCount: 0,
        pageResults: [],
      });
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it("does render no results correctly", async () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <ListVersions />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(getByTestId("no-results")).toBeVisible();
      expect(screen.queryByText("There are no records to match your search")).toBeInTheDocument();
    });
  });
});
