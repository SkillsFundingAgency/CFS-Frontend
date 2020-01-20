export interface Content {
    externalPublicationDate: Date;
    earliestPaymentAvailableDate: Date;
}

export interface ReleaseTimetableSummary {
    statusCode: number;
    content: Content;
}