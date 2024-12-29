/**
 * Enum for specifying the mode of the TEE (Trusted Execution Environment).
 * 
 * @readonly
 * @enum {string}
 * @property {string} OFF - TEE is turned off.
 * @property {string} LOCAL - TEE is in local development mode with simulator.
 * @property {string} DOCKER - TEE is in docker development mode with simulator.
 * @property {string} PRODUCTION - TEE is in production mode without simulator.
 */
export enum TEEMode {
    OFF = "OFF",
    LOCAL = "LOCAL",           // For local development with simulator
    DOCKER = "DOCKER",         // For docker development with simulator
    PRODUCTION = "PRODUCTION"  // For production without simulator
}

/**
 * Interface representing a remote attestation quote.
 * @property {string} quote - The attestation quote.
 * @property {number} timestamp - The timestamp when the attestation quote was generated.
 */
export interface RemoteAttestationQuote {
    quote: string;
    timestamp: number;
}