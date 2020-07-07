export interface FacetValue {
    name: string;
    count: number;
}

export interface Facet {
    name: string;
    facetValues: FacetValue[];
}