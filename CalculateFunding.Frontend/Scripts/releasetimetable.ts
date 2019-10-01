/// <reference path="common.d.ts" />
/// <reference path="provider.completion.vb.ts" />

namespace calculateFunding.releasetimetable {

    export class ReleaseTimetableViewModel {
        public state: KnockoutObservable<string> = ko.observable("idle");

        public specificationId: KnockoutObservable<string> = ko.observable();

        public fundingDay: KnockoutObservable<number> = ko.observable();
        public fundingMonth: KnockoutObservable<number> = ko.observable();
        public fundingYear: KnockoutObservable<number> = ko.observable();
        public fundingTime: KnockoutObservable<string> = ko.observable();
        public statementDay: KnockoutObservable<number> = ko.observable();
        public statementMonth: KnockoutObservable<number> = ko.observable();
        public statementYear: KnockoutObservable<number> = ko.observable();
        public statementTime: KnockoutObservable<string> = ko.observable();
        public saveSuccessful: KnockoutObservable<boolean> = ko.observable(false);
        public saveError: KnockoutObservable<boolean> = ko.observable(false);

        constructor(specificationId: string) {
            this.specificationId(specificationId);

            this.getTimetable();
        }

        public saveTimetable() {
            if (this.state() === "idle") {

                let data = {
                    fundingDate: `${this.fundingYear()}-${this.fundingMonth()}-${this.fundingDay()}T${this.fundingTime()}`,
                    statementDate: `${this.statementYear()}-${this.statementMonth()}-${this.statementDay()}T${this.statementTime()}`,
                    specificationId: `${this.specificationId()}`
                };

                let request = $.ajax({
                    url: `/api/publish/savetimetable`,
                    data: JSON.stringify(data),
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                let self = this;

                request.fail((error) => {
                    let errorMessage = "Error sending code to server:\n";
                    this.saveSuccessful(false);
                    this.saveError(true);
                    self.state("idle");
                });

                request.done((response) => {

                    if (response) {
                        this.saveSuccessful(true);
                        this.saveError(false);
                    }
                    self.state("idle");
                });
            }
        }

        public getTimetable() {
            if (this.state() === "idle") {

                let request = $.ajax({
                    url: `/api/publish/gettimetable/${this.specificationId()}`,
                    dataType: "json",
                    method: "GET",
                    contentType: "application/json"
                });

                let self = this;

                request.fail((error) => {
                    let errorMessage = "Error sending code to server:\n";
                    this.saveSuccessful(false);
                    this.saveError(true);
                    self.state("idle");
                });

                request.done((response) => {

                    if (response) {

                        let result: IReleaseTimetable = response;

                        let statementDate: Date = new Date(result.content.externalPublicationDate);
                        let paymentDate: Date = new Date(result.content.earliestPaymentAvailableDate);

                        let statementHours: string = statementDate.getHours() < 10 ? `0${statementDate.getHours()}` : `${statementDate.getHours()}`;
                        let paymentHours: string = paymentDate.getHours() < 10 ? `0${paymentDate.getHours()}` : `${paymentDate.getHours()}`;

                        let statementMinutes: string = statementDate.getMinutes() < 10 ? `0${statementDate.getMinutes()}` : `${statementDate.getMinutes()}`;
                        let paymentMinutes: string = paymentDate.getMinutes() < 10 ? `0${paymentDate.getMinutes()}` : `${paymentDate.getMinutes()}`;

                        this.statementDay(statementDate.getDate());
                        this.statementMonth(statementDate.getMonth()+1);
                        this.statementYear(statementDate.getFullYear());
                        this.statementTime(`${statementHours}:${statementMinutes}`);

                        this.fundingDay(paymentDate.getDate());
                        this.fundingMonth(paymentDate.getMonth()+1);
                        this.fundingYear(paymentDate.getFullYear());
                        this.fundingTime(`${paymentHours}:${paymentMinutes}`);

                        this.saveSuccessful(true);
                        this.saveError(false);
                    }
                    self.state("idle");
                });
            }
        }


    }

    interface IReleaseTimetable {
        statusCode: number;
        content: IReleaseTimetableContent;
    }

    interface IReleaseTimetableContent {
        externalPublicationDate: string;
        earliestPaymentAvailableDate: string;
    }
}