export interface GraphCalculation {
  calculationid: string;
  specificationId: string;
  calculationName: string;
  calculationType: string;
  fundingStream: string;
}

export interface CircularReferenceError {
  node: GraphCalculation;
  relationships: GraphCalculationRelationship[];
}

export interface GraphCalculationRelationship {
  source: GraphCalculation;
  target: GraphCalculation;
}