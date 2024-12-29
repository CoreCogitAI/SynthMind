import { Address, Hash } from "viem";

/**
 * Enum representing different types of action response.
 * @readonly
 * @enum {string}
 * @property {string} SET - Represents a SET action response type.
 * @property {string} ATTACH - Represents an ATTACH action response type.
 * @property {string} CREATE - Represents a CREATE action response type.
 * @property {string} REGISTER - Represents a REGISTER action response type.
 * @property {string} REMOVE - Represents a REMOVE action response type.
 */
export enum ACTION_RESPONSE_TYPE {
    SET = "SET",
    ATTACH = "ATTACH",
    CREATE = "CREATE",
    REGISTER = "REGISTER",
    REMOVE = "REMOVE",
}

/**
 * Enum representing different types of resources with their corresponding endpoints.
 *
 * @enum {string}
 * @readonly
 */
export enum RESOURCE_TYPE {
    LICENSE_TOKEN = "licenses/tokens", // new version
    LICENSE_TEMPLATES = "licenses/templates", // new version
    LICENSE_TERMS = "licenses/terms", // new version
    IP_LICENSE_TERMS = "licenses/ip/terms", // new version
    IP_LICENSE_DETAILS = "detailed-ip-license-terms", // new version
    ASSET = "assets",
    COLLECTION = "collections",
    DISPUTE = "disputes",
    LICENSE_MINT_FEES = "licenses/mintingfees",
    MODULE = "modules",
    PERMISSION = "permissions",
    ROYALTY = "royalties",
    ROYALTY_PAY = "royalties/payments",
    ROYALTY_POLICY = "royalties/policies",
    ROYALTY_SPLIT = "royalties/splits",
    TAGS = "tags",
    TRANSACTION = "transactions",
    LATEST_TRANSACTIONS = "transactions/latest",
}

/**
 * Enum representing various types of resource responses.
 * 
 * @readonly
 * @enum {string}
 * @property {string} LICENSE_TOKEN - Represents license token. (new version)
 * @property {string} LICENSE_TEMPLATES - Represents license templates. (new version)
 * @property {string} LICENSE_TERMS - Represents license terms. (new version)
 * @property {string} IP_LICENSE_TERMS - Represents IP license terms. (new version)
 * @property {string} IP_LICENSE_DETAILS - Represents detailed IP license terms. (new version)
 * @property {string} ASSET - Represents IP asset.
 * @property {string} COLLECTION - Represents collection.
 * @property {string} DISPUTE - Represents dispute.
 * @property {string} LICENSE_MINT_FEES - Represents license minting fees.
 * @property {string} MODULE - Represents modules.
 * @property {string} PERMISSION - Represents permission.
 * @property {string} ROYALTY - Represents royalty.
 * @property {string} ROYALTY_PAY - Represents royalty payments.
 * @property {string} ROYALTY_POLICY - Represents royalty policy.
 * @property {string} ROYALTY_SPLIT - Represents royalty splits.
 * @property {string} TAGS - Represents tags.
 */

export enum RESPOURCE_REPONSE_TYPE {
    LICENSE_TOKEN = "LICENSETOKEN", // new version
    LICENSE_TEMPLATES = "LICENSETEMPLATE", // new version
    LICENSE_TERMS = "LICENSETERM", // new version
    IP_LICENSE_TERMS = "licenses/ip/terms", // new version
    IP_LICENSE_DETAILS = "detailed-ip-license-terms", // new version
    ASSET = "IPASSET",
    COLLECTION = "COLLECTION",
    DISPUTE = "DISPUTE",
    LICENSE_MINT_FEES = "licenses/mintingfees",
    MODULE = "modules",
    PERMISSION = "PERMISSION",
    ROYALTY = "ROYALTY",
    ROYALTY_PAY = "royalties/payments",
    ROYALTY_POLICY = "ROYALTYPOLICY",
    ROYALTY_SPLIT = "royalties/splits",
    TAGS = "tags",
}

/**
 * A data type representing the possible types of resources.
 * Can be one of the following:
 * - ASSET
 * - COLLECTION
 * - TRANSACTION
 * - LATEST_TRANSACTIONS
 * - LICENSE_TOKEN
 * - LICENSE_TERMS
 * - LICENSE_TEMPLATES
 * - IP_LICENSE_TERMS
 * - IP_LICENSE_DETAILS
 * - LICENSE_MINT_FEES
 * - MODULE
 * - PERMISSION
 * - TAGS
 * - ROYALTY
 * - ROYALTY_PAY
 * - ROYALTY_POLICY
 * - ROYALTY_SPLIT
 * - DISPUTE
 */
export type ResourceType =
    | RESOURCE_TYPE.ASSET
    | RESOURCE_TYPE.COLLECTION
    | RESOURCE_TYPE.TRANSACTION
    | RESOURCE_TYPE.LATEST_TRANSACTIONS
    | RESOURCE_TYPE.LICENSE_TOKEN
    | RESOURCE_TYPE.LICENSE_TERMS
    | RESOURCE_TYPE.LICENSE_TEMPLATES
    | RESOURCE_TYPE.IP_LICENSE_TERMS
    | RESOURCE_TYPE.IP_LICENSE_DETAILS
    | RESOURCE_TYPE.LICENSE_MINT_FEES
    | RESOURCE_TYPE.MODULE
    | RESOURCE_TYPE.PERMISSION
    | RESOURCE_TYPE.TAGS
    | RESOURCE_TYPE.ROYALTY
    | RESOURCE_TYPE.ROYALTY_PAY
    | RESOURCE_TYPE.ROYALTY_POLICY
    | RESOURCE_TYPE.ROYALTY_SPLIT
    | RESOURCE_TYPE.DISPUTE;

