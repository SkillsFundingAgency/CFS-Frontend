import nock from "nock";

export function fakeSpecification (specificationId : string) : void  {
    nock(`/api/specs`).get(`/specification-summary-by-id/${specificationId}`).reply(200, {
        "fundingPeriod": {
            "id": "SPECID",
            "name": "Faked Funding Period"
        },
        "fundingStreams": [
            {
                "id": "FakeFundingStreamId",
                "name": "Fake Funding Stream Name"
            }
        ],
        "providerVersionId": "fakeProviderVersionId",
        "description": "Fake Specification Description",
        "isSelectedForFunding": false,
        "approvalStatus": "Draft",
        "templateIds": {
            "FakeTemplate": "1.0"
        },
        "dataDefinitionRelationshipIds": [
            "fake-1",
            "fake-2"
        ],
        "id": "1-fakeId-1",
        "name": "Fake specification"
    });
};