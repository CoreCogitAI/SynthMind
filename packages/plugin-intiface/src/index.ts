import { ButtplugClient, ButtplugNodeWebsocketClientConnector } from "buttplug";
import { validateIntifaceConfig, type IntifaceConfig } from "./environment";
import type {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    Plugin,
    State,
} from "@elizaos/core";
import { Service, ServiceType } from "@elizaos/core";
import {
    isPortAvailable,
    startIntifaceEngine,
    shutdownIntifaceEngine,
} from "./utils";

/**
 * Interface for Intiface service functions.
 * @interface IIntifaceService
 * @extends {Service}
 */
 * @method vibrate
 * @param {number} strength - The strength of the vibration.
 * @param {number} duration - The duration of the vibration.
 * @returns {Promise<void>} Promise that resolves when the vibration is complete.
 * 
 * @method rotate?
 * @param {number} strength - The strength of the rotation.
 * @param {number} duration - The duration of the rotation.
 * @returns {Promise<void>} Promise that resolves when the rotation is complete.
 * 
 * @method getBatteryLevel?
 * @returns {Promise<number>} Promise that resolves with the battery level.
 * 
 * @method isConnected
 * @returns {boolean} Whether the device is connected.
 * 
 * @method getDevices
 * @returns {any[]} An array of devices.
 */
 * /
export interface IIntifaceService extends Service {
    vibrate(strength: number, duration: number): Promise<void>;
    rotate?(strength: number, duration: number): Promise<void>;
    getBatteryLevel?(): Promise<number>;
    isConnected(): boolean;
    getDevices(): any[];
}

/**
 * Intiface service class that implements IIntifaceService interface.
 * Manages connection, device handling, vibration, battery level retrieval, and rotation
 * for Buttplug-compatible devices through Intiface Engine.
 * @extends Service
 * @implements IIntifaceService
 */
export class IntifaceService extends Service implements IIntifaceService {
    static serviceType: ServiceType = ServiceType.INTIFACE;
    private client: ButtplugClient;
    private connected = false;
    private devices: Map<string, any> = new Map();
    private vibrateQueue: VibrateEvent[] = [];
    private isProcessingQueue = false;
    private config: IntifaceConfig | null = null;
    private maxVibrationIntensity = 1;
    private rampUpAndDown = false;
    private rampSteps = 20;
    private preferredDeviceName: string | undefined;

/**
 * Constructor for initializing a new instance of the class.
 * - Instantiates a new ButtplugClient with a temporary name.
 * - Adds event listeners for deviceadded and deviceremoved events to call handleDeviceAdded and handleDeviceRemoved methods respectively.
 * - Adds cleanup handlers for SIGINT, SIGTERM, and exit signals to call the cleanup method.
 */
    constructor() {
        super();
        this.client = new ButtplugClient("Temporary Name");

        this.client.addListener(
            "deviceadded",
            this.handleDeviceAdded.bind(this)
        );
        this.client.addListener(
            "deviceremoved",
            this.handleDeviceRemoved.bind(this)
        );

        // Add cleanup handlers
        process.on("SIGINT", this.cleanup.bind(this));
        process.on("SIGTERM", this.cleanup.bind(this));
        process.on("exit", this.cleanup.bind(this));
    }

/**
 * Cleans up the Intiface service by disconnecting the client and shutting down the Intiface Engine.
 */
    private async cleanup() {
        try {
            if (this.connected) {
                await this.client.disconnect();
            }
            await shutdownIntifaceEngine();
        } catch (error) {
            console.error("[IntifaceService] Cleanup error:", error);
        }
    }

/**
 * Returns the current instance of the Intiface Service.
 * @returns {IIntifaceService} The current instance of the Intiface Service.
 */
    getInstance(): IIntifaceService {
        return this;
    }

/**
 * Asynchronously initializes the agent with the provided runtime.
 * 
 * @param {IAgentRuntime} runtime The runtime object to initialize the agent with.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 */
    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.config = await validateIntifaceConfig(runtime);
        this.preferredDeviceName = this.config.DEVICE_NAME;
        this.client = new ButtplugClient(this.config.INTIFACE_NAME);

        if (this.config.INTIFACE_URL) {
            await this.connect();
        }
    }

