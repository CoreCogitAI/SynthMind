import { PassThrough } from "stream";
import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import { IAgentRuntime, ISpeechService, ServiceType } from "@elizaos/core";
import { getWavHeader } from "./audioUtils.ts";
import { Service } from "@elizaos/core";
import { validateNodeConfig } from "../environment.ts";
import * as Echogarden from "echogarden";
import { elizaLogger } from "@elizaos/core";

/**
 * Prepends a WAV header to a Readable stream of audio data.
 * 
 * @param {Readable} readable The Readable stream of audio data
 * @param {number} audioLength The length of the audio in seconds
 * @param {number} sampleRate The sample rate of the audio
 * @param {number} [channelCount=1] The number of channels in the audio (default is 1)
 * @param {number} [bitsPerSample=16] The number of bits per sample (default is 16)
 * @returns {Readable} A Readable stream with the WAV header prepended
 */
function prependWavHeader(
    readable: Readable,
    audioLength: number,
    sampleRate: number,
    channelCount: number = 1,
    bitsPerSample: number = 16
): Readable {
    const wavHeader = getWavHeader(
        audioLength,
        sampleRate,
        channelCount,
        bitsPerSample
    );
    let pushedHeader = false;
    const passThrough = new PassThrough();
    readable.on("data", function (data) {
        if (!pushedHeader) {
            passThrough.push(wavHeader);
            pushedHeader = true;
        }
        passThrough.push(data);
    });
    readable.on("end", function () {
        passThrough.end();
    });
    return passThrough;
}

/**
 * Retrieves voice settings based on runtime configuration.
 * @async
 * @param {IAgentRuntime} runtime - The runtime interface object.
 * @returns {object} - Object containing various voice settings.
 */
async function getVoiceSettings(runtime: IAgentRuntime) {
    const hasElevenLabs = !!runtime.getSetting("ELEVENLABS_XI_API_KEY");
    const useVits = !hasElevenLabs;

    // Get voice settings from character card
    const voiceSettings = runtime.character.settings?.voice;
    const elevenlabsSettings = voiceSettings?.elevenlabs;

    elizaLogger.debug("Voice settings:", {
        hasElevenLabs,
        useVits,
        voiceSettings,
        elevenlabsSettings,
    });

    return {
        elevenlabsVoiceId:
            elevenlabsSettings?.voiceId ||
            runtime.getSetting("ELEVENLABS_VOICE_ID"),
        elevenlabsModel:
            elevenlabsSettings?.model ||
            runtime.getSetting("ELEVENLABS_MODEL_ID") ||
            "eleven_monolingual_v1",
        elevenlabsStability:
            elevenlabsSettings?.stability ||
            runtime.getSetting("ELEVENLABS_VOICE_STABILITY") ||
            "0.5",
        // ... other ElevenLabs settings ...
        vitsVoice:
            voiceSettings?.model ||
            voiceSettings?.url ||
            runtime.getSetting("VITS_VOICE") ||
            "en_US-hfc_female-medium",
        useVits,
    };
}

/**
 * Convert text to speech using Eleven Labs API or fallback to VITS API if quota exceeded.
 * 
 * @param {IAgentRuntime} runtime - The agent runtime instance.
 * @param {string} text - The text to convert to speech.
 * @returns {Promise<Readable>} - A readable stream of the generated speech.
 */
async function textToSpeech(runtime: IAgentRuntime, text: string) {
    await validateNodeConfig(runtime);
    const { elevenlabsVoiceId } = await getVoiceSettings(runtime);

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}/stream?optimize_streaming_latency=${runtime.getSetting("ELEVENLABS_OPTIMIZE_STREAMING_LATENCY")}&output_format=${runtime.getSetting("ELEVENLABS_OUTPUT_FORMAT")}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": runtime.getSetting("ELEVENLABS_XI_API_KEY"),
                },
                body: JSON.stringify({
                    model_id: runtime.getSetting("ELEVENLABS_MODEL_ID"),
                    text: text,
                    voice_settings: {
                        similarity_boost: runtime.getSetting(
                            "ELEVENLABS_VOICE_SIMILARITY_BOOST"
                        ),
                        stability: runtime.getSetting(
                            "ELEVENLABS_VOICE_STABILITY"
                        ),
                        style: runtime.getSetting("ELEVENLABS_VOICE_STYLE"),
                        use_speaker_boost: runtime.getSetting(
                            "ELEVENLABS_VOICE_USE_SPEAKER_BOOST"
                        ),
                    },
                }),
            }
        );

        const status = response.status;
        if (status != 200) {
            const errorBodyString = await response.text();
            const errorBody = JSON.parse(errorBodyString);

            // Check for quota exceeded error
            if (
                status === 401 &&
                errorBody.detail?.status === "quota_exceeded"
            ) {
                console.log("ElevenLabs quota exceeded, falling back to VITS");
                throw new Error("QUOTA_EXCEEDED");
            }

            throw new Error(
                `Received status ${status} from Eleven Labs API: ${errorBodyString}`
            );
        }

        if (response) {
            const webStream = ReadableStream.from(
                response.body as ReadableStream
            );
            const reader = webStream.getReader();

            const readable = new Readable({
                read() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            this.push(null);
                        } else {
                            this.push(value);
                        }
                    });
                },
            });

            if (
                runtime
                    .getSetting("ELEVENLABS_OUTPUT_FORMAT")
                    .startsWith("pcm_")
            ) {
                const sampleRate = parseInt(
                    runtime.getSetting("ELEVENLABS_OUTPUT_FORMAT").substring(4)
                );
                const withHeader = prependWavHeader(
                    readable,
                    1024 * 1024 * 100,
                    sampleRate,
                    1,
                    16
                );
                return withHeader;
            } else {
                return readable;
            }
        } else {
            return new Readable({
                read() {},
            });
        }
    } catch (error) {
        if (error.message === "QUOTA_EXCEEDED") {
            // Fall back to VITS
            const { vitsVoice } = await getVoiceSettings(runtime);
            const { audio } = await Echogarden.synthesize(text, {
                engine: "vits",
                voice: vitsVoice,
            });

            let wavStream: Readable;
            if (audio instanceof Buffer) {
                console.log("audio is a buffer");
                wavStream = Readable.from(audio);
            } else if ("audioChannels" in audio && "sampleRate" in audio) {
                console.log("audio is a RawAudio");
                const floatBuffer = Buffer.from(audio.audioChannels[0].buffer);
                console.log("buffer length: ", floatBuffer.length);

                // Get the sample rate from the RawAudio object
                const sampleRate = audio.sampleRate;

                // Create a Float32Array view of the floatBuffer
                const floatArray = new Float32Array(floatBuffer.buffer);

                // Convert 32-bit float audio to 16-bit PCM
                const pcmBuffer = new Int16Array(floatArray.length);
                for (let i = 0; i < floatArray.length; i++) {
                    pcmBuffer[i] = Math.round(floatArray[i] * 32767);
                }

                // Prepend WAV header to the buffer
                const wavHeaderBuffer = getWavHeader(
                    pcmBuffer.length * 2,
                    sampleRate,
                    1,
                    16
                );
                const wavBuffer = Buffer.concat([
                    wavHeaderBuffer,
                    Buffer.from(pcmBuffer.buffer),
                ]);

                wavStream = Readable.from(wavBuffer);
            } else {
                throw new Error("Unsupported audio format");
            }
            return wavStream;
        }
        throw error; // Re-throw other errors
    }
}

