import { IAgentRuntime, type Relationship, type UUID } from "./types.ts";

/**
 * Asynchronously creates a relationship between two users in the database.
 * @param {Object} params - The parameters for creating the relationship.
 * @param {IAgentRuntime} params.runtime - The runtime object used to access the database.
 * @param {UUID} params.userA - The UUID of user A in the relationship.
 * @param {UUID} params.userB - The UUID of user B in the relationship.
 * @returns {Promise<boolean>} A promise that resolves to true if the relationship was successfully created.
 */
export async function createRelationship({
    runtime,
    userA,
    userB,
}: {
    runtime: IAgentRuntime;
    userA: UUID;
    userB: UUID;
}): Promise<boolean> {
    return runtime.databaseAdapter.createRelationship({
        userA,
        userB,
    });
}

/**
 * Retrieves the relationship between two users from the database.
 * @async
 * @param {Object} options - The options object.
 * @param {IAgentRuntime} options.runtime - The agent runtime.
 * @param {UUID} options.userA - The UUID of userA.
 * @param {UUID} options.userB - The UUID of userB.
 * @returns {Promise} The relationship between userA and userB.
 */
export async function getRelationship({
    runtime,
    userA,
    userB,
}: {
    runtime: IAgentRuntime;
    userA: UUID;
    userB: UUID;
}) {
    return runtime.databaseAdapter.getRelationship({
        userA,
        userB,
    });
}

/**
 * Retrieve relationships for a specific user from the database.
 * 
 * @async
 * @function getRelationships
 * @param {Object} options - The options object.
 * @param {IAgentRuntime} options.runtime - The agent runtime instance.
 * @param {UUID} options.userId - The ID of the user to retrieve relationships for.
 * @returns {Promise} The relationships retrieved from the database.
 */
export async function getRelationships({
    runtime,
    userId,
}: {
    runtime: IAgentRuntime;
    userId: UUID;
}) {
    return runtime.databaseAdapter.getRelationships({ userId });
}

/**
 * Formats the relationships of a specific user by retrieving the relationships from the runtime using the provided user ID.
 * 
 * @param {Object} options - The options object.
 * @param {IAgentRuntime} options.runtime - The runtime to retrieve relationships from.
 * @param {UUID} options.userId - The ID of the user to format relationships for.
 * @returns {Promise<UUID[]>} The formatted relationships of the user as an array of user IDs.
 */
export async function formatRelationships({
    runtime,
    userId,
}: {
    runtime: IAgentRuntime;
    userId: UUID;
}) {
    const relationships = await getRelationships({ runtime, userId });

    const formattedRelationships = relationships.map(
        (relationship: Relationship) => {
            const { userA, userB } = relationship;

            if (userA === userId) {
                return userB;
            }

            return userA;
        }
    );

    return formattedRelationships;
}