/**
 * Asynchronous function to connect to the Intiface server.
 * If already connected or config not set, no action is taken.
 * Checks if port 12345 is available, if so starts the Intiface Engine.
 * Connects to the server using a websocket client connector,
 * marks as connected and initiates a scan for devices.
 * Retries the connection if unsuccessful up to 5 times with a 2 second delay.
 * 
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 * @throws {Error} If connection fails after all retries.
 */
    async connect() {
        if (this.connected || !this.config) return;

        const portAvailable = await isPortAvailable(12345);

        if (portAvailable) {
            try {
                await startIntifaceEngine();
            } catch (error) {
                console.error("Failed to start Intiface Engine:", error);
                throw error;
            }
        } else {
            console.log(
                "Port 12345 is in use, assuming Intiface is already running"
            );
        }

        let retries = 5;
        while (retries > 0) {
            try {
                const connector = new ButtplugNodeWebsocketClientConnector(
                    this.config.INTIFACE_URL
                );

                await this.client.connect(connector);
                this.connected = true;
                await this.scanAndGrabDevices();
                return;
            } catch (error) {
                retries--;
                if (retries > 0) {
                    console.log(
                        `Connection attempt failed, retrying... (${retries} attempts left)`
                    );
                    await new Promise((r) => setTimeout(r, 2000));
                } else {
                    console.error(
                        "Failed to connect to Intiface server after all retries:",
                        error
                    );
                    throw error;
                }
            }
        }
    }

/**
 * Asynchronous function to scan for devices using the client.
 * Starts scanning, waits for 2 seconds, then grabs the devices found.
 * Devices are added to a map with their names as keys.
 * If no devices are found, logs a message saying so.
 */
    private async scanAndGrabDevices() {
        await this.client.startScanning();
        console.log("Scanning for devices...");
        await new Promise((r) => setTimeout(r, 2000));

        this.client.devices.forEach((device) => {
            this.devices.set(device.name, device);
            console.log(`- ${device.name} (${device.index})`);
        });

        if (this.devices.size === 0) {
            console.log("No devices found");
        }
    }

/**
 * Ensures that a device is available for communication with the Intiface server.
 * If not already connected to the server, an error is thrown.
 * If no devices are currently available, a scan is initiated to discover devices.
 * If no devices are found after scanning, an error is thrown.
 * By default, the first available device is returned, unless a preferred device name is specified.
 * If a preferred device is set but not found, a warning is logged and the first available device is returned.
 * @returns {Object} The target device available for communication.
 */
    private async ensureDeviceAvailable() {
        if (!this.connected) {
            throw new Error("Not connected to Intiface server");
        }

        if (this.devices.size === 0) {
            await this.scanAndGrabDevices();
        }

        const devices = this.getDevices();
        if (devices.length === 0) {
            throw new Error("No devices available");
        }

        let targetDevice;
        if (this.preferredDeviceName) {
            targetDevice = this.devices.get(this.preferredDeviceName);
            if (!targetDevice) {
                console.warn(
                    `Preferred device ${this.preferredDeviceName} not found, using first available device`
                );
                targetDevice = devices[0];
            }
        } else {
            targetDevice = devices[0];
        }

        return targetDevice;
    }

/**
 * Disconnects the client if it is currently connected. Clears the list of devices and sets the connected status to false.
 */
    async disconnect() {
        if (!this.connected) return;
        await this.client.disconnect();
        this.connected = false;
        this.devices.clear();
    }

/**
 * Handle when a device is added.
 * 
 * @param {any} device - The device being added.
 */
    private handleDeviceAdded(device: any) {
        this.devices.set(device.name, device);
        console.log(`Device connected: ${device.name}`);
    }

/**
 * Handles the event when a device is removed.
 * 
 * @param {any} device - The device that was removed.
 */
    private handleDeviceRemoved(device: any) {
        this.devices.delete(device.name);
        console.log(`Device disconnected: ${device.name}`);
    }

/**
 * Retrieve all devices from the collection.
 * 
 * @returns {Array} An array containing all devices.
 */ 
       
    getDevices() {
        return Array.from(this.devices.values());
    }

/**
 * Check if the object is currently connected.
 * @returns {boolean} True if connected, false if not connected.
 */
    isConnected() {
        return this.connected;
    }

/**
 * Adds a VibrateEvent to the vibrateQueue and processes the queue if it is not already being processed.
 * 
 * @param {VibrateEvent} event - The VibrateEvent to add to the queue.
 * @returns {Promise<void>} - A Promise that resolves once the event is added to the queue and processed.
 */
    private async addToVibrateQueue(event: VibrateEvent) {
        this.vibrateQueue.push(event);
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            await this.processVibrateQueue();
        }
    }

