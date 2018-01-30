namespace calculateFunding.compare {
    export class CompareViewModel {
        public original: KnockoutObservable<string> = ko.observable();

        public modified: KnockoutObservable<string> = ko.observable();

        public displayAsInline: KnockoutObservable<boolean> = ko.observable(false);
    }
}