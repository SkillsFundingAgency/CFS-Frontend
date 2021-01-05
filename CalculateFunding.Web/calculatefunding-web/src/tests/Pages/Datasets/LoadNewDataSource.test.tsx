import React from "react";
import * as redux from "react-redux";
import {render, waitFor, screen, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import {MemoryRouter} from "react-router";

describe("<LoadNewDataSource />", () => {
    beforeAll(() => {
        useSelectorSpy.mockReturnValue([
            {
                fundingStreamId: "1619",
                canUploadDataSourceFiles: false
            },
            {
                fundingStreamId: "GAG",
                canUploadDataSourceFiles: true
            }
        ]);
    });

    afterAll(() => {
        useSelectorSpy.mockReset();
    });

    it('will have the correct breadcrumbs', async () => {
        await renderPage();
        expect(screen.getAllByTestId("breadcrumb").length).toBe(4);
    });

    it('will find the title Upload new data source', async () => {
        await renderPage();
        expect(screen.getByText("Upload new data source")).toBeInTheDocument();
    });

    it('will find the description Load a new data source file to create a dataset to use in calculations.', async () => {
        await renderPage();
        expect(screen.getByText("Load a new data source file to create a dataset to use in calculations.")).toBeInTheDocument();
    });

    it("does not show a permissions message for funding stream where user has canUploadDataSourceFiles permission", async () => {
        await renderPage();

        fireEvent.change(screen.getAllByTestId("input-auto-complete")[0], {target: {value: "GAG"}});
        fireEvent.click(screen.getByTestId("GAG"), {target: {innerText: 'GAG'}});

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        expect(screen.queryByText(/you do not have permissions/i)).not.toBeInTheDocument();
        expect(screen.getByTestId("create-button")).not.toBeDisabled();
    });

    it("filters out funding stream where user does not have canUploadDataSourceFiles permission", async () => {
        await renderPage();

        fireEvent.change(screen.getAllByTestId("input-auto-complete")[0], {target: {value: "1619"}});
        expect(screen.queryByTestId("1619")).not.toBeInTheDocument();
    });
});

// Setup services
jest.mock('../../../services/policyService', () => ({
    getFundingStreamsService: jest.fn(() => Promise.resolve({
        data: [
            {
                "shortName": "1619",
                "id": "1619",
                "name": "1619"
            },
            {
                "shortName": "GAG",
                "id": "GAG",
                "name": "GAG"
            }
        ]
    }))
}));

jest.mock('../../../services/datasetService', () => ({
    getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
        data: [
            {
                "description": "Early Years AP Census Data Year 1",
                "fundingStreamId": "DSG",
                "tableDefinitions": [
                    {
                        "id": "0001100",
                        "name": "Early Years AP Census Year 1",
                        "description": "Early Years AP Census Data Year 1",
                        "fieldDefinitions": [
                            {
                                "id": "0001103",
                                "name": "UKPRN",
                                "identifierFieldType": "UKPRN",
                                "matchExpression": null,
                                "description": "UKPRN",
                                "type": "Integer",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001104",
                                "name": "AP Universal Entitlement 2YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001105",
                                "name": "AP Universal Entitlement 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001106",
                                "name": "AP Universal Entitlement Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001107",
                                "name": "AP Pupil Premium 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001108",
                                "name": "AP Pupil Premium Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            }
                        ]
                    }
                ],
                "id": "0001099",
                "name": "Early Years AP Census Year 1"
            },
            {
                "description": "Early Years AP Census Data Year 2",
                "fundingStreamId": "1619",
                "tableDefinitions": [
                    {
                        "id": "0001150",
                        "name": "Early Years AP Census Year 2",
                        "description": "Early Years AP Census Data Year 2",
                        "fieldDefinitions": [
                            {
                                "id": "0001153",
                                "name": "UKPRN",
                                "identifierFieldType": "UKPRN",
                                "matchExpression": null,
                                "description": "UKPRN",
                                "type": "Integer",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001154",
                                "name": "AP Universal Entitlement 2YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001155",
                                "name": "AP Universal Entitlement 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001156",
                                "name": "AP Universal Entitlement Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001157",
                                "name": "AP Pupil Premium 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001158",
                                "name": "AP Pupil Premium Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            }
                        ]
                    }
                ],
                "id": "0001149",
                "name": "Early Years AP Census Year 2"
            }
        ]
    })),
    getDatasetDefinitionsService: jest.fn(() => Promise.resolve({
        data: [
            {
                "description": "Early Years AP Census Data Year 1",
                "fundingStreamId": "DSG",
                "tableDefinitions": [
                    {
                        "id": "0001100",
                        "name": "Early Years AP Census Year 1",
                        "description": "Early Years AP Census Data Year 1",
                        "fieldDefinitions": [
                            {
                                "id": "0001103",
                                "name": "UKPRN",
                                "identifierFieldType": "UKPRN",
                                "matchExpression": null,
                                "description": "UKPRN",
                                "type": "Integer",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001104",
                                "name": "AP Universal Entitlement 2YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001105",
                                "name": "AP Universal Entitlement 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001106",
                                "name": "AP Universal Entitlement Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001107",
                                "name": "AP Pupil Premium 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001108",
                                "name": "AP Pupil Premium Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            }
                        ]
                    }
                ],
                "id": "0001099",
                "name": "Early Years AP Census Year 1"
            },
            {
                "description": "Early Years AP Census Data Year 2",
                "fundingStreamId": "1619",
                "tableDefinitions": [
                    {
                        "id": "0001150",
                        "name": "Early Years AP Census Year 2",
                        "description": "Early Years AP Census Data Year 2",
                        "fieldDefinitions": [
                            {
                                "id": "0001153",
                                "name": "UKPRN",
                                "identifierFieldType": "UKPRN",
                                "matchExpression": null,
                                "description": "UKPRN",
                                "type": "Integer",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001154",
                                "name": "AP Universal Entitlement 2YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 2 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001155",
                                "name": "AP Universal Entitlement 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001156",
                                "name": "AP Universal Entitlement Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Universal Entitlement Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001157",
                                "name": "AP Pupil Premium 3YO",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium 3 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            },
                            {
                                "id": "0001158",
                                "name": "AP Pupil Premium Rising 4",
                                "identifierFieldType": null,
                                "matchExpression": null,
                                "description": "Alternative Provision Pupil Premium Rising 4 Year Olds",
                                "type": "Decimal",
                                "required": true,
                                "min": null,
                                "max": null,
                                "mustMatch": null,
                                "isAggregable": false
                            }
                        ]
                    }
                ],
                "id": "0001149",
                "name": "Early Years AP Census Year 2"
            }
        ]
    }))
}))

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

const mockHistoryPush = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const renderPage = async () => {
    const {LoadNewDataSource} = require("../../../pages/Datasets/LoadNewDataSource");
    const component = render(
        <MemoryRouter>
            <LoadNewDataSource />
        </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    return component;
}