import {
    IAgentRuntime,
    IPdfService,
    Service,
    ServiceType,
} from "@elizaos/core";
import { getDocument, PDFDocumentProxy } from "pdfjs-dist";
import { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

/**
 * Service class that implements IPdfService interface for handling PDF files.
 */
```
export class PdfService extends Service implements IPdfService {
    static serviceType: ServiceType = ServiceType.PDF;

/**
 * Constructor for creating a new instance of the class.
 */
    constructor() {
        super();
    }

/**
 * Retrieves an instance of the IPdfService interface.
 * @returns {IPdfService} An instance of the IPdfService interface.
 */
    getInstance(): IPdfService {
        return PdfService.getInstance();
    }

/**
 * Asynchronously initializes the agent runtime.
 * 
 * @param _runtime - The agent runtime that will be initialized.
 * @returns A Promise that resolves when the initialization is complete.
 */
    async initialize(_runtime: IAgentRuntime): Promise<void> {}

/**
 * Asynchronously converts a PDF Buffer to text.
 *
 * @param {Buffer} pdfBuffer - The PDF Buffer to convert.
 * @returns {Promise<string>} A Promise that resolves to the text content of the PDF.
 */
    async convertPdfToText(pdfBuffer: Buffer): Promise<string> {
        // Convert Buffer to Uint8Array
        const uint8Array = new Uint8Array(pdfBuffer);

        const pdf: PDFDocumentProxy = await getDocument({ data: uint8Array })
            .promise;
        const numPages = pdf.numPages;
        const textPages: string[] = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .filter(isTextItem)
                .map((item) => item.str)
                .join(" ");
            textPages.push(pageText);
        }

        return textPages.join("\n");
    }
}

// Type guard function
/**
 * Check if the given item is a TextItem
 * @param {TextItem | TextMarkedContent} item - The item to be checked
 * @returns {boolean} - Returns true if the item is a TextItem, false otherwise
 */
function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
    return "str" in item;
}
