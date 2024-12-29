import WebSocket from "ws";
import EventEmitter from "events";

/**
 * Interface representing a device handshake.
 * @typedef {Object} DeviceHandshake
 * @property {string} identifier - The unique identifier of the device.
 * @property {string} address - The address of the device.
 * @property {number} version - The version number of the device.
 */
interface DeviceHandshake {
    identifier: string;
    address: string;
    version: number;
}

/**
 * Represents an abstract class for simulating a device communication.
 * @abstract
 */
 */
abstract class SimulatedDevice extends EventEmitter {
    protected ws: WebSocket | null = null;
    protected connected = false;
    protected shouldReconnect = true;
    name: string;
    protected cmdLog: Record<number, string> = {};

/**
 * Constructor for creating a simulated device object.
 * @param {number} port - The port number for the device.
 * @param {string} deviceType - The type of device being simulated.
 * @param {string} address - The address of the device.
 */
    constructor(
        protected port: number,
        protected deviceType: string,
        protected address: string
    ) {
        super();
        this.name = `Simulated ${deviceType}`;
        this.connect();
    }

/**
 * Establishes a WebSocket connection to a specified port and handles various events such as opening, receiving messages, errors, and closing the connection.
 */
    private connect(): void {
        if (this.ws || !this.shouldReconnect) return;

        console.log(
            `[fake-buttplug] Connecting ${this.deviceType} to port ${this.port}`
        );
        this.ws = new WebSocket(`ws://127.0.0.1:${this.port}`);

        this.ws.on("open", () => {
            this.connected = true;
            console.log(`[fake-buttplug] ${this.deviceType} connected`);
            const handshake: DeviceHandshake = {
                identifier: this.getIdentifier(),
                address: this.address,
                version: 0,
            };
            this.ws?.send(JSON.stringify(handshake));
        });

        this.ws.on("message", (data: string) => {
            const message = data.toString();
            console.log(
                `[fake-buttplug] ${this.deviceType} received:`,
                message
            );
            this.handleMessage(message);
        });

        this.ws.on("error", (error) => {
            if (this.shouldReconnect) {
                console.log(
                    `[fake-buttplug] ${this.deviceType} error:`,
                    error.message
                );
                this.reconnect();
            }
        });

        this.ws.on("close", () => {
            if (this.shouldReconnect) {
                console.log(`[fake-buttplug] ${this.deviceType} disconnected`);
                this.connected = false;
                this.reconnect();
            }
        });
    }

/**
 * Attempt to reconnect to the server if not currently connected and reconnection is enabled.
 */
    private reconnect(): void {
        if (!this.connected && this.shouldReconnect) {
            this.ws = null;
            setTimeout(() => this.connect(), 1000);
        }
    }

