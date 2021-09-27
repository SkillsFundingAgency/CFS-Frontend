import { waitFor } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react-hooks";
import { DateTime } from "luxon";

import { useNotifications } from "../../hooks/Jobs/useNotifications";
import { JobNotification } from "../../types/Jobs/JobSubscriptionModels";

describe("useNotifications hook ", () => {
  const mockNotify = jest.fn();
  const baseDate = DateTime.fromISO("2016-05-25T09:08:34.123");

  const render = () => {
    const { result } = renderHook(() => useNotifications({ notify: mockNotify, subs: [] }));
    return result;
  };

  it("by default, returns empty list of notifications", async () => {
    const result = render();
    expect(result.current.notifications).toEqual([]);
  });

  it("when a single notification added, returns same notification", async () => {
    const result = render();

    act(() => result.current.addNotification(createDummyNotification({})));

    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
  });

  it("when multiple notifications added for same subscription, returns only the latest notification", async () => {
    const result = render();

    act(() => {
      result.current.addNotification(
        createDummyNotification({
          jobId: "a",
          subId: "s",
          lastUpdated: baseDate.minus({ hour: 2 }).toJSDate(),
        })
      );
      result.current.addNotification(
        createDummyNotification({
          jobId: "b",
          subId: "s",
          lastUpdated: baseDate.minus({ hour: 1 }).toJSDate(),
        })
      );
      result.current.addNotification(
        createDummyNotification({
          jobId: "c",
          subId: "s",
          lastUpdated: baseDate.minus({ hour: 3 }).toJSDate(),
        })
      );
    });

    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
    const notification = result.current.notifications[0];
    expect(notification.latestJob?.jobId).toEqual("b");
    expect(notification.latestJob?.lastUpdated).toEqual(baseDate.minus({ hour: 1 }).toJSDate());
  });

  it("when a duplicate notification added, returns just one notification", async () => {
    const result = render();

    act(() => {
      result.current.addNotification(
        createDummyNotification({
          jobId: "aaa",
          subId: "111",
          lastUpdated: baseDate.minus({ hour: 2 }).toJSDate(),
        })
      );
      result.current.addNotification(
        createDummyNotification({
          jobId: "bbb",
          subId: "111",
        })
      );
      result.current.addNotification(
        createDummyNotification({
          jobId: "aaa",
          subId: "222",
          lastUpdated: baseDate.minus({ hour: 1 }).toJSDate(),
        })
      );
    });

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.notifications.filter((n) => n.latestJob?.jobId === "aaa")).toHaveLength(1);
    expect(
      result.current.notifications.find((n) => n.latestJob?.jobId === "aaa")?.latestJob?.lastUpdated
    ).toEqual(baseDate.minus({ hour: 1 }).toJSDate());
  });

  function createDummyNotification({
    jobId = "job-id",
    subId = "sub-id",
    lastUpdated,
  }: {
    jobId?: string;
    subId?: string;
    lastUpdated?: Date;
  }) {
    return {
      subscription: { id: subId },
      latestJob: { jobId: jobId, lastUpdated: lastUpdated ?? baseDate },
    } as JobNotification;
  }
});
