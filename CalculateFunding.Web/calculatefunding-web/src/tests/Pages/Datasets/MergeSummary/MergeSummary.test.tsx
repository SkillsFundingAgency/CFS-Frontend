import {MergeSummary} from "../../../../pages/Datasets/MergeSummary/MergeSummary";
import {render, waitFor} from "@testing-library/react";
import React from "react";
import {MemoryRouter} from "react-router";

function renderMergeSummary(existingRows:number, additionalRows:number, dataSchemaName:string, dataSourceVersion:number, dataSourceName: string, hidden:boolean) {
    return render(
        <MemoryRouter>
            <MergeSummary
                existingRowsAmended={existingRows}
                additionalRowsCreated={additionalRows}
                dataSchemaName={dataSchemaName}
                dataSourceVersion={dataSourceVersion}
                dataSource={dataSourceName}
                hidden={hidden}
            />
        </MemoryRouter>);
}

describe("<MergeSummary />", ()  => {
    it(" displays the correct additional rows", async () => {
        const {container} = renderMergeSummary(1, 1, "Test DataSchema Name", 1, "Test Data Source Name", false);
        await waitFor(() => expect(container.querySelector("#additional-rows-created")?.textContent).toBe("1"))
    });

    it(" displays the correct existing rows amended", async () => {
        const {container} = renderMergeSummary(1, 1, "Test DataSchema Name", 1, "Test Data Source Name", false);
        await waitFor(() => expect(container.querySelector("#existing-rows-amended")?.textContent).toBe("1"))
    });

    it(" displays the correct data schema name", async () => {
        const {container} = renderMergeSummary(1, 1, "Test DataSchema Name", 1, "Test Data Source Name", false);
        await waitFor(() => expect(container.querySelector("#data-schema")?.textContent).toBe("Test DataSchema Name"))
    });

    it(" displays the correct data source version", async () => {
        const {container} = renderMergeSummary(1, 1, "Test DataSchema Name", 1, "Test Data Source Name", false);
        await waitFor(() => expect(container.querySelector("#data-source-version")?.textContent).toBe("1"))
    });

    it(" displays the correct data source name", async () => {
        const {container} = renderMergeSummary(1, 1, "Test DataSchema Name", 1, "Test Data Source Name", false);
        await waitFor(() => expect(container.querySelector("#data-source")?.textContent).toBe("Test Data Source Name"))
    });

});