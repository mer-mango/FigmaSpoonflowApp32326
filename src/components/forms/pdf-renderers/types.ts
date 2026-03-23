/**
 * Shared TypeScript types for PDF renderers
 * 
 * These types match your existing document data structures
 * to ensure compatibility between HTML components and PDF renderers.
 */

// ============================================================================
// SOW (Scope of Work) Types
// ============================================================================

export interface ProjectOption {
  id: string;
  title: string;
  subtitle: string;
  projectDescription: string;
  scopeOfServices: string;
  deliverablesAndSuccess: string;
  timeline: string;
  rolesResponsibilities: string;
  communication: string;
  feesPaymentTerms: string;
  assumptions: string;
  inclusionsExclusions: string;
  risksConstraints: string;
  ipUsage: string;
  confidentiality: string;
}

export interface SectionToggles {
  projectDescription: boolean;
  scopeOfServices: boolean;
  deliverablesAndSuccess: boolean;
  timeline: boolean;
  rolesResponsibilities: boolean;
  communication: boolean;
  feesPaymentTerms: boolean;
  assumptions: boolean;
  inclusionsExclusions: boolean;
  risksConstraints: boolean;
  ipUsage: boolean;
  confidentiality: boolean;
}

export interface SOWDocumentData {
  projectOptions: ProjectOption[];
  enabledSections: SectionToggles;
  date?: string;
  consultantSignature?: string;
}

// ============================================================================
// Licensing Agreement Types
// ============================================================================

export interface UsageRight {
  id: string;
  text: string;
}

export interface Restriction {
  id: string;
  text: string;
}

export interface TermsSection {
  id: string;
  title: string;
  content: string;
}

export interface LicensingDocumentData {
  agreementTitle?: string;
  agreementDate?: string;
  licenseeName?: string;
  licenseeOrganization?: string;
  licenseeEmail?: string;
  licenseType?: string;
  licenseScope?: string;
  territory?: string;
  duration?: string;
  licenseFee?: string;
  serviceName?: string;
  usageRights?: UsageRight[];
  restrictions?: Restriction[];
  termsSections?: TermsSection[];
}

// ============================================================================
// Pre-Consult Questionnaire Types
// ============================================================================

export interface PreConsultGeneralData {
  contactName?: string;
  organizationName?: string;
  contactEmail?: string;
  organizationDescription?: string;
  organizationLinks?: string;
  whatBringsYou?: string;
  successLooksLike?: string;
  alreadyTried?: string;
  keyStakeholders?: string;
  timeline?: string;
  budget?: string;
  howDidYouHear?: string;
  howDidYouHearOther?: string;
}

// ============================================================================
// Invoice Types (for future implementation)
// ============================================================================

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceDocumentData {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  clientName?: string;
  clientOrganization?: string;
  clientAddress?: string;
  clientEmail?: string;
  lineItems?: InvoiceLineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  paymentInstructions?: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface SignatureData {
  clientSignature?: string;
  clientSignatureDate?: string;
  consultantSignature?: string;
  consultantSignatureDate?: string;
}

export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'signed' | 'edit-requested';

// ============================================================================
// PDF Generation Options
// ============================================================================

export interface PDFGenerationOptions {
  /**
   * Filename for the downloaded PDF (without .pdf extension)
   */
  filename?: string;
  
  /**
   * Whether to automatically download the PDF
   */
  autoDownload?: boolean;
  
  /**
   * Callback when PDF generation starts
   */
  onGenerateStart?: () => void;
  
  /**
   * Callback when PDF generation completes successfully
   */
  onGenerateSuccess?: (blob: Blob) => void;
  
  /**
   * Callback when PDF generation fails
   */
  onGenerateError?: (error: Error) => void;
}

// ============================================================================
// PDF Component Props
// ============================================================================

export interface SOWPDFProps {
  documentData: SOWDocumentData;
  clientSignature?: string;
  clientSignatureDate?: string;
  consultantSignature?: string;
}

export interface LicensingPDFProps {
  documentData: LicensingDocumentData;
}

export interface PreConsultPDFProps {
  documentData: PreConsultGeneralData;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * All supported document types for PDF generation
 */
export type DocumentType = 
  | 'sow-single'
  | 'sow-multiple'
  | 'licensing'
  | 'preconsult-general'
  | 'preconsult-training'
  | 'preconsult-audit'
  | 'invoice'
  | 'services'
  | 'payment-params'
  | 'workshop-curriculum'
  | 'innovation-audit';

/**
 * Generic document data type (union of all document data types)
 */
export type DocumentData = 
  | SOWDocumentData
  | LicensingDocumentData
  | PreConsultGeneralData
  | InvoiceDocumentData;

/**
 * PDF generation result
 */
export interface PDFResult {
  success: boolean;
  blob?: Blob;
  error?: Error;
  fileSize?: number;
}