    protected abstract getIdentifier(): string;
    protected abstract handleMessage(message: string): void;

/**
* Asynchronously disconnects the WebSocket connection.
*
* @returns A Promise that resolves when the disconnection process is complete.
*/
    async disconnect(): Promise<void> {
        this.shouldReconnect = false;
        if (this.ws) {
            await this.stop();
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }

    abstract stop(): Promise<void>;
}

/**
 * Class representing a simulated Lovense Nora device.
 * @extends SimulatedDevice
 */ 
export class LovenseNora extends SimulatedDevice {
    private batteryQueryReceived = false;
    private batteryLevel = 0.9;
    private vibrateCmdLog: Record<number, string> = {};
    private rotateCmdLog: Record<number, string> = {};

/**
 * Constructor for Lovense Nora device.
 * 
 * @param {number} port - The port number for the device.
 */
    constructor(port: number = 54817) {
        super(port, "Lovense Nora", "696969696969");
    }

/**
 * Returns the identifier for the LVSDevice.
 * @returns {string} The identifier for the LVSDevice.
 */
    protected getIdentifier(): string {
        return "LVSDevice";
    }

/**
 * Handles incoming messages from the WebSocket server.
 * Checks the message type and responds accordingly:
 * - If the message starts with "DeviceType;", sends the device type response to the server.
 * - If the message starts with "Vibrate:", logs the vibrate command and updates the vibrate command log.
 * - If the message starts with "Rotate:", logs the rotate command and updates the rotate command log.
 * - If the message starts with "Battery", responds with the current battery level to the server.
 * @param {string} message - The message received from the WebSocket server.
 * @returns {void}
 */
    protected handleMessage(message: string): void {
        if (message.startsWith("DeviceType;")) {
            this.ws?.send(`A:${this.address}:10`);
            console.log(
                `[fake-buttplug] Sent device type response: A:${this.address}:10`
            );
        } else if (message.startsWith("Vibrate:")) {
            const match = message.match(/Vibrate:(\d+);/);
            if (match) {
                const speed = parseInt(match[1]);
                if (
                    speed === 0 &&
                    Object.keys(this.vibrateCmdLog).length === 0
                ) {
                    return;
                }
                this.vibrateCmdLog[Date.now()] = message;
                console.log(
                    `[fake-buttplug] Vibrate command logged: ${message}`
                );
            }
        } else if (message.startsWith("Rotate:")) {
            const match = message.match(/Rotate:(\d+);/);
            if (match) {
                const speed = parseInt(match[1]);
                if (
                    speed === 0 &&
                    Object.keys(this.rotateCmdLog).length === 0
                ) {
                    return;
                }
                this.rotateCmdLog[Date.now()] = message;
                console.log(
                    `[fake-buttplug] Rotate command logged: ${message}`
                );
            }
        } else if (message.startsWith("Battery")) {
            this.batteryQueryReceived = true;
            const response = `${Math.floor(this.batteryLevel * 100)};`;
            this.ws?.send(response);
            console.log(
                `[fake-buttplug] Battery query received, responding with: ${response}`
            );
        }
    }

/**
 * Function to vibrate the device at a given speed.
 * @param {number} speed - The speed of vibration, between 0 and 1.
 * @returns {Promise<void>} A Promise that resolves once the vibration command is sent.
 * @throws {Error} Throws an error if the device is not connected.
 */
    async vibrate(speed: number): Promise<void> {
        if (!this.connected || !this.ws) {
            throw new Error("Device not connected");
        }
        const command = `Vibrate:${Math.floor(speed * 100)};`;
        this.ws.send(command);
        console.log(`[fake-buttplug] Sending vibrate command: ${command}`);
    }

/**
 * Rotate the device at the specified speed.
 * @param {number} speed - The speed at which to rotate the device.
 * @returns {Promise<void>} - A promise that resolves once the rotation command is sent.
 * @throws {Error} - If the device is not connected.
 */
    async rotate(speed: number): Promise<void> {
        if (!this.connected || !this.ws) {
            throw new Error("Device not connected");
        }
        const command = `Rotate:${Math.floor(speed * 100)};`;
        this.ws.send(command);
        console.log(`[fake-buttplug] Sending rotate command: ${command}`);
    }

/**
 * Stops all motors by sending stop commands to the connected websocket.
 * If there is no active connection or websocket, the function does nothing.
 * 
 * @returns A Promise that resolves when all motors have been stopped.
 */
    async stop(): Promise<void> {
        if (this.connected && this.ws) {
            this.ws.send("Vibrate:0;");
            this.ws.send("Rotate:0;");
            console.log("[fake-buttplug] Stopping all motors");
        }
    }

/**
 * Async function to get the current battery level of the device.
 * @returns {Promise<number>} The current battery level of the device.
 * @throws {Error} If the device is not connected or websocket is not available.
 */
    async getBatteryLevel(): Promise<number> {
        if (!this.connected || !this.ws) {
            throw new Error("Device not connected");
        }
        this.ws.send("Battery;");
        return this.batteryLevel;
    }
}

// Start simulator if run directly
if (import.meta.url === new URL(import.meta.url).href) {
    console.log("[fake-buttplug] Starting simulator service");
    const simulator = new LovenseNora();

    process.on("SIGINT", async () => {
        console.log("[fake-buttplug] Shutting down simulator");
        await simulator.disconnect();
        process.exit(0);
    });
}
