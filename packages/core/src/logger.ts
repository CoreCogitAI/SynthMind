/**
 * Class representing a custom logger with styling options.
 */
class ElizaLogger {
/**
 * Constructor for ElizaLogger class.
 * Checks if the environment is Node.js.
 * Sets verbose flag based on environment.
 * Logs initialization details.
 */
    constructor() {
        // Check if we're in Node.js environment
        this.isNode =
            typeof process !== "undefined" &&
            process.versions != null &&
            process.versions.node != null;

        // Set verbose based on environment
        this.verbose = this.isNode ? process.env.VERBOSE === "true" : false;

        // Add initialization logging
        console.log(`[ElizaLogger] Initializing with:
            isNode: ${this.isNode}
            verbose: ${this.verbose}
            VERBOSE env: ${process.env.VERBOSE}
            NODE_ENV: ${process.env.NODE_ENV}
        `);
    }

    private isNode: boolean;
    verbose = false;
    closeByNewLine = true;
    useIcons = true;
    logsTitle = "LOGS";
    warningsTitle = "WARNINGS";
    errorsTitle = "ERRORS";
    informationsTitle = "INFORMATIONS";
    successesTitle = "SUCCESS";
    debugsTitle = "DEBUG";
    assertsTitle = "ASSERT";

/**
 * Get the CSS styling for the foreground and background colors.
 * If running in a browser environment, returns the CSS styling based on the named colors or defaults to white.
 * If running in a Node.js environment, returns the ANSI escape codes for the foreground and background colors.
 *
 * @param {string} [foregroundColor=""] - The foreground color name.
 * @param {string} [backgroundColor=""] - The background color name.
 * @returns {string} - The CSS styling for the colors in browser environment or ANSI escape codes in Node.js.
 */
    #getColor(foregroundColor = "", backgroundColor = "") {
        if (!this.isNode) {
            // Browser console styling
            const colors: { [key: string]: string } = {
                black: "#000000",
                red: "#ff0000",
                green: "#00ff00",
                yellow: "#ffff00",
                blue: "#0000ff",
                magenta: "#ff00ff",
                cyan: "#00ffff",
                white: "#ffffff",
            };

            const fg = colors[foregroundColor.toLowerCase()] || colors.white;
            const bg = colors[backgroundColor.toLowerCase()] || "transparent";
            return `color: ${fg}; background: ${bg};`;
        }

        // Node.js console colors
        let fgc = "\x1b[37m";
        switch (foregroundColor.trim().toLowerCase()) {
            case "black":
                fgc = "\x1b[30m";
                break;
            case "red":
                fgc = "\x1b[31m";
                break;
            case "green":
                fgc = "\x1b[32m";
                break;
            case "yellow":
                fgc = "\x1b[33m";
                break;
            case "blue":
                fgc = "\x1b[34m";
                break;
            case "magenta":
                fgc = "\x1b[35m";
                break;
            case "cyan":
                fgc = "\x1b[36m";
                break;
            case "white":
                fgc = "\x1b[37m";
                break;
        }

        let bgc = "";
        switch (backgroundColor.trim().toLowerCase()) {
            case "black":
                bgc = "\x1b[40m";
                break;
            case "red":
                bgc = "\x1b[44m";
                break;
            case "green":
                bgc = "\x1b[44m";
                break;
            case "yellow":
                bgc = "\x1b[43m";
                break;
            case "blue":
                bgc = "\x1b[44m";
                break;
            case "magenta":
                bgc = "\x1b[45m";
                break;
            case "cyan":
                bgc = "\x1b[46m";
                break;
            case "white":
                bgc = "\x1b[47m";
                break;
        }

        return `${fgc}${bgc}`;
    }

/**
 * Get the color reset code for console output.
 * @returns {string} The color reset code.
 */
    #getColorReset() {
        return this.isNode ? "\x1b[0m" : "";
    }

/**
 * Clear the console screen.
 */
    clear() {
        console.clear();
    }

