export interface Content {
    externalPublicationDate: string;
    earliestPaymentAvailableDate: string;
}

export interface ReleaseTimetableSummary {
    statusCode: number;
    content: Content;
}

export interface ReleaseTimetableViewModel {
    navisionDate: {
        day: string,
        month: string,
        year: string,
        time: string
    };
    releaseDate: {
        day: string,
        month: string,
        year: string,
        time: string
    }
}