/**
 * Process and handle items in the vibrate queue asynchronously.
 */
    private async processVibrateQueue() {
        while (this.vibrateQueue.length > 0) {
            const event = this.vibrateQueue[0];
            await this.handleVibrate(event);
            this.vibrateQueue.shift();
        }
        this.isProcessingQueue = false;
    }

/**
 * Handles the vibrate event by ramping up and down the intensity of the vibration if `rampUpAndDown` is true,
 * and vibrate at a constant intensity otherwise. 
 * 
 * @param event - The VibrateEvent object containing the duration and strength of the vibration.
 * @returns {Promise<void>} - A promise that resolves once the vibration handling is completed.
 */
    private async handleVibrate(event: VibrateEvent) {
        const targetDevice = await this.ensureDeviceAvailable();

        if (this.rampUpAndDown) {
            const steps = this.rampSteps;
            const rampLength = (event.duration * 0.2) / steps;
            let startIntensity = 0;
            let endIntensity = event.strength;
            let stepIntensity = (endIntensity - startIntensity) / steps;

            // Ramp up
            for (let i = 0; i <= steps; i++) {
                await targetDevice.vibrate(startIntensity + stepIntensity * i);
                await new Promise((r) => setTimeout(r, rampLength));
            }

            // Hold
            await new Promise((r) => setTimeout(r, event.duration * 0.54));

            // Ramp down
            startIntensity = event.strength;
            endIntensity = 0;
            stepIntensity = (endIntensity - startIntensity) / steps;

            for (let i = 0; i <= steps; i++) {
                await targetDevice.vibrate(startIntensity + stepIntensity * i);
                await new Promise((r) => setTimeout(r, rampLength));
            }
        } else {
            await targetDevice.vibrate(event.strength);
            await new Promise((r) => setTimeout(r, event.duration));
        }

        await targetDevice.stop();
    }

/**
 * Vibrate the device with specified strength and duration.
 * 
 * @param {number} strength - The strength of the vibration.
 * @param {number} duration - The duration of the vibration.
 * @returns {Promise<void>} A promise that resolves when the vibration is completed.
 */
    async vibrate(strength: number, duration: number): Promise<void> {
        const targetDevice = await this.ensureDeviceAvailable();
        await this.addToVibrateQueue({
            strength,
            duration,
            deviceId: targetDevice.id,
        });
    }

/**
 * Asynchronously retrieves the battery level of the device.
 * 
 * @returns {Promise<number>} The battery level as a percentage.
 */
    async getBatteryLevel(): Promise<number> {
        const targetDevice = await this.ensureDeviceAvailable();

        try {
            const battery = await targetDevice.battery();
            console.log(
                `Battery level for ${targetDevice.name}: ${battery * 100}%`
            );
            return battery;
        } catch (err) {
            console.error("Error getting battery level:", err);
            throw err;
        }
    }

/**
 * Rotates the device with the specified strength and duration.
 * 
 * @param {number} strength - The strength of the rotation.
 * @param {number} duration - The duration of the rotation.
 * @returns {Promise<void>} A Promise that resolves when the rotation is complete.
 * @throws {Error} If the device does not support rotation.
 */ 
    async rotate(strength: number, duration: number): Promise<void> {
        const targetDevice = await this.ensureDeviceAvailable();

        // Check if device supports rotation
        if (!targetDevice.rotateCmd) {
            throw new Error("Device does not support rotation");
        }

        if (this.rampUpAndDown) {
            await this.rampedRotate(targetDevice, strength, duration);
        } else {
            await targetDevice.rotate(strength);
            await new Promise((r) => setTimeout(r, duration));
            await targetDevice.stop();
        }
    }

/**
 * Ramp up the rotation strength of a device to a target strength over a specified duration,
 * hold that strength for a period, then ramp it back down to zero.
 * 
 * @param {any} device - The device to rotate.
 * @param {number} targetStrength - The target strength to ramp up to.
 * @param {number} duration - The total duration of the ramping process.
 * @returns {Promise<void>}
 */
    private async rampedRotate(
        device: any,
        targetStrength: number,
        duration: number
    ) {
        const stepTime = (duration * 0.2) / this.rampSteps;

        // Ramp up
        for (let i = 0; i <= this.rampSteps; i++) {
            const intensity = (targetStrength / this.rampSteps) * i;
            await device.rotate(intensity);
            await new Promise((r) => setTimeout(r, stepTime));
        }

        // Hold
        await new Promise((r) => setTimeout(r, duration * 0.6));

        // Ramp down
        for (let i = this.rampSteps; i >= 0; i--) {
            const intensity = (targetStrength / this.rampSteps) * i;
            await device.rotate(intensity);
            await new Promise((r) => setTimeout(r, stepTime));
        }

        await device.stop();
    }
}