/**
 * Represents the pagination options for data retrieval.
 * @typedef {Object} PaginationOptions
 * @property {number} [limit] - The maximum number of items to return per page.
 * @property {number} [offset] - The offset from which to start fetching the items.
 */
export type PaginationOptions = {
    limit?: number;
    offset?: number;
};

/**
 * Represents the filter options for querying assets.
 * @typedef {Object} AssetFilterOptions
 * @property {string} [chainId] - The chain ID to filter by.
 * @property {string} [metadataResolverAddress] - The metadata resolver address to filter by.
 * @property {string} [tokenContract] - The token contract address to filter by.
 * @property {string} [tokenId] - The token ID to filter by.
 */
export type AssetFilterOptions = {
    chainId?: string;
    metadataResolverAddress?: string;
    tokenContract?: string;
    tokenId?: string;
};

/**
 * Defines the filter options for searching disputes.
 * @typedef {Object} DisputeFilterOptions
 * @property {string} [currentTag] - The current tag associated with the dispute.
 * @property {string} [initiator] - The user who initiated the dispute.
 * @property {string} [targetIpId] - The ID of the target IP related to the dispute.
 * @property {string} [targetTag] - The tag associated with the target IP in the dispute.
 */
export type DisputeFilterOptions = {
    currentTag?: string;
    initiator?: string;
    targetIpId?: string;
    targetTag?: string;
};

/**
 * Represents the options available for filtering permissions.
 * @typedef {Object} PermissionFilterOptions
 * @property {string} [signer] - The signer for the permission.
 * @property {string} [to] - The recipient for the permission.
 */
export type PermissionFilterOptions = {
    signer?: string;
    to?: string;
};

/**
 * Options for filtering policies.
 * @typedef {Object} PolicyFilterOptions
 * @property {string} policyFrameworkManager - The policy framework manager to filter by.
 */
export type PolicyFilterOptions = {
    policyFrameworkManager?: string;
};

/**
 * Options for filtering policy framework.
 * @typedef {Object} PolicyFrameworkFilterOptions
 * @property {string} [address] - The address to filter by.
 * @property {string} [name] - The name to filter by.
 */
export type PolicyFrameworkFilterOptions = {
    address?: string;
    name?: string;
};

/**
 * Options for filtering royalties.
 *
 * @param {string} [ipId] - The ID of the intellectual property.
 * @param {string} [royaltyPolicy] - The type of royalty policy.
 */
```
export type RoyaltyFilterOptions = {
    ipId?: string | null;
    royaltyPolicy?: string | null;
};

/**
 * Options for filtering tags based on IP ID or tag value.
 * @typedef {Object} TagFilterOptions
 * @property {string} [ipId] - The IP ID to filter by.
 * @property {string} [tag] - The tag value to filter by.
 */
export type TagFilterOptions = {
    ipId?: string;
    tag?: string;
};
/**
 * Defines the filter options for querying royalty payments.
 * @typedef {Object} RoyaltyPayFilterOptions
 * @property {string} [ipId] - The ID of the IP involved in the payment.
 * @property {string} [payerIpId] - The ID of the IP that made the payment.
 * @property {string} [receiverIpId] - The ID of the IP that received the payment.
 * @property {string} [sender] - The sender of the payment.
 * @property {string} [token] - The token associated with the payment.
 */
export type RoyaltyPayFilterOptions = {
    ipId?: string;
    payerIpId?: string;
    receiverIpId?: string;
    sender?: string;
    token?: string;
};

/**
 * Specifies the options available for filtering modules.
 * @typedef ModuleFilterOptions
 * @type {object}
 * @property {string} [name] - The name of the module.
 */
export type ModuleFilterOptions = {
    name?: string;
};

/**
 * Options to filter licenses.
 * 
 * @typedef {Object} LicenseFilterOptions
 * @property {string} [licensorIpId] - The ID of the licensor IP.
 * @property {string} [policyId] - The ID of the policy.
 */
export type LicenseFilterOptions = {
    licensorIpId?: string;
    policyId?: string;
};

/**
 * Options for filtering license frameworks.
 * @typedef {Object} LicenseFrameworkFilterOptions
 * @property {string} [creator] - The creator of the license framework.
 */ 
```
export type LicenseFrameworkFilterOptions = {
    creator?: string;
};

/**
 * Options for filtering IPA policies.
 * @typedef {Object} IPAPolicyFilterOptions
 * @property {string} [active] - Filter by active status.
 * @property {string} [inherited] - Filter by inherited status.
 * @property {string} [policyId] - Filter by policy ID.
 */
export type IPAPolicyFilterOptions = {
    active?: string;
    inherited?: string;
    policyId?: string;
};

/**
 * Options for filtering transactions.
 * @typedef {Object} TransactionFilterOptions
 * @property {string} [actionType] - The type of action for filtering transactions.
 * @property {string} [resourceId] - The resource ID for filtering transactions.
 */
