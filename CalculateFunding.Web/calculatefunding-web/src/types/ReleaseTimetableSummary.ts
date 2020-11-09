export interface Content {
    externalPublicationDate?: string;
    earliestPaymentAvailableDate?: string;
}

export interface ReleaseTimetableSummary {
    statusCode: number;
    content: Content;
}

export interface ReleaseTimetableViewModel {
    navisionDate: Date;
    releaseDate: Date;
    earliestPaymentAvailableDate: string;
    externalPublicationDate: string;
}