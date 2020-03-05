export interface Profiling {
    totalAllocation: number;
    previousAllocation: number;
    profilingInstallments: ProfilingInstallments [];
}

export interface ProfilingInstallments {
    installmentYear: number,
    installmentMonth: string,
    installmentNumber: number,
    installmentValue: number;
    isPaid: boolean
}
