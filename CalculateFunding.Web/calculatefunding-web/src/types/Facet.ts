import { PublishedProviderSearchFacet } from "./publishedProviderSearchRequest";

export interface FacetValue {
  name: string;
  count: number;
}

export interface Facet {
  name: PublishedProviderSearchFacet;
  facetValues: FacetValue[];
}
