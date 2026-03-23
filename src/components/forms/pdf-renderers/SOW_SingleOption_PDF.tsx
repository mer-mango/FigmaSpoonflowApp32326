import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (you can add custom fonts here if needed)
// For now, using built-in fonts

interface ProjectOption {
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

interface SectionToggles {
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

interface SOWSingleOptionPDFProps {
  documentData: any;
  clientSignature?: string;
  clientSignatureDate?: string;
  consultantSignature?: string;
}

// Define styles - these are CSS-like but limited to PDF-compatible properties
const styles = StyleSheet.create({
  page: {
    padding: '0.75in', // Professional 0.75-inch margins
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  
  // Header with logo area
  header: {
    marginBottom: 32,
    paddingBottom: 16,
    borderBottom: '2pt solid #ddecf0',
  },
  
  logoText: {
    fontSize: 18,
    color: '#2f829b',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  
  tagline: {
    fontSize: 9,
    color: '#034863',
    opacity: 0.7,
  },
  
  // Document title area
  documentTitle: {
    fontSize: 36,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  
  projectTitle: {
    fontSize: 16,
    color: '#2f829b',
    marginBottom: 4,
  },
  
  projectSubtitle: {
    fontSize: 12,
    color: '#034863',
    opacity: 0.7,
  },
  
  // Section styling
  section: {
    marginTop: 24,
    paddingTop: 24,
    borderTop: '1pt solid #034863',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f829b',
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    textAlign: 'center',
    paddingTop: 8,
  },
  
  sectionTitle: {
    fontSize: 20,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
  },
  
  sectionContent: {
    fontSize: 11,
    color: '#000000',
    lineHeight: 1.6,
  },
  
  paragraph: {
    marginBottom: 8,
  },
  
  subheader: {
    fontSize: 12,
    color: '#2f829b',
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    marginBottom: 6,
  },
  
  totalInvestment: {
    fontSize: 14,
    color: '#2f829b',
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
    marginBottom: 6,
  },
  
  // Next Steps
  nextStepsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: '1pt solid #034863',
  },
  
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  nextStepsTitle: {
    fontSize: 20,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginLeft: 8,
  },
  
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6b2358',
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginRight: 12,
    textAlign: 'center',
    paddingTop: 8,
  },
  
  stepContent: {
    flex: 1,
  },
  
  stepTitle: {
    fontSize: 12,
    color: '#6b2358',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  
  stepDescription: {
    fontSize: 11,
    color: '#000000',
    lineHeight: 1.5,
  },
  
  // Signature section
  signatureSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: '1pt solid #034863',
  },
  
  signatureBox: {
    backgroundColor: '#6b2358',
    padding: 24,
    borderRadius: 8,
  },
  
  signatureTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
  },
  
  signatureGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  
  signatureColumn: {
    flex: 1,
  },
  
  signatureLabel: {
    fontSize: 9,
    color: '#ffffff',
    marginBottom: 4,
  },
  
  signatureValue: {
    fontSize: 11,
    color: '#ffffff',
    fontFamily: 'Helvetica-Oblique',
    paddingBottom: 8,
    borderBottom: '2pt solid #ffffff',
  },
  
  signatureDate: {
    fontSize: 10,
    color: '#ffffff',
    marginTop: 8,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 54, // 0.75in from bottom
    left: 54,
    right: 54,
    fontSize: 8,
    color: '#034863',
    opacity: 0.6,
    textAlign: 'left',
  },
});

export function SOWSingleOptionPDF({ documentData, clientSignature, clientSignatureDate, consultantSignature }: SOWSingleOptionPDFProps) {
  const projectOptions: ProjectOption[] = documentData.projectOptions || [];
  const option = projectOptions[0];
  const enabledSections: SectionToggles = documentData.enabledSections || {
    projectDescription: true,
    scopeOfServices: true,
    deliverablesAndSuccess: true,
    timeline: true,
    rolesResponsibilities: true,
    communication: true,
    feesPaymentTerms: true,
    assumptions: true,
    inclusionsExclusions: true,
    risksConstraints: true,
    ipUsage: true,
    confidentiality: true,
  };

  if (!option) return null;

  // Calculate section number dynamically
  const getSectionNumber = (sectionKey: keyof SectionToggles): number => {
    const sections: (keyof SectionToggles)[] = [
      'projectDescription',
      'scopeOfServices',
      'deliverablesAndSuccess',
      'timeline',
      'rolesResponsibilities',
      'communication',
      'feesPaymentTerms',
      'assumptions',
      'inclusionsExclusions',
      'risksConstraints',
      'ipUsage',
      'confidentiality',
    ];
    
    let number = 0;
    for (const section of sections) {
      if (enabledSections[section]) {
        number++;
        if (section === sectionKey) return number;
      }
    }
    return number;
  };

  // Helper to render text with subheaders
  const renderTextWithSubheaders = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const isSubheader = line.trim().match(/^[A-Z][^:]+:$/);
      const isTotalInvestment = line.trim().match(/^Total Investment:/i);
      
      if (isTotalInvestment) {
        return <Text key={index} style={styles.totalInvestment}>{line}</Text>;
      }
      
      if (isSubheader) {
        return <Text key={index} style={styles.subheader}>{line}</Text>;
      }
      
      return <Text key={index} style={styles.paragraph}>{line || ' '}</Text>;
    });
  };

  // Section renderer helper
  const renderSection = (
    sectionKey: keyof SectionToggles,
    title: string,
    content: string
  ) => {
    if (!enabledSections[sectionKey] || !content) return null;

    return (
      <View style={styles.section} wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>{getSectionNumber(sectionKey)}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {renderTextWithSubheaders(content)}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Empower Health Strategies</Text>
          <Text style={styles.tagline}>Patient Experience & Healthcare Strategy Consulting</Text>
        </View>

        {/* Document Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.documentTitle}>Scope of Work</Text>
          <Text style={styles.projectTitle}>{option.title}</Text>
          <Text style={styles.projectSubtitle}>{option.subtitle}</Text>
        </View>

        {/* Main Sections */}
        {renderSection('projectDescription', 'Project Description', option.projectDescription)}
        {renderSection('scopeOfServices', 'Scope of Services', option.scopeOfServices)}
        {renderSection('deliverablesAndSuccess', 'Deliverables & Success Criteria', option.deliverablesAndSuccess)}
        {renderSection('timeline', 'Timeline & Milestones', option.timeline)}
        {renderSection('rolesResponsibilities', 'Roles & Responsibilities', option.rolesResponsibilities)}
        {renderSection('communication', 'Communication', option.communication)}
        {renderSection('feesPaymentTerms', 'Fees & Payment Terms', option.feesPaymentTerms)}
        {renderSection('assumptions', 'Assumptions', option.assumptions)}
        {renderSection('inclusionsExclusions', 'Inclusions & Exclusions', option.inclusionsExclusions)}
        {renderSection('risksConstraints', 'Risks & Constraints', option.risksConstraints)}
        {renderSection('ipUsage', 'Intellectual Property Usage', option.ipUsage)}
        {renderSection('confidentiality', 'Confidentiality', option.confidentiality)}

        {/* Next Steps */}
        <View style={styles.nextStepsSection} wrap={false}>
          <View style={styles.nextStepsHeader}>
            <Text style={styles.nextStepsTitle}>Next Steps</Text>
          </View>
          
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review Engagement Details</Text>
              <Text style={styles.stepDescription}>Carefully review all sections of this scope of work.</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Sign the Scope of Work</Text>
              <Text style={styles.stepDescription}>Once you've reviewed all details, sign the document below to formalize our partnership.</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Project Kickoff Meeting</Text>
              <Text style={styles.stepDescription}>We'll schedule a kickoff meeting within 5 business days to align on project goals, introduce the team, and confirm timelines.</Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>4</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Begin Engagement</Text>
              <Text style={styles.stepDescription}>Work commences on the agreed start date with regular check-ins and transparent communication throughout the engagement.</Text>
            </View>
          </View>
        </View>

        {/* Signatures (if provided) */}
        {(clientSignature || consultantSignature) && (
          <View style={styles.signatureSection} wrap={false}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Approval & Signatures</Text>
              <View style={styles.signatureGrid}>
                <View style={styles.signatureColumn}>
                  <Text style={styles.signatureLabel}>Client Signature</Text>
                  <Text style={styles.signatureValue}>{clientSignature || ''}</Text>
                  <Text style={styles.signatureDate}>{clientSignatureDate || ''}</Text>
                </View>
                <View style={styles.signatureColumn}>
                  <Text style={styles.signatureLabel}>Consultant Signature</Text>
                  <Text style={styles.signatureValue}>{consultantSignature || 'Meredith Mangold, CPXP'}</Text>
                  <Text style={styles.signatureDate}>{documentData.date || ''}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Empower Health Strategies | hello@empowerhealthstrategies.com
        </Text>
      </Page>
    </Document>
  );
}