export type TransactionFilterOptions = {
    actionType?: string;
    resourceId?: string;
};

/**
 * Filter options for different types of filters.
 * Options include AssetFilterOptions, DisputeFilterOptions, PermissionFilterOptions, 
 * PolicyFilterOptions, PolicyFrameworkFilterOptions, RoyaltyFilterOptions, TagFilterOptions, 
 * RoyaltyPayFilterOptions, ModuleFilterOptions, LicenseFilterOptions, LicenseFrameworkFilterOptions, 
 * IPAPolicyFilterOptions, and TransactionFilterOptions.
 */
export type FilterOptions =
    | AssetFilterOptions
    | DisputeFilterOptions
    | PermissionFilterOptions
    | PolicyFilterOptions
    | PolicyFrameworkFilterOptions
    | RoyaltyFilterOptions
    | TagFilterOptions
    | RoyaltyPayFilterOptions
    | ModuleFilterOptions
    | LicenseFilterOptions
    | LicenseFrameworkFilterOptions
    | IPAPolicyFilterOptions
    | TransactionFilterOptions;

/**
 * Represents the optional headers for a query request.
 * @typedef {Object} QueryHeaders
 * @property {string} "x-api-key" - The API key for authentication.
 * @property {string} "x-chain" - The chain identifier.
 * @property {string} ["x-extend-asset"] - Optional extended asset information.
 */
export type QueryHeaders =
    | {
          "x-api-key": string;
          "x-chain": string;
          "x-extend-asset"?: string;
      }
    | {};

/**
 * Enum representing different options for ordering query results.
 * Options include BLOCK_TIMESTAMP, BLOCK_NUMBER, TOKEN_ID, ASSET_COUNT, LICENSES_COUNT, DESCENDANT_COUNT.
 */
export enum QUERY_ORDER_BY {
    BLOCK_TIMESTAMP = "blockTimestamp",
    BLOCK_NUMBER = "blockNumber",
    TOKEN_ID = "tokenId",
    ASSET_COUNT = "assetCount",
    LICENSES_COUNT = "licensesCount",
    DESCENDANT_COUNT = "descendantCount",
    // PARENTS = "parentIpIds",
}

/**
 * Enumeration representing the possible directions for query ordering.
 * 
 * @readonly
 * @enum {string}
 * @property {string} ASC - Ascending order.
 * @property {string} DESC - Descending order.
 */
export enum QUERY_ORDER_DIRECTION {
    ASC = "asc",
    DESC = "desc",
}

/**
 * Defines the options available for querying data.
 * @typedef {Object} QueryOptions
 * @property {string | number} [chain] - The chain to query data from.
 * @property {PaginationOptions} [pagination] - The pagination options for the query.
 * @property {FilterOptions} [where] - The filter options for the query.
 * @property {QUERY_ORDER_BY} [orderBy] - The field to order the results by.
 * @property {QUERY_ORDER_DIRECTION} [orderDirection] - The direction of the ordering.
 */
export type QueryOptions = {
    chain?: string | number;
    pagination?: PaginationOptions;
    where?: FilterOptions;
    orderBy?: QUERY_ORDER_BY;
    orderDirection?: QUERY_ORDER_DIRECTION;
};

/**
 * Represents a transaction object.
 * @typedef {Object} Transaction
 * @property {string} id - The unique identifier of the transaction.
 * @property {string} createdAt - The timestamp when the transaction was created.
 * @property {string} actionType - The type of action performed in the transaction.
 * @property {Address} initiator - The address of the user who initiated the transaction.
 * @property {Address} ipId - The IP address associated with the transaction.
 * @property {Address} resourceId - The resource ID related to the transaction.
 * @property {string} resourceType - The type of resource involved in the transaction.
 * @property {string} blockNumber - The block number where the transaction was included.
 * @property {string} blockTimestamp - The timestamp of the block where the transaction was included.
 * @property {string} logIndex - The index of the transaction log.
 * @property {string} transactionIndex - The index of the transaction in the block.
 * @property {Hash} tx_hash - The hash value of the transaction.
 */
export type Transaction = {
    id: string;
    createdAt: string;
    actionType: string;
    initiator: Address;
    ipId: Address;
    resourceId: Address;
    resourceType: string;
    blockNumber: string;
    blockTimestamp: string;
    logIndex: string;
    transactionIndex: string;
    tx_hash: Hash;
};

/**
 * Defines the metadata for an Asset NFT.
 * @typedef {Object} AssetNFTMetadata
 * @property {string} name - The name of the asset.
 * @property {string} chainId - The chain ID of the asset.
 * @property {Address} tokenContract - The contract address of the token.
 * @property {string} tokenId - The ID of the token.
 * @property {string} tokenUri - The URI of the token.
 * @property {string} imageUrl - The URL of the image representing the asset.
 */
export type AssetNFTMetadata = {
    name: string;
    chainId: string;
    tokenContract: Address;
    tokenId: string;
    tokenUri: string;
    imageUrl: string;
};

/**
 * Represents a permission object.
 * @typedef {Object} Permission
 * @property {string} id - The ID of the permission.
 * @property {string} permission - The type of permission.
 * @property {Address} signer - The address of the signer.
 * @property {Address} to - The address of the recipient.
 * @property {string} func - The specific function allowed by the permission.
 * @property {string} blockNumber - The block number of when the permission was granted.
 * @property {string} blockTimestamp - The block timestamp of when the permission was granted.
 */
