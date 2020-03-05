import {ProviderSummary, ProviderTransactionSummary} from "../types/ProviderSummary";
import {Profiling} from "../types/Profiling";

export interface ProviderState {
    providerSummary: ProviderSummary;
    providerTransactionSummary: ProviderTransactionSummary;
    profiling: Profiling;
}