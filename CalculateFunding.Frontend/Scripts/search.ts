namespace calculateFunding.search{
export class SearchFacet {
        public name: KnockoutObservable<string> = ko.observable();
        public count: KnockoutObservable<number> = ko.observable();
        public fieldName: KnockoutObservable<string> = ko.observable();
        public displayName: KnockoutComputed<string>;

        constructor(name: string, count: number, fieldName: string) {
            if (!name) {
                throw new Error("Name not specificed");
            }
            this.name(name);

            this.count(count);
            if (!fieldName) {
                throw new Error("Field name not specified");
            }
            this.fieldName(fieldName);

            let self = this;

            this.displayName = ko.pureComputed(() => {
                if (!self.name()) {
                    return "";
                }

                if (self.count()) {
                    return self.name() + " (" + self.count() + ")";
                }
                else {
                    return self.name();
                }
            });
        }
    }
}