/**
 * Flow + PDF Integration Example
 * 
 * This shows how PDF generation integrates with your Flow Wizard system.
 * 
 * FLOW WIZARD RECAP:
 * Contact → Forms → Customize → Preview → URL → Email
 * 
 * When client completes flow:
 * 1. Collect all form data
 * 2. Generate PDFs automatically
 * 3. Upload to storage
 * 4. Send email with PDF links
 * 5. Create internal records
 */

import { generateDocumentPDF, uploadPDFToStorage, generateMultiplePDFs } from './pdfGenerationService';
import type { DocumentType } from './pdfGenerationService';

/**
 * Example: Client completes SOW flow
 * 
 * This is what happens after they click "Submit" on the flow
 */
export async function handleSOWFlowCompletion(
  flowInstanceId: string,
  formData: any,
  supabase: any
): Promise<{
  success: boolean;
  pdfUrl?: string;
  error?: string;
}> {
  try {
    console.log('📝 SOW Flow completed:', flowInstanceId);
    console.log('📦 Form data received:', formData);

    // 1. Generate the PDF
    console.log('🔄 Generating PDF...');
    const pdfResult = await generateDocumentPDF('sow-single', formData, {
      clientSignature: formData.clientSignature,
      clientSignatureDate: formData.clientSignatureDate,
      consultantSignature: 'Meredith Mangold, CPXP',
    });

    if (!pdfResult.success || !pdfResult.blob) {
      throw new Error(pdfResult.error || 'PDF generation failed');
    }

    console.log('✅ PDF generated:', pdfResult.fileSize, 'bytes');

    // 2. Upload to Supabase Storage
    console.log('📤 Uploading to storage...');
    const uploadResult = await uploadPDFToStorage(
      'sow-single',
      formData,
      supabase,
      {
        storagePath: `flows/${flowInstanceId}/scope-of-work.pdf`,
        clientSignature: formData.clientSignature,
        clientSignatureDate: formData.clientSignatureDate,
      }
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    console.log('✅ PDF uploaded:', uploadResult.url);

    // 3. Save flow completion record to database
    await supabase
      .from('flow_instances')
      .update({
        status: 'completed',
        pdf_url: uploadResult.url,
        completed_at: new Date().toISOString(),
      })
      .eq('id', flowInstanceId);

    // 4. (Optional) Send email to client with PDF
    // await sendCompletionEmail(formData.clientEmail, uploadResult.url);

    return {
      success: true,
      pdfUrl: uploadResult.url,
    };

  } catch (error) {
    console.error('❌ Flow completion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Example: Multi-document flow completion
 * 
 * When a flow generates multiple documents (SOW + Invoice + Licensing)
 */
export async function handleMultiDocumentFlowCompletion(
  flowInstanceId: string,
  flowData: {
    sowData: any;
    invoiceData: any;
    licensingData: any;
  },
  supabase: any
): Promise<{
  success: boolean;
  pdfs?: {
    sow: string;
    invoice: string;
    licensing: string;
  };
  error?: string;
}> {
  try {
    console.log('📝 Multi-document flow completed:', flowInstanceId);

    // Generate all PDFs in parallel
    const results = await generateMultiplePDFs([
      { type: 'sow-single', data: flowData.sowData },
      { type: 'invoice', data: flowData.invoiceData },
      { type: 'licensing', data: flowData.licensingData },
    ]);

    // Check if all succeeded
    const allSucceeded = results.every(r => r.success);
    if (!allSucceeded) {
      const errors = results.filter(r => !r.success).map(r => r.error);
      throw new Error(`PDF generation failed: ${errors.join(', ')}`);
    }

    console.log('✅ All PDFs generated successfully');

    // Upload all PDFs to storage
    const [sowUpload, invoiceUpload, licensingUpload] = await Promise.all([
      uploadPDFToStorage('sow-single', flowData.sowData, supabase, {
        storagePath: `flows/${flowInstanceId}/scope-of-work.pdf`,
      }),
      uploadPDFToStorage('invoice', flowData.invoiceData, supabase, {
        storagePath: `flows/${flowInstanceId}/invoice.pdf`,
      }),
      uploadPDFToStorage('licensing', flowData.licensingData, supabase, {
        storagePath: `flows/${flowInstanceId}/licensing-agreement.pdf`,
      }),
    ]);

    // Verify all uploads succeeded
    if (!sowUpload.success || !invoiceUpload.success || !licensingUpload.success) {
      throw new Error('One or more uploads failed');
    }

    console.log('✅ All PDFs uploaded to storage');

    // Save to database
    await supabase
      .from('flow_instances')
      .update({
        status: 'completed',
        sow_pdf_url: sowUpload.url,
        invoice_pdf_url: invoiceUpload.url,
        licensing_pdf_url: licensingUpload.url,
        completed_at: new Date().toISOString(),
      })
      .eq('id', flowInstanceId);

    return {
      success: true,
      pdfs: {
        sow: sowUpload.url!,
        invoice: invoiceUpload.url!,
        licensing: licensingUpload.url!,
      },
    };

  } catch (error) {
    console.error('❌ Multi-document flow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Example: Pre-consult questionnaire flow
 * 
 * Simpler flow - just collect data and generate PDF
 */
export async function handlePreConsultFlowCompletion(
  flowInstanceId: string,
  formData: any,
  supabase: any
): Promise<{
  success: boolean;
  pdfUrl?: string;
  error?: string;
}> {
  try {
    // Generate PDF
    const uploadResult = await uploadPDFToStorage(
      'preconsult-general',
      formData,
      supabase,
      {
        storagePath: `flows/${flowInstanceId}/pre-consult-questionnaire.pdf`,
      }
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Save to database
    await supabase
      .from('flow_instances')
      .update({
        status: 'completed',
        pdf_url: uploadResult.url,
        completed_at: new Date().toISOString(),
      })
      .eq('id', flowInstanceId);

    // Create internal record in CRM
    await supabase
      .from('pre_consult_submissions')
      .insert({
        flow_instance_id: flowInstanceId,
        contact_name: formData.contactName,
        organization_name: formData.organizationName,
        contact_email: formData.contactEmail,
        submitted_data: formData,
        pdf_url: uploadResult.url,
        created_at: new Date().toISOString(),
      });

    return {
      success: true,
      pdfUrl: uploadResult.url,
    };

  } catch (error) {
    console.error('❌ Pre-consult flow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * INTEGRATION POINTS WITH YOUR EXISTING FLOW WIZARD:
 * 
 * In your FlowWizard component (step 6 - Email):
 * 
 * 1. When flow is created:
 *    - Generate shareable URL
 *    - Send to client
 * 
 * 2. When client submits flow:
 *    - Call handleSOWFlowCompletion() (or appropriate handler)
 *    - This generates PDF, uploads to storage, saves to DB
 * 
 * 3. Confirmation email to client:
 *    - Include PDF download link from storage
 *    - "Your Scope of Work is ready: [Download PDF]"
 * 
 * 4. Internal record:
 *    - PDF stored in Supabase Storage
 *    - Link saved in flow_instances table
 *    - Available in your Client Hub for reference
 */
