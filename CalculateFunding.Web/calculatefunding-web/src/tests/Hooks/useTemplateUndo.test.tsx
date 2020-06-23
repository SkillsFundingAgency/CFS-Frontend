import {
    useTemplateUndo,
    templateBuilderStateKey,
    templateBuilderPastStateKey,
    templateBuilderFutureStateKey
} from "../../hooks/useTemplateUndo";
import { singleNodeDs, withChildFundingLineDs } from "../Services/templateBuilderTestData";
import { renderHook, act } from '@testing-library/react-hooks';

beforeEach(() => {
    localStorage.clear();
});

it("returns false for canUndo and canRedo on initial render", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));

    expect(result.current.canUndo).toBeFalsy();
    expect(result.current.canRedo).toBeFalsy();
});

it("setPresentState calls update function and saves to localstorage", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));

    result.current.initialiseState(singleNodeDs);

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__[templateBuilderStateKey]).toBe(JSON.stringify(singleNodeDs));
    expect(result.current.canUndo).toBeFalsy();
    expect(result.current.canRedo).toBeFalsy();
});

it("updatePresentState calls update function and sets correct current and past state", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));
    result.current.initialiseState(singleNodeDs);

    result.current.updatePresentState(withChildFundingLineDs);

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__[templateBuilderStateKey]).toBe(JSON.stringify(withChildFundingLineDs));
    expect(localStorage.__STORE__[templateBuilderPastStateKey]).toBe(JSON.stringify([singleNodeDs]));
});

it("undo calls update function and sets correct past, current and future state", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));
    result.current.initialiseState(singleNodeDs);
    result.current.updatePresentState(withChildFundingLineDs);

    result.current.undo();

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__[templateBuilderStateKey]).toBe(JSON.stringify(singleNodeDs));
    expect(localStorage.__STORE__[templateBuilderPastStateKey]).toBe(JSON.stringify([]));
    expect(localStorage.__STORE__[templateBuilderFutureStateKey]).toBe(JSON.stringify([withChildFundingLineDs]));
});

it("redo calls update function and sets correct past, current and future state", () => {
    const updateMock = jest.fn();
    const { result } = renderHook(() => useTemplateUndo(updateMock));
    result.current.initialiseState(singleNodeDs);
    result.current.updatePresentState(withChildFundingLineDs);
    result.current.undo();

    result.current.redo();

    expect(updateMock).toBeCalled();
    expect(localStorage.__STORE__[templateBuilderStateKey]).toBe(JSON.stringify(withChildFundingLineDs));
    expect(localStorage.__STORE__[templateBuilderPastStateKey]).toBe(JSON.stringify([singleNodeDs]));
    expect(localStorage.__STORE__[templateBuilderFutureStateKey]).toBe(JSON.stringify([]));
});