/**
 * Print the given strings with the specified foreground and background colors.
 *
 * @param {string} [foregroundColor="white"] - The color of the text.
 * @param {string} [backgroundColor="black"] - The color of the background.
 * @param {...*} strings - The strings to be printed.
 */
    print(foregroundColor = "white", backgroundColor = "black", ...strings) {
        // Convert objects to strings
        const processedStrings = strings.map((item) => {
            if (typeof item === "object") {
                return JSON.stringify(item, (key, value) =>
                    typeof value === "bigint" ? value.toString() : value
                );
            }
            return item;
        });

        if (this.isNode) {
            const c = this.#getColor(foregroundColor, backgroundColor);
            console.log(c, processedStrings.join(""), this.#getColorReset());
        } else {
            const style = this.#getColor(foregroundColor, backgroundColor);
            console.log(`%c${processedStrings.join("")}`, style);
        }

        if (this.closeByNewLine) console.log("");
    }

/**
 * Logs the provided strings with the specified style.
 * 
 * @param {any[]} strings - Array of strings to be logged.
 * @param {object} options - Options for customizing the log style:
 * @param {string} options.fg - The foreground color for the log.
 * @param {string} options.bg - The background color for the log.
 * @param {string} options.icon - The icon to display before the group title.
 * @param {string} options.groupTitle - The title of the log group.
 */
    #logWithStyle(
        strings: any[],
        options: {
            fg: string;
            bg: string;
            icon: string;
            groupTitle: string;
        }
    ) {
        const { fg, bg, icon, groupTitle } = options;

        if (strings.length > 1) {
            if (this.isNode) {
                const c = this.#getColor(fg, bg);
                console.group(c, (this.useIcons ? icon : "") + groupTitle);
            } else {
                const style = this.#getColor(fg, bg);
                console.group(
                    `%c${this.useIcons ? icon : ""}${groupTitle}`,
                    style
                );
            }

            const nl = this.closeByNewLine;
            this.closeByNewLine = false;
            strings.forEach((item) => {
                this.print(fg, bg, item);
            });
            this.closeByNewLine = nl;
            console.groupEnd();
            if (nl) console.log();
        } else {
            this.print(
                fg,
                bg,
                strings.map((item) => {
                    return `${this.useIcons ? `${icon} ` : ""}${item}`;
                })
            );
        }
    }

/**
* Logs the given strings with a specific style.
* 
* @param {...string} strings The strings to be logged
*/
    log(...strings) {
        this.#logWithStyle(strings, {
            fg: "white",
            bg: "",
            icon: "\u25ce",
            groupTitle: ` ${this.logsTitle}`,
        });
    }

/**
 * Display warning messages with specified style.
 *
 * @param {string} strings The warning messages to be displayed.
 */
    warn(...strings) {
        this.#logWithStyle(strings, {
            fg: "yellow",
            bg: "",
            icon: "\u26a0",
            groupTitle: ` ${this.warningsTitle}`,
        });
    }

/**
 * Logs an error message with red color and error icon.
 * @param {...string} strings - Strings to be logged as an error message.
 */
    error(...strings) {
        this.#logWithStyle(strings, {
            fg: "red",
            bg: "",
            icon: "\u26D4",
            groupTitle: ` ${this.errorsTitle}`,
        });
    }

/**
 * Logs information messages with blue color and an information icon.
 * @param {...string} strings - The information messages to be logged.
 */
    info(...strings) {
        this.#logWithStyle(strings, {
            fg: "blue",
            bg: "",
            icon: "\u2139",
            groupTitle: ` ${this.informationsTitle}`,
        });
    }

/**
 * Logs debug messages with optional styling.
 * 
 * @param {...string} strings - The strings to be logged.
 * @returns {void}
 */
    debug(...strings) {
        if (!this.verbose) {
            // for diagnosing verbose logging issues
            // console.log(
            //     "[ElizaLogger] Debug message suppressed (verbose=false):",
            //     ...strings
            // );
            return;
        }
        this.#logWithStyle(strings, {
            fg: "magenta",
            bg: "",
            icon: "\u1367",
            groupTitle: ` ${this.debugsTitle}`,
        });
    }

/**
 * Function to log success messages with a specific style.
 * 
 * @param {...string} strings - The strings to be logged as success messages.
 */
    success(...strings) {
        this.#logWithStyle(strings, {
            fg: "green",
            bg: "",
            icon: "\u2713",
            groupTitle: ` ${this.successesTitle}`,
        });
    }

/**
 * Method to assert certain conditions with customized logging style.
 * 
 * @param {...string} strings - Represents the strings to be logged
 */
    assert(...strings) {
        this.#logWithStyle(strings, {
            fg: "cyan",
            bg: "",
            icon: "\u0021",
            groupTitle: ` ${this.assertsTitle}`,
        });
    }

/**
 * Display progress message either in the console or by clearing line and moving cursor in Node environment.
 * 
 * @param {string} message The message to display as progress
 */
    progress(message: string) {
        if (this.isNode) {
            // Clear the current line and move cursor to beginning
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(message);
        } else {
            console.log(message);
        }
    }
}

export const elizaLogger = new ElizaLogger();
elizaLogger.closeByNewLine = true;
elizaLogger.useIcons = true;

export default elizaLogger;
