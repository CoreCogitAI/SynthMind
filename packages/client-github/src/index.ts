import { Octokit } from "@octokit/rest";
import { glob } from "glob";
import simpleGit, { SimpleGit } from "simple-git";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import {
    elizaLogger,
    AgentRuntime,
    Client,
    IAgentRuntime,
    knowledge,
    stringToUuid,
} from "@elizaos/core";
import { validateGithubConfig } from "./environment";

/**
 * Interface for defining the configuration for connecting to GitHub.
 * @typedef {Object} GitHubConfig
 * @property {string} owner - The owner of the GitHub repository.
 * @property {string} repo - The name of the GitHub repository.
 * @property {string} [branch] - The branch of the repository (optional).
 * @property {string} [path] - The path within the repository (optional).
 * @property {string} token - The access token for authentication with GitHub.
 */
export interface GitHubConfig {
    owner: string;
    repo: string;
    branch?: string;
    path?: string;
    token: string;
}

/**
 * GitHubClient class for interacting with GitHub repositories.
 * @constructor
 * @param {AgentRuntime} runtime - The runtime of the agent.
 */
export class GitHubClient {
    private octokit: Octokit;
    private git: SimpleGit;
    private config: GitHubConfig;
    private runtime: AgentRuntime;
    private repoPath: string;

/**
 * Constructor for GithubAgent class.
 * 
 * @param {AgentRuntime} runtime The runtime object for the agent.
 */
    constructor(runtime: AgentRuntime) {
        this.runtime = runtime;
        this.config = {
            owner: runtime.getSetting("GITHUB_OWNER") as string,
            repo: runtime.getSetting("GITHUB_REPO") as string,
            branch: runtime.getSetting("GITHUB_BRANCH") as string,
            path: runtime.getSetting("GITHUB_PATH") as string,
            token: runtime.getSetting("GITHUB_API_TOKEN") as string,
        };
        this.octokit = new Octokit({ auth: this.config.token });
        this.git = simpleGit();
        this.repoPath = path.join(
            process.cwd(),
            ".repos",
            this.config.owner,
            this.config.repo
        );
    }

/**
 * Asynchronously initializes the repository by:
 * 1. Creating the repos directory if it doesn't exist
 * 2. Cloning the repository if it doesn't exist, or pulling the changes if it does
 * 3. Checking out the specified branch if provided
 */
    async initialize() {
        // Create repos directory if it doesn't exist
        await fs.mkdir(path.join(process.cwd(), ".repos", this.config.owner), {
            recursive: true,
        });

        // Clone or pull repository
        if (!existsSync(this.repoPath)) {
            await this.cloneRepository();
        } else {
            const git = simpleGit(this.repoPath);
            await git.pull();
        }

        // Checkout specified branch if provided
        if (this.config.branch) {
            const git = simpleGit(this.repoPath);
            await git.checkout(this.config.branch);
        }
    }

/**
 * Asynchronously clones a repository using the specified owner and repository name.
 * 
 * @returns {Promise<void>} A Promise that resolves when the repository has been successfully cloned.
 * @throws {Error} If unable to clone the repository after the maximum number of retries.
 */
    private async cloneRepository() {
        const repositoryUrl = `https://github.com/${this.config.owner}/${this.config.repo}.git`;
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                await this.git.clone(repositoryUrl, this.repoPath);
                elizaLogger.log(
                    `Successfully cloned repository from ${repositoryUrl}`
                );
                return;
            } catch {
                elizaLogger.error(`Failed to clone repository from ${repositoryUrl}. Retrying...`);
                retries++;
                if (retries === maxRetries) {
                    throw new Error(
                        `Unable to clone repository from ${repositoryUrl} after ${maxRetries} retries.`
                    );
                }
            }
        }
    }

/**
 * Asynchronously creates memories from files based on the configuration path.
 * 
 * @returns {Promise<void>} A Promise that resolves once memories are created
 */
    async createMemoriesFromFiles() {
        console.log("Create memories");
        const searchPath = this.config.path

        const files = await glob(searchPath, { nodir: true });

        for (const file of files) {
            const relativePath = path.relative(this.repoPath, file);
            const content = await fs.readFile(file, "utf-8");
            const contentHash = createHash("sha256")
                .update(content)
                .digest("hex");
            const knowledgeId = stringToUuid(
                `github-${this.config.owner}-${this.config.repo}-${relativePath}`
            );

            const existingDocument =
                await this.runtime.documentsManager.getMemoryById(knowledgeId);

            if (
                existingDocument &&
                existingDocument.content["hash"] == contentHash
            ) {
                continue;
            }

            console.log(
                "Processing knowledge for ",
                this.runtime.character.name,
                " - ",
                relativePath
            );

            await knowledge.set(this.runtime, {
                id: knowledgeId,
                content: {
                    text: content,
                    hash: contentHash,
                    source: "github",
                    attachments: [],
                    metadata: {
                        path: relativePath,
                        repo: this.config.repo,
                        owner: this.config.owner,
                    },
                },
            });
        }
    }

/**
 * Asynchronously creates a new pull request with the given title, branch name, list of files to be added/modified, and an optional description.
 * 
 * @param {string} title - The title of the pull request.
 * @param {string} branch - The name of the branch where changes will be made.
 * @param {Array<{ path: string; content: string }>} files - An array of objects containing the file path and content to be added/modified.
 * @param {string} [description] - Optional. A description for the pull request. If not provided, the title will be used as the default description.
 * @returns {Promise<any>} - A promise that resolves to the data of the created pull request.
 */
    async createPullRequest(
        title: string,
        branch: string,
        files: Array<{ path: string; content: string }>,
        description?: string
    ) {
        // Create new branch
        const git = simpleGit(this.repoPath);
        await git.checkout(["-b", branch]);

        // Write files
        for (const file of files) {
            const filePath = path.join(this.repoPath, file.path);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, file.content);
        }

        // Commit and push changes
        await git.add(".");
        await git.commit(title);
        await git.push("origin", branch);

        // Create PR
        const pr = await this.octokit.pulls.create({
            owner: this.config.owner,
            repo: this.config.repo,
            title,
            body: description || title,
            head: branch,
            base: this.config.branch || "main",
        });

        return pr.data;
    }

/**
 * Asynchronously creates a commit in the repository with the specified message
 * and files.
 * 
 * @param {string} message - The commit message.
 * @param {Array<{ path: string; content: string }>} files - An array of objects containing the path
 * and content of each file to be included in the commit.
 * @returns {Promise<void>} A Promise that resolves once the commit has been created and pushed.
 */
    async createCommit(
        message: string,
        files: Array<{ path: string; content: string }>
    ) {
        const git = simpleGit(this.repoPath);

        // Write files
        for (const file of files) {
            const filePath = path.join(this.repoPath, file.path);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, file.content);
        }

        // Commit and push changes
        await git.add(".");
        await git.commit(message);
        await git.push();
    }
}

export const GitHubClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        await validateGithubConfig(runtime);
        elizaLogger.log("GitHubClientInterface start");

        const client = new GitHubClient(runtime as AgentRuntime);
        await client.initialize();
        await client.createMemoriesFromFiles();

        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        elizaLogger.log("GitHubClientInterface stop");
    },
};

export default GitHubClientInterface;
