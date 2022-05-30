import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { Pagination } from "../../components/Pagination";

const callBackSpy = jest.fn();

describe("<Pagination />", () => {
  beforeEach(() => {
    callBackSpy.mockReset();
  });

  it("renders correctly when only one page", () => {
    render(<Pagination callback={callBackSpy} currentPage={1} lastPage={1} />);

    expect(screen.queryByText(/Next/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Previous/i)).not.toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(callBackSpy).toBeCalledTimes(0);
  });

  it("renders correctly when multiple pages", () => {
    render(<Pagination callback={callBackSpy} currentPage={1} lastPage={10} />);

    expect(screen.getByText(/Next/i)).toBeInTheDocument();
    expect(screen.queryByText(/Previous/i)).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(callBackSpy).toBeCalledTimes(0);
  });

  it("renders correctly when multiple pages and not on first page", () => {
    render(<Pagination callback={callBackSpy} currentPage={2} lastPage={10} />);

    expect(screen.getByText(/Next/i)).toBeInTheDocument();
    expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(callBackSpy).toBeCalledTimes(0);
  });

  it("next page button is enabled", () => {
    render(<Pagination callback={callBackSpy} currentPage={1} lastPage={2} />);

    expect(screen.getByText(/Next/i).closest("a")).toBeEnabled();
    expect(callBackSpy).toBeCalledTimes(0);
  });

  it("previous button but not next page button is shown when on last page", () => {
    render(<Pagination callback={callBackSpy} currentPage={2} lastPage={2} />);

    expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    expect(screen.queryByText(/Next/i)).not.toBeInTheDocument();
    expect(callBackSpy).toBeCalledTimes(0);
  });

  it("calls callback when next button clicked", () => {
    render(<Pagination callback={callBackSpy} currentPage={1} lastPage={2} />);
    fireEvent.click(screen.getByText(/Next/i));
    expect(callBackSpy).toBeCalledTimes(1);
    expect(callBackSpy).toBeCalledWith(2);
  });

  it("calls callback when previous button clicked", () => {
    render(<Pagination callback={callBackSpy} currentPage={2} lastPage={2} />);
    fireEvent.click(screen.getByText(/Previous/i));
    expect(callBackSpy).toBeCalledTimes(1);
    expect(callBackSpy).toBeCalledWith(1);
  });

  it("calls callback when page link is clicked", () => {
    render(<Pagination callback={callBackSpy} currentPage={2} lastPage={10} />);
    fireEvent.click(screen.getByText("1").closest("a") as Element);
    expect(callBackSpy).toBeCalledTimes(1);
  });
});
