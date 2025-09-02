declare module 'open-exchange-rates' {
  export interface OXRConfig {
    app_id: string;
  }

  export interface LatestRates {
    disclaimer?: string;
    license?: string;
    timestamp: number;
    base: string;
    rates: Record<string, number>;
  }

  type OXRClient = {
    set(config: OXRConfig): OXRClient;
    latest(callback: (error: Error | null) => void): void;
  } & LatestRates

  const oxr: OXRClient;
  export default oxr;
}
