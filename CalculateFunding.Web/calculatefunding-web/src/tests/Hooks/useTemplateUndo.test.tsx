import * as React from "react";
import {useTemplateUndo} from "../../hooks/useTemplateUndo";
import {singleNodeDs, withChildFundingLineDs} from "../Services/templateBuilderTestData";
import {renderHook} from '@testing-library/react-hooks';

function mockIndexedDb() {
    const originalService = jest.requireActual('../../types/TemplateBuilder/TemplateBuilderDatabase');
    const Dexie = require('dexie');
    Dexie.dependencies.indexedDB = require('fake-indexeddb');
    Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
    class MockTemplateBuilderDatabase extends Dexie {
        history!: Dexie.Table<any, string>;

        constructor() {
            super("TemplateBuilderDatabase");
            this.version(1).stores({
                history: "++id, key, storageKey, templateJson"
            });
            this.history = this.table("history");
        }
    }
    return {
        ...originalService,
        db: new MockTemplateBuilderDatabase()
    }
}

jest.mock('../../types/TemplateBuilder/TemplateBuilderDatabase', () => mockIndexedDb());

const useStateSpy = jest.spyOn(React, 'useState');
useStateSpy.mockImplementation(() => ['12345', () => {}]);

beforeEach(async () => {
    const {deleteDb} = require('../../services/indexedDbWrapper/');
    await deleteDb();
});

it("returns zero undo and redo count on initial render", async () => {
    const updateMock = jest.fn();

    const {result} = renderHook(() => useTemplateUndo(updateMock));

    expect(await result.current.undoCount()).toEqual(0);
    expect(await result.current.redoCount()).toEqual(0);
});

it("initialiseState calls update function and saves to indexedDb", async () => {
    const {findByKey} = require('../../services/indexedDbWrapper/');
    const updateMock = jest.fn();
    const {result} = renderHook(() => useTemplateUndo(updateMock));

    await result.current.initialiseState(singleNodeDs);

    const currentState = await findByKey("templateBuilderState-12345");
    expect(currentState).toEqual({id: 1, key: "templateBuilderState-12345", storageKey: "12345", templateJson: JSON.stringify(singleNodeDs)});
    expect(await result.current.undoCount()).toEqual(0);
    expect(await result.current.redoCount()).toEqual(0);
    expect(updateMock).toBeCalled();
});

it("updatePresentState calls update function and sets correct current and past state", async () => {
    const {findByKey} = require('../../services/indexedDbWrapper/');
    const updateMock = jest.fn();
    const {result} = renderHook(() => useTemplateUndo(updateMock));
    await result.current.initialiseState(singleNodeDs);

    await result.current.updatePresentState(withChildFundingLineDs);

    const currentState = await findByKey("templateBuilderState-12345");
    const pastState = await findByKey("templateBuilderPastState-12345");
    expect(currentState).toEqual({id: 1, key: "templateBuilderState-12345", storageKey: "12345", templateJson: JSON.stringify(withChildFundingLineDs)});
    expect(pastState).toEqual({id: 2, key: "templateBuilderPastState-12345", storageKey: "12345", templateJson: JSON.stringify([singleNodeDs])});
    expect(await result.current.undoCount()).toEqual(1);
    expect(await result.current.redoCount()).toEqual(0);
    expect(updateMock).toBeCalled();
});

it("undo calls update function and sets correct past, current and future state", async () => {
    const {findByKey} = require('../../services/indexedDbWrapper/');
    const updateMock = jest.fn();
    const {result} = renderHook(() => useTemplateUndo(updateMock));
    await result.current.initialiseState(singleNodeDs);
    await result.current.updatePresentState(withChildFundingLineDs);

    await result.current.undo();

    const currentState = await findByKey("templateBuilderState-12345");
    const pastState = await findByKey("templateBuilderPastState-12345");
    const futureState = await findByKey("templateBuilderFutureState-12345");
    expect(currentState).toEqual({id: 1, key: "templateBuilderState-12345", storageKey: "12345", templateJson: JSON.stringify(singleNodeDs)});
    expect(pastState).toEqual({id: 2, key: "templateBuilderPastState-12345", storageKey: "12345", templateJson: JSON.stringify([])});
    expect(futureState).toEqual({id: 3, key: "templateBuilderFutureState-12345", storageKey: "12345", templateJson: JSON.stringify([withChildFundingLineDs])});
    expect(await result.current.undoCount()).toEqual(0);
    expect(await result.current.redoCount()).toEqual(1);
    expect(updateMock).toBeCalled();
});

it("redo calls update function and sets correct past, current and future state", async () => {
    const {findByKey} = require('../../services/indexedDbWrapper/');
    const updateMock = jest.fn();
    const {result} = renderHook(() => useTemplateUndo(updateMock));
    await result.current.initialiseState(singleNodeDs);
    await result.current.updatePresentState(withChildFundingLineDs);
    await result.current.undo();

    await result.current.redo();

    const currentState = await findByKey("templateBuilderState-12345");
    const pastState = await findByKey("templateBuilderPastState-12345");
    const futureState = await findByKey("templateBuilderFutureState-12345");
    expect(currentState).toEqual({id: 1, key: "templateBuilderState-12345", storageKey: "12345", templateJson: JSON.stringify(withChildFundingLineDs)});
    expect(pastState).toEqual({id: 2, key: "templateBuilderPastState-12345", storageKey: "12345", templateJson: JSON.stringify([singleNodeDs])});
    expect(futureState).toEqual({id: 3, key: "templateBuilderFutureState-12345", storageKey: "12345", templateJson: JSON.stringify([])});
    expect(await result.current.undoCount()).toEqual(1);
    expect(await result.current.redoCount()).toEqual(0);
    expect(updateMock).toBeCalled();
});


