import React from "react";
import {mount} from "enzyme";
import {MappingStatus} from "../../components/MappingStatus";
import {JobMessage, JobSummary} from "../../types/jobMessage";

describe('<MappingStatus />', () => {
  it("renders status based on InProgress JobMessage", () => {
    const jobMessage: JobMessage = getJobMessage(null, "InProgress");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-orange")).toBeTruthy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("Mapping in progress");
    expect(wrapper.find("[data-testid='formatted-completed-date']")).toHaveLength(0);
  });

  it("renders status based on Queued JobMessage", () => {
    const jobMessage: JobMessage = getJobMessage(null, "Queued");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-orange")).toBeTruthy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("Mapping queued");
    expect(wrapper.find("[data-testid='formatted-completed-date']")).toHaveLength(0);
  });

  it("renders status based on successfully completed JobMessage", () => {
    const jobMessage: JobMessage = getJobMessage("Succeeded", "Completed");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-green")).toBeTruthy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("Mapping completed");
  });

  it("renders status based on failed completed JobMessage", () => {
    const jobMessage: JobMessage = getJobMessage("Failed", "Completed");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-orange")).toBeFalsy();
    expect(notification.hasClass("govuk-error-summary-green")).toBeFalsy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("There is a problem");
    expect(wrapper.find('#subTitle').text()).toEqual("Mapping failed");
  });

  it("renders status based on InProgress JobSummary", () => {
    const jobMessage: JobSummary = getJobSummary(null, "InProgress");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-orange")).toBeTruthy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("Mapping in progress");
    expect(wrapper.find("[data-testid='formatted-completed-date']")).toHaveLength(0);
  });

  it("renders status based on Queued JobSummary", () => {
    const jobMessage: JobSummary = getJobSummary(null, "Queued");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-orange")).toBeTruthy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("Mapping queued");
    expect(wrapper.find("[data-testid='formatted-completed-date']")).toHaveLength(0);
  });

  it("renders status based on successfully completed JobSummary", () => {
    const jobMessage: JobSummary = getJobSummary("Succeeded", "Completed");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-green")).toBeTruthy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("Mapping completed");
  });

  it("renders status based on failed completed JobSummary", () => {
    const jobMessage: JobSummary = getJobSummary("Failed", "Completed");

    const wrapper = mount(<MappingStatus jobMessage={jobMessage} />);

    const notification = wrapper.find("[data-testid='job-notification']");

    expect(notification.hasClass("govuk-error-summary-orange")).toBeFalsy();
    expect(notification.hasClass("govuk-error-summary-green")).toBeFalsy();
    expect(wrapper.find('#error-summary-title').text()).toEqual("There is a problem");
    expect(wrapper.find('#subTitle').text()).toEqual("Mapping failed");
  });
});

function getJobMessage(completionStatus: string | null, runningStatus: string) : JobMessage {
  return {
    completionStatus: completionStatus,
    invokerUserDisplayName: "",
    invokerUserId: "",
    itemCount: 0,
    jobId: "",
    jobType: "",
    outcome: "",
    overallItemsFailed: 0,
    overallItemsProcessed: 0,
    overallItemsSucceeded: 0,
    parentJobId: 1,
    runningStatus: runningStatus,
    specificationId: "",
    statusDateTime: new Date("2020-09-02T10:00:45.4873729+00:00"),
    supersededByJobId: 0,
    jobCreatedDateTime: new Date("2020-09-02T09:50:45.4873729+00:00")
  };
}

function getJobSummary(completionStatus: string | null, runningStatus: string) : JobSummary {
  return {
    completionStatus: completionStatus,
    invokerUserDisplayName: "",
    invokerUserId: "",
    jobId: "",
    jobType: "",
    entityId: "",
    parentJobId: 1,
    runningStatus: runningStatus,
    specificationId: "",
    lastUpdated: new Date("2020-09-02T10:00:45.4873729+00:00"),
    lastUpdatedFormatted: "",
    created: new Date("2020-09-02T09:50:45.4873729+00:00"),
    createdFormatted: ""
  };
}