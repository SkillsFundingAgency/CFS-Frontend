import {render, screen, within} from "@testing-library/react";
import React from "react";
import SpecificationDataRelationshipsGrid, {SpecificationDataRelationshipsGridProps} from "../../../components/Datasets/SpecificationDataRelationshipsGrid";
import {DatasetRelationshipType} from "../../../types/Datasets/DatasetRelationshipType";
import {SpecificationDatasetRelationshipsViewModelItem} from "../../../types/Datasets/SpecificationDatasetRelationshipsViewModel";
import {QueryClient, QueryClientProvider} from "react-query";
import {Switch} from "react-router-dom";
import {MemoryRouter} from "react-router";
import {convertToSlug} from "../../../helpers/stringHelper";

const renderComponent = (params: SpecificationDataRelationshipsGridProps) => {
    return render(
        <MemoryRouter initialEntries={['/Datasets/DataRelationships/SPEC123']}>
            <QueryClientProvider client={new QueryClient()}>
                <Switch>
                    <SpecificationDataRelationshipsGrid
                        converterWizardJobs={params.converterWizardJobs}
                        isLoadingDatasetRelationships={params.isLoadingDatasetRelationships}
                        datasetRelationships={params.datasetRelationships}
                    />
                </Switch>
            </QueryClientProvider>
        </MemoryRouter>
    );
};


describe('<SpecificationDataRelationshipsGrid />', () => {
    afterAll(() => jest.clearAllMocks());

    describe('when loading without finding any data', () => {
        it('renders No Data notification', async () => {
            const params: SpecificationDataRelationshipsGridProps = {
                converterWizardJobs: [],
                datasetRelationships: [],
                isLoadingDatasetRelationships: false
            };
            await renderComponent(params);

            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
            expect(screen.queryByTestId("no-data")).toBeInTheDocument();
        });
    });

    describe('when loading with data', () => {
        it('renders correct data', async () => {
            const params: SpecificationDataRelationshipsGridProps = {
                converterWizardJobs: [],
                datasetRelationships: [dataRelationship1, dataRelationship2, dataRelationship3],
                isLoadingDatasetRelationships: false
            };
            await renderComponent(params);

            expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
            
            const data1Row = screen.getByTestId(`tr-relationship-${convertToSlug(dataRelationship1.relationshipId)}`);
            expect(data1Row).toBeInTheDocument();
            expect(within(data1Row).getByText(/Relation 111/)).toBeInTheDocument();
            expect(within(data1Row).getByText(/Definition XXX/)).toBeInTheDocument();
            expect(within(data1Row).queryByText(/not referencing any spec/)).not.toBeInTheDocument();
            expect(within(data1Row).getByRole('cell', {name: /Uploaded data/})).toBeInTheDocument();
            expect(within(data1Row).getByRole('cell', {name: /Dataset AAA \(version 1\)/})).toBeInTheDocument();
            expect(within(data1Row).getByRole('link', {name: /Change/})).toBeInTheDocument();
            
            const data2Row = screen.getByTestId(`tr-relationship-${convertToSlug(dataRelationship2.relationshipId)}`);
            expect(data2Row).toBeInTheDocument();
            expect(within(data2Row).getByText(/Relation 222/)).toBeInTheDocument();
            expect(within(data2Row).getByText(/Ref Spec AAA/)).toBeInTheDocument();
            expect(within(data2Row).queryByText(/no definition name/)).not.toBeInTheDocument();
            expect(within(data2Row).getByRole('cell', {name: /Released data/})).toBeInTheDocument();
            expect(within(data2Row).getByRole('cell', {name: /Dataset BBB \(version 1\)/})).toBeInTheDocument();
            expect(within(data2Row).getByRole('link', {name: /Change/})).toBeInTheDocument();

            const data3Row = screen.getByTestId(`tr-relationship-${convertToSlug(dataRelationship3.relationshipId)}`);
            expect(data3Row).toBeInTheDocument();
            expect(within(data3Row).getByText(/Relation 333/)).toBeInTheDocument();
            expect(within(data3Row).getByText(/Definition YYY/)).toBeInTheDocument();
            expect(within(data3Row).queryByText(/not referencing any spec/)).not.toBeInTheDocument();
            expect(within(data3Row).getByRole('cell', {name: /Uploaded data/})).toBeInTheDocument();
            expect(within(data3Row).getByRole('cell', {name: /No data source file mapped/})).toBeInTheDocument();
            expect(within(data3Row).getByRole('link', {name: /Map/})).toBeInTheDocument();
        });
    });
});


function makeDataRelationship(props: {
    relationshipId: string,
    relationName: string,
    datasetName: string | null,
    definitionName: string,
    referencedSpecificationName: string,
    hasDataSourceFileToMap: boolean,
    type: DatasetRelationshipType
}): SpecificationDatasetRelationshipsViewModelItem {
    return {
        converterEligible: false,
        converterEnabled: false,
        datasetId: 'asdfasdf',
        datasetName: props.datasetName,
        datasetVersion: 1,
        definitionDescription: "",
        definitionId: "",
        definitionName: props.definitionName,
        hasDataSourceFileToMap: props.hasDataSourceFileToMap,
        isLatestVersion: false,
        isProviderData: false,
        lastUpdatedAuthorName: "",
        lastUpdatedDate: new Date(),
        relationName: props.relationName,
        referencedSpecificationName: props.referencedSpecificationName,
        relationshipDescription: "",
        relationshipId: props.relationshipId,
        relationshipType: props.type
    };
}

const dataRelationship1 = makeDataRelationship({
    relationshipId: 'rel111',
    relationName: 'Relation 111',
    datasetName: 'Dataset AAA',
    definitionName: 'Definition XXX',
    referencedSpecificationName: 'not referencing any spec',
    hasDataSourceFileToMap: true,
    type: DatasetRelationshipType.Uploaded
});
const dataRelationship2 = makeDataRelationship({
    relationshipId: 'rel222',
    relationName: 'Relation 222',
    referencedSpecificationName: 'Ref Spec AAA',
    datasetName: 'Dataset BBB',
    definitionName: 'no definition name',
    hasDataSourceFileToMap: true,
    type: DatasetRelationshipType.ReleasedData
});
const dataRelationship3 = makeDataRelationship({
    relationshipId: 'rel333',
    relationName: 'Relation 333',
    referencedSpecificationName: 'not referencing any spec',
    datasetName: null,
    definitionName: 'Definition YYY',
    hasDataSourceFileToMap: true,
    type: DatasetRelationshipType.Uploaded
});