export type Permission = {
    id: string;
    permission: string;
    signer: Address;
    to: Address;
    func: string;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Represents a policy framework entity.
 *
 * @typedef {Object} PolicyFramework
 * @property {string} id - The unique identifier of the policy framework.
 * @property {Address} address - The address of the policy framework.
 * @property {string} name - The name of the policy framework.
 * @property {string} blockNumber - The block number associated with the policy framework.
 * @property {string} blockTimestamp - The timestamp of the block associated with the policy framework.
 */
export type PolicyFramework = {
    id: string;
    address: Address;
    name: string;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Data structure representing a module.
 * @typedef {Object} Module
 * @property {string} id - The unique identifier of the module.
 * @property {string} name - The name of the module.
 * @property {string} module - The content of the module.
 * @property {string} blockNumber - The block number when the module was created.
 * @property {string} blockTimestamp - The timestamp when the module was created.
 * @property {string} deletedAt - The timestamp when the module was deleted.
 */
export type Module = {
    id: string;
    name: string;
    module: string;
    blockNumber: string;
    blockTimestamp: string;
    deletedAt: string;
};

/**
 * Represents a Tag object with the following attributes:
 * @typedef {Object} Tag
 * @property {string} id - The ID of the tag
 * @property {string} uuid - The UUID of the tag
 * @property {Address} ipId - The IP address of the tag
 * @property {string} tag - The tag string
 * @property {string} deletedAt - The date and time when the tag was deleted
 * @property {string} blockNumber - The block number associated with the tag
 * @property {string} blockTimestamp - The timestamp of the block
 */
export type Tag = {
    id: string;
    uuid: string;
    ipId: Address;
    tag: string;
    deletedAt: string;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Interface for defining a IPAPolicy object.
 * @typedef {Object} IPAPolicy
 * @property {string} id - The unique identifier for the policy.
 * @property {Address} ipId - The address associated with the policy.
 * @property {Address} policyId - The address of the policy itself.
 * @property {string} index - The index of the policy.
 * @property {boolean} active - Indicates if the policy is active or not.
 * @property {boolean} inherited - Indicates if the policy is inherited or not.
 * @property {string} blockNumber - The block number when the policy was created.
 * @property {string} blockTimestamp - The timestamp when the policy was created.
 */
export type IPAPolicy = {
    id: string;
    ipId: Address;
    policyId: Address;
    index: string;
    active: boolean;
    inherited: boolean;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Represents a royalty payment transaction.
 * @typedef {Object} RoyaltyPay
 * @property {string} id - The unique identifier for the royalty payment
 * @property {Address} receiverIpId - The IP address of the receiver
 * @property {Address} payerIpId - The IP address of the payer
 * @property {Address} sender - The address of the sender
 * @property {Address} token - The address of the token being transferred
 * @property {string} amount - The amount of tokens being transferred
 * @property {string} blockNumber - The block number at which the transaction occurred
 * @property {string} blockTimestamp - The timestamp of the block at which the transaction occurred
 */
export type RoyaltyPay = {
    id: string;
    receiverIpId: Address;
    payerIpId: Address;
    sender: Address;
    token: Address;
    amount: string;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Represents a royalty entity.
 * @typedef {Object} Royalty
 * @property {string} id - The ID of the royalty.
 * @property {Address} ipId - The address of the intellectual property.
 * @property {string} data - The data associated with the royalty.
 * @property {Address} royaltyPolicy - The address of the royalty policy.
 * @property {string} blockNumber - The block number of the royalty.
 * @property {string} blockTimestamp - The timestamp of the royalty block.
 */
export type Royalty = {
    id: string;
    ipId: Address;
    data: string;
    royaltyPolicy: Address;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Represents a dispute object with various properties.
 * @typedef {Object} Dispute
 * @property {string} id - The unique identifier of the dispute.
 * @property {Address} targetIpId - The target IP address associated with the dispute.
 * @property {Address} targetTag - The target tag address associated with the dispute.
 * @property {Address} currentTag - The current tag address associated with the dispute.
 * @property {Address} arbitrationPolicy - The arbitration policy address associated with the dispute.
 * @property {string} evidenceLink - Link to the evidence related to the dispute.
 * @property {Address} initiator - The address of the initiator of the dispute.
 * @property {string} data - Additional data related to the dispute.
 * @property {string} blockNumber - The block number associated with the dispute.
 * @property {string} blockTimestamp - The timestamp of the block associated with the dispute.
 */
export type Dispute = {
    id: string;
    targetIpId: Address;
    targetTag: Address;
    currentTag: Address;
    arbitrationPolicy: Address;
    evidenceLink: string;
    initiator: Address;
    data: string;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Definition of a Collection object, containing information about a collection's attributes.
 * - id: The unique identifier of the collection.
 * - assetCount: The number of assets in the collection.
 * - licensesCount: The number of licenses associated with the collection.
 * - resolvedDisputeCount: The number of resolved disputes related to the collection.
 * - cancelledDisputeCount: The number of disputes that have been cancelled for the collection.
 * - raisedDisputeCount: The number of disputes that have been raised for the collection.
 * - judgedDisputeCount: The number of disputes that have been judged for the collection.
 * - blockNumber: The block number associated with the collection.
 * - blockTimestamp: The timestamp associated with the block of the collection.
 */
export type Collection = {
    id: string;
    assetCount: string;
    licensesCount: string;
    resolvedDisputeCount: string;
    cancelledDisputeCount: string;
    raisedDisputeCount: string;
    judgedDisputeCount: string;
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Represents a policy object.
 * @typedef {Object} Policy
 * @property {string} id - The unique identifier of the policy.
 * @property {Address} policyFrameworkManager - The address of the policy framework manager.
 * @property {string} frameworkData - Data related to the policy framework.
 * @property {Address} royaltyPolicy - The address of the royalty policy.
 * @property {string} royaltyData - Data related to the royalty policy.
 * @property {string} mintingFee - The minting fee amount.
 * @property {Address} mintingFeeToken - The token address for the minting fee.
 * @property {string} blockNumber - The block number when the policy was created.
 * @property {string} blockTimestamp - The timestamp when the policy was created.
 * @property {PILType} pil - The type of Policy Information Layer (PIL).
 */
export type Policy = {
    id: string;
    policyFrameworkManager: Address;
    frameworkData: string;
    royaltyPolicy: Address;
    royaltyData: string;
    mintingFee: string;
    mintingFeeToken: Address;
    blockNumber: string;
    blockTimestamp: string;
    pil: PILType;
};

/**
 * Type representing the attributes of a PIL (Public Interest License).
 * @typedef {Object} PILType
 * @property {Hash} id - The unique identifier of the PIL.
 * @property {boolean} attribution - Indicates if attribution is required.
 * @property {boolean} commercialUse - Indicates if commercial use is allowed.
 * @property {boolean} commercialAttribution - Indicates if commercial use requires attribution.
 * @property {Address} commercializerChecker - The address of the commercializer checker.
 * @property {string} commercializerCheckerData - Data related to the commercializer checker.
 * @property {string} commercialRevShare - The revenue share for commercial use.
 * @property {boolean} derivativesAllowed - Indicates if derivatives are allowed.
 * @property {boolean} derivativesAttribution - Indicates if derivative works require attribution.
 * @property {boolean} derivativesApproval - Indicates if approval is required for derivative works.
 * @property {boolean} derivativesReciprocal - Indicates if derivatives must also be shared under similar terms.
 * @property {string[]} territories - List of territories where the PIL is applicable.
 * @property {string[]} distributionChannels - List of distribution channels where the PIL applies.
 * @property {string[]} contentRestrictions - List of content restrictions for the PIL.
 */
export type PILType = {
    id: Hash;
    attribution: boolean;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: Address;
    commercializerCheckerData: string;
    commercialRevShare: string;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    territories: string[];
    distributionChannels: string[];
    contentRestrictions: string[];
};

/**
 * Represents a royalty split where a piece of intellectual property is divided amongst multiple holders.
 * @typedef {Object} RoyaltySplit
 * @property {Address} id - The unique identifier of the royalty split.
 * @property {RoyaltyHolder[]} holders - The list of holders who are entitled to a share of the royalty.
 * @property {string} claimFromIPPoolArg - The argument needed to claim the royalty share from the IP pool.
 */
export type RoyaltySplit = {
    id: Address;
    holders: RoyaltyHolder[];
    claimFromIPPoolArg: string;
};

/**
 * Represents a holder of royalty with their ID and ownership status.
 * @typedef {Object} RoyaltyHolder
 * @property {Address} id - The ID of the royalty holder.
 * @property {string} ownership - The ownership status of the royalty holder.
 */
export type RoyaltyHolder = {
    id: Address;
    ownership: string;
};

/**
 * Definition of a LicenseToken object.
 *
 * @typedef {Object} LicenseToken
 * @property {string} id - The ID of the license token.
 * @property {Address} licensorIpId - The address of the licensor IP.
 * @property {Address} licenseTemplate - The address of the license template.
 * @property {string} licenseTermsId - The ID of the license terms.
 * @property {boolean} transferable - Indicates if the license token is transferable.
 * @property {Address} owner - The address of the owner of the license token.
 * @property {string} mintedAt - The timestamp when the license token was minted.
 * @property {string} expiresAt - The timestamp when the license token expires.
 * @property {string} burntAt - The timestamp when the license token was burnt.
 * @property {string} blockNumber - The block number when the license token was minted.
 * @property {string} blockTime - The timestamp of the block when the license token was minted.
 */
```
export type LicenseToken = {
    id: string;
    licensorIpId: Address;
    licenseTemplate: Address;
    licenseTermsId: string;
    transferable: boolean;
    owner: Address;
    mintedAt: string;
    expiresAt: string;
    burntAt: string;
    blockNumber: string;
    blockTime: string;
};

/**
 * Represents a license template.
 * @typedef {Object} LicenseTemplate
 * @property {string} id - The ID of the license template.
 * @property {string} name - The name of the license template.
 * @property {string} metadataUri - The URI for additional metadata related to the license template.
 * @property {string} blockNumber - The block number associated with the license template.
 * @property {string} blockTime - The timestamp of the block associated with the license template.
 */
export type LicenseTemplate = {
    id: string;
    name: string;
    metadataUri: string;
    blockNumber: string;
    blockTime: string;
};

/**
 * Definition of a Social Media object.
 * @typedef {Object} SocialMedia
 * @property {string} [platform] - The platform of the social media (e.g. Facebook, Twitter).
 * @property {string} [url] - The URL of the social media profile.
 */
export type SocialMedia = {
    platform?: string;
    url?: string;
};

/**
 * Represents a creator with optional fields for name, address, description, contribution percent, and social media.
 * @typedef {Object} Creator
 * @property {string} [name] - The name of the creator.
 * @property {Address} [address] - The address of the creator.
 * @property {string} [description] - The description of the creator.
 * @property {number} [contributionPercent] - The contribution percentage of the creator.
 * @property {SocialMedia[]} [socialMedia] - An array of social media profiles associated with the creator.
 */
export type Creator = {
    name?: string;
    address?: Address;
    description?: string;
    contributionPercent?: number;
    socialMedia?: SocialMedia[];
};

/**
 * Interface for storing metadata related to intellectual property.
 * @interface
 * @property {string} [title] - The title of the intellectual property.
 * @property {string} [description] - The description of the intellectual property.
 * @property {string} [ipType] - The type of intellectual property.
 * @property {Creator[]} [creators] - Array of Creator objects associated with the intellectual property.
 * @property {Object[]} [appInfo] - Array of objects containing information about the application related to the intellectual property.
 * @property {string} [appInfo.id] - The ID of the application.
 * @property {string} [appInfo.name] - The name of the application.
 * @property {string} [appInfo.website] - The website of the application.
 * @property {Object[]} [relationships] - Array of objects representing relationships with other intellectual properties.
 * @property {Address} [relationships.parentIpId] - The Address of the parent intellectual property.
 * @property {string} [relationships.type] - The type of relationship with the parent intellectual property.
 * @property {Object} [robotTerms] - Object containing information about robot terms.
 * @property {string} [robotTerms.userAgent] - The user agent for the robot terms.
 * @property {string} [robotTerms.allow] - The permission granted by the robot terms.
 * @property {*} [key] - Additional custom properties can be added using a dynamic key.
 */
export interface IPMetadata {
    title?: string;
    description?: string;
    ipType?: string;
    creators?: Creator[];
    appInfo?: {
        id?: string;
        name?: string;
        website?: string;
    }[];
    relationships?: {
        parentIpId?: Address;
        type?: string;
    }[];
    robotTerms?: {
        userAgent?: string;
        allow?: string;
    };
    [key: string]: any;
}

/**
 * Interface for representing the metadata of an asset.
 *
 * @interface AssetMetadata
 * @property {Address} id - The unique identifier of the asset.
 * @property {string} metadataHash - The hash value of the metadata.
 * @property {string} metadataUri - The URI of the metadata.
 * @property {IPMetadata} metadataJson - The JSON representation of the metadata.
 * @property {string} nftMetadataHash - The hash value of the NFT metadata.
 * @property {string} nftTokenUri - The URI of the NFT token.
 * @property {string} registrationDate - The date of registration of the asset.
 */
export interface AssetMetadata {
    id: Address;
    metadataHash: string;
    metadataUri: string;
    metadataJson: IPMetadata;
    nftMetadataHash: string;
    nftTokenUri: string;
    registrationDate: string;
}

/**
 * Type representing a user collection.
 * @typedef {Object} UserCollection
 * @property {number} [id] - The unique identifier of the collection.
 * @property {number} [user_id] - The user identifier associated with the collection.
 * @property {Hash} [tx_hash] - The transaction hash associated with the collection.
 * @property {string} [chain] - The blockchain where the collection exists.
 * @property {string} [chain_id] - The unique identifier of the blockchain.
 * @property {Address} [collection_address] - The address of the collection.
 * @property {string} [collection_name] - The name of the collection.
 * @property {string} [collection_thumb] - The thumbnail image of the collection.
 * @property {string} [collection_banner] - The banner image of the collection.
 * @property {string} [collection_description] - The description of the collection.
 * @property {string} [created_at] - The date when the collection was created.
 * @property {string} [updated_at] - The date when the collection was last updated.
 * @property {null} [User] - The user associated with the collection.
 */
     
export type UserCollection = {
    id?: number;
    user_id?: number;
    tx_hash?: Hash;
    chain?: string;
    chain_id?: string;
    collection_address?: Address;
    collection_name?: string;
    collection_thumb?: string;
    collection_banner?: string;
    collection_description?: string;
    created_at?: string;
    updated_at?: string;
    User?: null;
};

/**
 * Enumeration representing different flavors of Pexel's license.
 * @enum {string}
 * @readonly
 */
export enum PIL_FLAVOR {
    NON_COMMERCIAL_SOCIAL_REMIXING = "Non-Commercial Social Remixing",
    COMMERCIAL_USE = "Commercial Use",
    COMMERCIAL_REMIX = "Commercial Remix",
    CUSTOM = "Custom",
    // OPEN_DOMAIN = "Open Domain",
    // NO_DERIVATIVE = "No Derivative",
}

/**
 * Represents the different flavors of PIL (Public Interest License) that can be assigned to content.
 * @typedef {Object} PilFlavor
 * @property {string} NON_COMMERCIAL_SOCIAL_REMIXING - For non-commercial social remixing.
 * @property {string} COMMERCIAL_USE - For commercial use.
 * @property {string} COMMERCIAL_REMIX - For commercial remixing.
 * @property {string} CUSTOM - For custom flavor that can be defined by users.
 */
export type PilFlavor =
    | PIL_FLAVOR.NON_COMMERCIAL_SOCIAL_REMIXING
    | PIL_FLAVOR.COMMERCIAL_USE
    | PIL_FLAVOR.COMMERCIAL_REMIX
    | PIL_FLAVOR.CUSTOM;

/**
 * Represents an asset with various properties.
 * @typedef {Object} Asset
 * @property {Address} id - The unique identifier of the asset.
 * @property {number} ancestorCount - The number of ancestor assets of this asset.
 * @property {number} descendantCount - The number of descendant assets of this asset.
 * @property {number} [parentCount] - The number of parent assets of this asset.
 * @property {number} [childCount] - The number of child assets of this asset.
 * @property {number} [rootCount] - The number of root assets of this asset.
 * @property {Address[] | null} parentIpIds - The IP ids of the parent assets, can be null.
 * @property {Address[] | null} childIpIds - The IP ids of the child assets, can be null.
 * @property {Address[] | null} rootIpIds - The IP ids of the root assets, can be null.
 * @property {Asset[] | null} [parentIps] - The parent assets, can be null.
 * @property {Asset[] | null} [rootIps] - The root assets, can be null.
 * @property {Asset[] | null} [childIps] - The child assets, can be null.
 * @property {Object} nftMetadata - The metadata of the NFT associated with the asset.
 * @property {string} nftMetadata.name - The name of the NFT.
 * @property {string} nftMetadata.chainId - The chain ID of the NFT.
 * @property {Address} nftMetadata.tokenContract - The contract address of the NFT token.
 * @property {string} nftMetadata.tokenId - The token ID of the NFT.
 * @property {string} nftMetadata.tokenUri - The URI of the NFT token.
 * @property {string} nftMetadata.imageUrl - The URL of the image associated with the NFT.
 * @property {string} blockNumber - The block number when the asset was created.
 * @property {string} blockTimestamp - The timestamp when the asset was created.
 */
export type Asset = {
    id: Address;
    ancestorCount: number;
    descendantCount: number;
    parentCount?: number;
    childCount?: number;
    rootCount?: number;
    parentIpIds: Address[] | null;
    childIpIds: Address[] | null;
    rootIpIds: Address[] | null;
    parentIps?: Asset[] | null;
    rootIps?: Asset[] | null;
    childIps?: Asset[] | null;
    nftMetadata: {
        name: string;
        chainId: string;
        tokenContract: Address;
        tokenId: string;
        tokenUri: string;
        imageUrl: string;
    };
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Represents an asset edge in a graph.
 * @typedef {Object} AssetEdges
 * @property {string} ipId - The address of the intellectual property.
 * @property {string} parentIpId - The address of the parent intellectual property.
 * @property {string} blockNumber - The block number associated with the asset edge.
 * @property {string} blockTime - The timestamp of when the asset edge was created.
 * @property {string} licenseTemplate - The address of the license template associated with the asset edge.
 * @property {string} licenseTermsId - The id of the license terms associated with the asset edge.
 * @property {string} licenseTokenId - The id of the license token associated with the asset edge.
 * @property {string} transactionHash - The hash of the transaction associated with the asset edge.
 * @property {string} transactionIndex - The index of the transaction associated with the asset edge.
 */
export type AssetEdges = {
    ipId: Address;
    parentIpId: Address;
    blockNumber: string;
    blockTime: string;
    licenseTemplate: Address;
    licenseTermsId: string;
    licenseTokenId: string;
    transactionHash: string;
    transactionIndex: string;
};

/**
 * Represents a license object.
 * @typedef {object} License
 * @property {string} id - The ID of the license.
 * @property {Address} licensorIpId - The IP address of the licensor.
 * @property {string} licenseTemplate - The template for the license.
 * @property {string} licenseTermsId - The ID for the license terms.
 * @property {boolean} transferable - Indicates if the license is transferable.
 * @property {Address} owner - The owner of the license.
 * @property {string} mintedAt - The date and time when the license was minted.
 * @property {string} expiresAt - The expiration date and time of the license.
 * @property {string} burntAt - The date and time when the license was burnt.
 * @property {string} blockNumber - The block number of the transaction.
 * @property {string} blockTime - The timestamp of the block.
 */
export type License = {
    id: string;
    licensorIpId: Address;
    licenseTemplate: string;
    licenseTermsId: string;
    transferable: boolean;
    owner: Address;
    mintedAt: string;
    expiresAt: string;
    burntAt: string;
    blockNumber: string;
    blockTime: string;
};

/**
 * Type representing the terms related to the PIL (Public Interest License).
 * @typedef {Object} PILTerms
 * @property {boolean} commercialAttribution - Whether commercial attribution is required.
 * @property {number} commercialRevenueCelling - The maximum revenue allowed for commercial use.
 * @property {number} commercialRevenueShare - The percentage share of revenue for commercial use.
 * @property {boolean} commercialUse - Whether commercial use is allowed.
 * @property {Address} commercializerCheck - The address for commercial use verification.
 * @property {Address} currency - The currency address for revenue share.
 * @property {boolean} derivativesAllowed - Whether derivatives are allowed.
 * @property {boolean} derivativesApproval - Whether derivatives require approval.
 * @property {boolean} derivativesAttribution - Whether attribution is required for derivatives.
 * @property {boolean} derivativesReciprocal - Whether reciprocity is required for derivatives.
 * @property {number} derivativesRevenueCelling - The maximum revenue allowed for derivatives.
 * @property {string} expiration - The expiration date of the PIL terms.
 * @property {string} uRI - The Uniform Resource Identifier (URI) for the PIL terms.
 */
export type PILTerms = {
    commercialAttribution: boolean;
    commercialRevenueCelling: number;
    commercialRevenueShare: number;
    commercialUse: boolean;
    commercializerCheck: Address;
    currency: Address;
    derivativesAllowed: boolean;
    derivativesApproval: boolean;
    derivativesAttribution: boolean;
    derivativesReciprocal: boolean;
    derivativesRevenueCelling: number;
    expiration: string;
    uRI: string;
};

/**
 * Represents the details of an IP license.
 * @typedef {Object} IPLicenseDetails
 * @property {string} id - The unique identifier of the license details.
 * @property {Address} ipId - The address of the IP.
 * @property {string} licenseTemplateId - The unique identifier of the license template.
 * @property {Object} licenseTemplate - The details of the license template.
 * @property {string} licenseTemplate.id - The unique identifier of the license template.
 * @property {string} licenseTemplate.name - The name of the license template.
 * @property {string} licenseTemplate.metadataUri - The metadata URI of the license template.
 * @property {string} licenseTemplate.blockNumber - The block number of the license template.
 * @property {string} licenseTemplate.blockTime - The block time of the license template.
 * @property {PILTerms} terms - The terms of the IP license.
 */
export type IPLicenseDetails = {
    id: string;
    ipId: Address;
    licenseTemplateId: string;
    licenseTemplate: {
        id: string;
        name: string;
        metadataUri: string;
        blockNumber: string;
        blockTime: string;
    };
    terms: PILTerms;
};
/**
 * Represents the terms of an IP license agreement.
 *
 * @typedef {Object} IPLicenseTerms
 * @property {string} id - The unique identifier for the license terms
 * @property {Address} ipId - The address of the intellectual property
 * @property {string} licenseTemplate - The template of the license agreement
 * @property {string} licenseTermsId - The unique identifier for the license terms
 * @property {string} blockNumber - The block number when the license was created
 * @property {string} blockTime - The timestamp when the license was created
export type IPLicenseTerms = {
    id: string;
    ipId: Address;
    licenseTemplate: string;
    licenseTermsId: string;
    blockNumber: string;
    blockTime: string;
};

/**
 * Represents a royalty policy for NFTs.
 * @typedef {Object} RoyaltyPolicy
 * @property {Address} id - The ID of the royalty policy.
 * @property {Address} ipRoyaltyVault - The address of the IP royalty vault.
 * @property {Address} splitClone - The address of the split clone.
 * @property {string} royaltyStack - The royalty stack.
 * @property {Address[]} targetAncestors - The target ancestors for the royalty.
 * @property {string[]} targetRoyaltyAmount - The target royalty amounts.
 * @property {string} blockNumber - The block number.
 * @property {string} blockTimestamp - The block timestamp.
 */
export type RoyaltyPolicy = {
    id: Address;
    ipRoyaltyVault: Address;
    splitClone: Address;
    royaltyStack: string;
    targetAncestors: Address[];
    targetRoyaltyAmount: string[];
    blockNumber: string;
    blockTimestamp: string;
};

/**
 * Interface representing a trait with a type, value, and optional max value.
 * @interface
 * @property {string} trait_type - The type of the trait.
 * @property {string | number} value - The value of the trait (can be a string or number).
 * @property {number} [max_value] - The maximum value that the trait can have (optional).
 */
export interface Trait {
    trait_type: string;
    value: string | number;
    max_value?: number;
}

/**
 * Represents the license terms for a specific license agreement.
 * @typedef {Object} LicenseTerms
 * @property {string} id - The unique identifier for the license terms.
 * @property {Trait[]} licenseTerms - An array of traits associated with the license terms.
 * @property {Address} licenseTemplate - The address of the license template used for the agreement.
 * @property {string} blockNumber - The block number related to the license agreement.
 * @property {string} blockTime - The timestamp of when the block was created.
 */
export type LicenseTerms = {
    id: string;
    // json: string
    licenseTerms: Trait[];
    licenseTemplate: Address;
    blockNumber: string;
    blockTime: string;
};

/**
 * Interface for representing metadata of an asset.
 *
 * @interface AssetMetadata
 * @property {Address} id - The identifier of the asset.
 * @property {string} metadataHash - The hash of the metadata.
 * @property {string} metadataUri - The URI of the asset's metadata.
 * @property {IPMetadata} metadataJson - The JSON representation of the metadata.
 * @property {string} nftMetadataHash - The hash of the NFT metadata.
 * @property {string} nftTokenUri - The URI of the NFT token.
 * @property {string} registrationDate - The date of registration for the asset.
 */
export interface AssetMetadata {
    id: Address;
    metadataHash: string;
    metadataUri: string;
    metadataJson: IPMetadata;
    nftMetadataHash: string;
    nftTokenUri: string;
    registrationDate: string;
}

/**
 * Interface representing a trait.
 * @interface
 */
        	
export interface Trait {
    trait_type: string;
    value: string | number;
    max_value?: number;
}
