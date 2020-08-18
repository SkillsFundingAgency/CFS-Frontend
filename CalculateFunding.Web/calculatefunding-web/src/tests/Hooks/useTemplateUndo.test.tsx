import * as React from "react";
import {useTemplateUndo} from "../../hooks/useTemplateUndo";
import { singleNodeDs, withChildFundingLineDs } from "../Services/templateBuilderTestData";
import { renderHook, act } from '@testing-library/react-hooks';

const useStateSpy = jest.spyOn(React, 'useState');
useStateSpy.mockImplementation(() => ['12345', ()=>{}]);

beforeEach(() => {
    localStorage.clear();
});

it("returns zero undo and redo count on initial render", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));

    expect(result.current.undoCount()).toEqual(0);
    expect(result.current.redoCount()).toEqual(0);
});

it("initialiseState calls update function and saves to localstorage", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));

    result.current.initialiseState(singleNodeDs);

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__['templateBuilderState-12345']).toBe(JSON.stringify(singleNodeDs));
    expect(result.current.undoCount()).toEqual(0);
    expect(result.current.redoCount()).toEqual(0);
});

it("updatePresentState calls update function and sets correct current and past state", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));
    result.current.initialiseState(singleNodeDs);

    result.current.updatePresentState(withChildFundingLineDs);

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__['templateBuilderState-12345']).toBe(JSON.stringify(withChildFundingLineDs));
    expect(localStorage.__STORE__['templateBuilderPastState-12345']).toBe(JSON.stringify([singleNodeDs]));
    expect(result.current.undoCount()).toEqual(1);
    expect(result.current.redoCount()).toEqual(0);
});

it("undo calls update function and sets correct past, current and future state", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));
    result.current.initialiseState(singleNodeDs);
    result.current.updatePresentState(withChildFundingLineDs);

    result.current.undo();

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__['templateBuilderState-12345']).toBe(JSON.stringify(singleNodeDs));
    expect(localStorage.__STORE__['templateBuilderPastState-12345']).toBe(JSON.stringify([]));
    expect(localStorage.__STORE__['templateBuilderFutureState-12345']).toBe(JSON.stringify([withChildFundingLineDs]));
    expect(result.current.undoCount()).toEqual(0);
    expect(result.current.redoCount()).toEqual(1);
});

it("redo calls update function and sets correct past, current and future state", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));
    result.current.initialiseState(singleNodeDs);
    result.current.updatePresentState(withChildFundingLineDs);
    result.current.undo();

    result.current.redo();

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__['templateBuilderState-12345']).toBe(JSON.stringify(withChildFundingLineDs));
    expect(localStorage.__STORE__['templateBuilderPastState-12345']).toBe(JSON.stringify([singleNodeDs]));
    expect(localStorage.__STORE__['templateBuilderFutureState-12345']).toBe(JSON.stringify([]));
    expect(result.current.undoCount()).toEqual(1);
    expect(result.current.redoCount()).toEqual(0);
});