/**
 * Process the given audio data and convert it into a Readable stream.
 * @param audio - The audio data to process. Can be either a Buffer or a RawAudio object.
 * @returns A Promise that resolves with a Readable stream containing the processed audio data.
 * @throws Error if the audio format is unsupported.
 */
async function processVitsAudio(audio: any): Promise<Readable> {
    let wavStream: Readable;
    if (audio instanceof Buffer) {
        console.log("audio is a buffer");
        wavStream = Readable.from(audio);
    } else if ("audioChannels" in audio && "sampleRate" in audio) {
        console.log("audio is a RawAudio");
        const floatBuffer = Buffer.from(audio.audioChannels[0].buffer);
        console.log("buffer length: ", floatBuffer.length);

        const sampleRate = audio.sampleRate;
        const floatArray = new Float32Array(floatBuffer.buffer);
        const pcmBuffer = new Int16Array(floatArray.length);

        for (let i = 0; i < floatArray.length; i++) {
            pcmBuffer[i] = Math.round(floatArray[i] * 32767);
        }

        const wavHeaderBuffer = getWavHeader(
            pcmBuffer.length * 2,
            sampleRate,
            1,
            16
        );
        const wavBuffer = Buffer.concat([
            wavHeaderBuffer,
            Buffer.from(pcmBuffer.buffer),
        ]);
        wavStream = Readable.from(wavBuffer);
    } else {
        throw new Error("Unsupported audio format");
    }
    return wavStream;
}

/**
 * Asynchronously generates Vits audio based on the provided text using the specified voice setting.
 * 
 * @param {IAgentRuntime} runtime - The Agent runtime object.
 * @param {string} text - The input text to synthesize into audio.
 * @returns {Promise<Readable>} A Promise that resolves to a Readable stream containing the generated Vits audio.
 */
async function generateVitsAudio(
    runtime: IAgentRuntime,
    text: string
): Promise<Readable> {
    const { vitsVoice } = await getVoiceSettings(runtime);
    const { audio } = await Echogarden.synthesize(text, {
        engine: "vits",
        voice: vitsVoice,
    });
    return processVitsAudio(audio);
}

/**
 * SpeechService class that implements ISpeechService interface and extends Service class.
 * 
 * @extends Service
 * @implements ISpeechService
 */
 */
export class SpeechService extends Service implements ISpeechService {
    static serviceType: ServiceType = ServiceType.SPEECH_GENERATION;

/**
 * Initializes the agent runtime.
 * 
 * @param _runtime - The agent runtime to be initialized.
 * @returns A promise that resolves once the initialization is complete.
 */
    async initialize(_runtime: IAgentRuntime): Promise<void> {}

/**
 * Retrieve an instance of the ISpeechService interface.
 * @returns {ISpeechService} The instance of the ISpeechService interface.
 */
    getInstance(): ISpeechService {
        return SpeechService.getInstance();
    }

/**
 * Generates audio speech for the given text based on the runtime and voice settings.
 *
 * @param {IAgentRuntime} runtime - The runtime object containing configurations and settings.
 * @param {string} text - The text to convert into speech.
 * @returns {Promise<Readable>} A promise that resolves to a Readable stream of the generated audio speech.
 */
    async generate(runtime: IAgentRuntime, text: string): Promise<Readable> {
        try {
            const { useVits } = await getVoiceSettings(runtime);

            if (useVits || !runtime.getSetting("ELEVENLABS_XI_API_KEY")) {
                return await generateVitsAudio(runtime, text);
            }

            return await textToSpeech(runtime, text);
        } catch (error) {
            console.error("Speech generation error:", error);
            return await generateVitsAudio(runtime, text);
        }
    }
}