const vibrateAction: Action = {
    name: "VIBRATE",
    similes: ["VIBRATE_TOY", "VIBRATE_DEVICE", "START_VIBRATION", "BUZZ"],
    description: "Control vibration intensity of connected devices",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        try {
            await validateIntifaceConfig(runtime);
            return true;
        } catch {
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        const service = runtime.getService<IIntifaceService>(
            ServiceType.INTIFACE
        );
        if (!service) {
            throw new Error("Intiface service not available");
        }

        // Extract intensity and duration from message
        // Default to 50% intensity for 2 seconds if not specified
        const intensity = options?.intensity ?? 0.5;
        const duration = options?.duration ?? 2000;

        await service.vibrate(intensity, duration);

        callback({
            text: `Vibrating at ${intensity * 100}% intensity for ${duration}ms`,
        });
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Vibrate the toy at 70% for 3 seconds" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Vibrating at 70% intensity for 3000ms",
                    action: "VIBRATE",
                    options: { intensity: 0.7, duration: 3000 },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Start vibrating" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Vibrating at 50% intensity for 2000ms",
                    action: "VIBRATE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Make it buzz at max power for 5 seconds" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Vibrating at 100% intensity for 5000ms",
                    action: "VIBRATE",
                    options: { intensity: 1.0, duration: 5000 },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Give me a gentle buzz" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Vibrating at 25% intensity for 2000ms",
                    action: "VIBRATE",
                    options: { intensity: 0.25, duration: 2000 },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Vibrate for 10 seconds" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Vibrating at 50% intensity for 10000ms",
                    action: "VIBRATE",
                    options: { intensity: 0.5, duration: 10000 },
                },
            },
        ],
    ],
};

const rotateAction: Action = {
    name: "ROTATE",
    similes: ["ROTATE_TOY", "ROTATE_DEVICE", "START_ROTATION", "SPIN"],
    description: "Control rotation intensity of connected devices",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        try {
            await validateIntifaceConfig(runtime);
            return true;
        } catch {
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        const service = runtime.getService<IIntifaceService>(
            ServiceType.INTIFACE
        );
        if (!service || !service.rotate) {
            throw new Error("Rotation not supported");
        }

        const intensity = options?.intensity ?? 0.5;
        const duration = options?.duration ?? 2000;

        await service.rotate(intensity, duration);

        callback({
            text: `Rotating at ${intensity * 100}% intensity for ${duration}ms`,
        });
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Rotate the toy at 70% for 3 seconds" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Rotating at 70% intensity for 3000ms",
                    action: "ROTATE",
                    options: { intensity: 0.7, duration: 3000 },
                },
            },
        ],
    ],
};

const batteryAction: Action = {
    name: "BATTERY",
    similes: [
        "CHECK_BATTERY",
        "BATTERY_LEVEL",
        "TOY_BATTERY",
        "DEVICE_BATTERY",
    ],
    description: "Check battery level of connected devices",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        try {
            await validateIntifaceConfig(runtime);
            return true;
        } catch {
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        const service = runtime.getService<IIntifaceService>(
            ServiceType.INTIFACE
        );
        if (!service || !service.getBatteryLevel) {
            throw new Error("Battery level check not supported");
        }

        try {
            const batteryLevel = await service.getBatteryLevel();
            callback({
                text: `Device battery level is at ${Math.round(batteryLevel * 100)}%`,
            });
        } catch (err) {
            callback({
                text: "Unable to get battery level. Device might not support this feature.",
            });
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What's the battery level?" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Device battery level is at 90%",
                    action: "BATTERY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Check toy battery" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Device battery level is at 75%",
                    action: "BATTERY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "How much battery is left?" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Device battery level is at 45%",
                    action: "BATTERY",
                },
            },
        ],
    ],
};

/**
 * Interface representing a vibrate event.
 * @property {number} duration - The duration of the vibration in milliseconds.
 * @property {number} strength - The strength of the vibration.
 * @property {number} [deviceId] - The device ID associated with the vibration event (optional).
 */
interface VibrateEvent {
    duration: number;
    strength: number;
    deviceId?: number;
}

export const intifacePlugin: Plugin = {
    name: "intiface",
    description: "Controls intimate hardware devices",
    actions: [vibrateAction, rotateAction, batteryAction],
    evaluators: [],
    providers: [],
    services: [new IntifaceService()],
};

export default intifacePlugin;
