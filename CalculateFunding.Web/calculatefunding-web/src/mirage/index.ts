import {createServer} from "miragejs";
import {SpecificationListResultsItem} from "../types/Specifications/SpecificationListResults";
import {PublishedProviderSearchFacet} from "../types/publishedProviderSearchRequest";
import {FundingConfiguration} from "../types/FundingConfiguration";
import {FundingPeriod, FundingStream} from "../types/viewFundingTypes";
import {ApprovalMode} from "../types/ApprovalMode";
import {UpdateCoreProviderVersion} from "../types/Provider/UpdateCoreProviderVersion";
import {ProviderSource} from "../types/CoreProviderSummary";
import {FundingStreamPermissions} from "../types/FundingStreamPermissions";
import {EffectiveSpecificationPermission} from "../types/EffectiveSpecificationPermission";
import {buildEffectiveSpecificationPermission, buildPermissions} from "../tests/fakes/testFactories";


const spec1: SpecificationListResultsItem = {
    id: "111",
    name: "PSG 19-20",
    fundingPeriodName: "Schools Academic Year 2019-20",
    fundingPeriodId: "say1920",
    fundingStreamNames: ["PE and Sport Premium Grant"],
    fundingStreamIds: ["PSG"],
    lastUpdatedDate: undefined,
    status: "Draft",
    description: "lorem ipsum lalala",
    isSelectedForFunding: false,
};
const spec2: SpecificationListResultsItem = {
    id: "222",
    name: "DSG 21-22",
    fundingPeriodName: "Academies Academic Year 2021-22",
    fundingPeriodId: "aay2122",
    fundingStreamNames: ["Dedicated Schools Grant"],
    fundingStreamIds: ["DSG"],
    lastUpdatedDate: undefined,
    status: "Approved",
    description: "blablabla",
    isSelectedForFunding: true,
};

export function makeServer({environment = "test"}) {

    const data = mockApiData();

    return createServer({
        environment,

        routes() {
            this.namespace = "/api";

            this.get(
                '/specs/*',
                (schema, request) => {
                    return data.getSpecifications()
                }
            );
            this.get(
                '/account/IsAuthenticated',
                () => ({})
            );
            this.get(
                '/account/hasConfirmedSkills',
                (schema, request) => {
                    return {}
                }
            );
            this.get(
                '/getConfirmedSkills',
                (schema, request) => {
                    return {}
                }
            );
            this.get(
                `/api/specification/:id/obsoleteitems`,
                (schema, request) => {
                    return {}
                }
            );
            this.get(
                `/api/policy/configuration/:fundingStreamId/:fundingPeriodId`,
                (schema, request) => {
                    return {
                        fundingPeriodId: data.fundingPeriod1.id,
                        fundingStreamId: data.fundingStream1.id,
                        defaultTemplateVersion: '1',
                        enableConverterDataMerge: true,
                        providerSource: ProviderSource.CFS,
                        updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
                        approvalMode: ApprovalMode.All,
                    } as FundingConfiguration
                }
            );
            this.post(
                '/jobs/*',
                (schema, request) => {
                    return {}
                }
            );
            this.post(
                '/notifications/*',
                (schema, request) => {
                    return {}
                }
            );
            this.get(
                '/featureflags',
                (schema, request) => {
                    return [{"name": "EnableReactQueryDevTool", "isEnabled": true},
                        {"name": "EnableSwagger", "isEnabled": true},
                        {"name": "ProfilingPatternVisible", "isEnabled": true},
                        {"name": "SpecToSpec", "isEnabled": true},
                        {"name": "TemplateBuilderVisible", "isEnabled": true}]
                }
            );
            this.post(
                '/users/*',
                (schema, request) => {
                    return {}
                }
            );
            this.get(
                '/users/*',
                (schema, request): FundingStreamPermissions[] | EffectiveSpecificationPermission => {
                    if (request.url.includes('effectivepermissions')) {
                        return buildEffectiveSpecificationPermission({
                            specificationId: request.url.includes(spec1.id) ? spec1.id :
                                request.url.includes(spec2.id) ? spec2.id : '?',
                            setAllPermsEnabled: true
                        });
                    } else if (request.url.includes('fundingstreams')) {
                        return [
                            buildPermissions({
                                fundingStreamId: 'DSG',
                                fundingStreamName: 'Dedicated Schools Grant',
                                setAllPermsEnabled: true
                            }), buildPermissions({
                                fundingStreamId: 'PSG',
                                fundingStreamName: 'PE and Sport Premium Grant',
                                setAllPermsEnabled: true
                            })
                        ]
                    } else {
                        return [];
                    }
                });
        }
    });
}


export const mockApiData = () => {

    const fundingPeriod1: FundingPeriod = {
        id: "say1920",
        name: "Schools Academic Year 2019-20",
    };
    const fundingPeriod2: FundingPeriod = {
        id: "aay2122",
        name: "Academies Academic Year 2021-22",
    };
    const fundingStream1: FundingStream = {
        id: "PSG",
        name: "PE and Sport Premium Grant",
    };
    const fundingStream2: FundingStream = {
        id: "DSG",
        name: "Dedicated Schools Grant",
    };


    function getSpecifications() {
        return {
            totalCount: 2,
            startItemNumber: 1,
            endItemNumber: 2,
            items: [{
                id: "111",
                name: "PSG 19-20",
                fundingPeriodName: "Schools Academic Year 2019-20",
                fundingPeriodId: "say1920",
                fundingStreamNames: ["PE and Sport Premium Grant"],
                fundingStreamIds: ["PSG"],
                lastUpdatedDate: new Date("2021-06-30T14:34:19.146+01:00"),
                status: "Draft",
                description: "lorem ipsum lalala",
                isSelectedForFunding: false,

            } as SpecificationListResultsItem, {
                id: "222",
                name: "DSG 21-22",
                fundingPeriodName: "Academies Academic Year 2021-22",
                fundingPeriodId: "aay2122",
                fundingStreamNames: ["Dedicated Schools Grant"],
                fundingStreamIds: ["DSG"],
                lastUpdatedDate: new Date("2021-06-30T14:33:18.84+01:00"),
                status: "Approved",
                description: "blablabla",
                isSelectedForFunding: true,
            } as SpecificationListResultsItem],
            facets: [{
                name: PublishedProviderSearchFacet.FundingStatus,
                facetValues: [
                    {name: "Draft", count: 1},
                    {name: "Approved", count: 1},
                    {name: "Updated", count: 2}]
            }, {
                name: "fundingPeriodName" as PublishedProviderSearchFacet,
                facetValues: [
                    {name: "Schools Academic Year 2019-20", count: 1},
                    {name: "Academies Academic Year 2021-22", count: 1},
                    {name: "Schools Academic Year 2020-21", count: 1},
                ]
            }, {
                name: "fundingStreamNames" as PublishedProviderSearchFacet,
                facetValues: [
                    {name: "PE and Sport Premium Grant", count: 1},
                    {name: "Dedicated Schools Grant", count: 1},
                ]
            }],
            pagerState: {
                displayNumberOfPages: 1,
                previousPage: 1,
                nextPage: 1,
                lastPage: 1,
                pages: [1],
                currentPage: 1
            }
        };
    }

    return {
        fundingStream1,
        fundingStream2,
        fundingPeriod1,
        fundingPeriod2,
        spec1,
        spec2,
        getSpecifications,
    }
}