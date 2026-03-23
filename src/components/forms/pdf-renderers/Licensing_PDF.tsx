import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface LicensingPDFProps {
  documentData: any;
}

const styles = StyleSheet.create({
  page: {
    padding: '0.75in',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  
  // Header
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
  
  // Document title
  documentTitle: {
    fontSize: 28,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  
  effectiveDate: {
    fontSize: 11,
    color: '#2f829b',
    marginBottom: 24,
  },
  
  // Parties section
  partiesSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '2pt solid #ddecf0',
  },
  
  partiesTitle: {
    fontSize: 16,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
  },
  
  partiesGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  
  partyColumn: {
    flex: 1,
  },
  
  partyLabel: {
    fontSize: 10,
    color: '#2f829b',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  
  partyText: {
    fontSize: 10,
    color: '#034863',
    lineHeight: 1.5,
  },
  
  // License Details section
  licenseDetailsSection: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 16,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  
  detailsBox: {
    backgroundColor: '#f5fafb',
    border: '2pt solid #ddecf0',
    borderRadius: 8,
    padding: 16,
  },
  
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  detailLabel: {
    fontSize: 10,
    color: '#2f829b',
    fontFamily: 'Helvetica-Bold',
    marginRight: 4,
  },
  
  detailValue: {
    fontSize: 10,
    color: '#034863',
  },
  
  // Usage Rights & Restrictions
  listSection: {
    marginBottom: 24,
  },
  
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  listNumber: {
    fontSize: 10,
    color: '#2f829b',
    fontFamily: 'Helvetica-Bold',
    width: 20,
  },
  
  listText: {
    fontSize: 10,
    color: '#034863',
    flex: 1,
    lineHeight: 1.5,
  },
  
  // Terms & Conditions
  termsSection: {
    marginBottom: 24,
  },
  
  termsContent: {
    fontSize: 10,
    color: '#034863',
    lineHeight: 1.6,
  },
  
  // Signature section
  signatureSection: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: '2pt solid #ddecf0',
  },
  
  signatureBox: {
    backgroundColor: '#6b2358',
    padding: 20,
    borderRadius: 8,
  },
  
  signatureTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  
  signatureDescription: {
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 1.5,
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
    marginBottom: 6,
  },
  
  signatureLine: {
    borderBottom: '2pt solid #ffffff',
    paddingBottom: 8,
    marginBottom: 8,
  },
  
  signatureInput: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: 'Helvetica-Oblique',
  },
  
  signatureReadonly: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
    fontFamily: 'Helvetica-Oblique',
  },
  
  dateLabel: {
    fontSize: 8,
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 54,
    left: 54,
    right: 54,
    fontSize: 8,
    color: '#034863',
    opacity: 0.6,
    textAlign: 'left',
  },
});

export function LicensingPDF({ documentData }: LicensingPDFProps) {
  const {
    agreementTitle = 'Licensing Agreement & Terms',
    agreementDate = '',
    licenseeName = '[Licensee Name]',
    licenseeOrganization = '[Organization]',
    licenseeEmail = '[Email]',
    licenseType = '',
    licenseScope = '',
    territory = '',
    duration = '',
    licenseFee = '',
    serviceName = '',
    usageRights = [],
    restrictions = [],
    termsSections = []
  } = documentData || {};

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Empower Health Strategies</Text>
          <Text style={styles.tagline}>Patient Experience & Healthcare Strategy Consulting</Text>
        </View>

        {/* Document Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.documentTitle}>{agreementTitle}</Text>
          <Text style={styles.effectiveDate}>Effective Date: {agreementDate}</Text>
        </View>

        {/* Parties */}
        <View style={styles.partiesSection} wrap={false}>
          <Text style={styles.partiesTitle}>Agreement Between</Text>
          <View style={styles.partiesGrid}>
            <View style={styles.partyColumn}>
              <Text style={styles.partyLabel}>Licensor</Text>
              <Text style={styles.partyText}>
                Empower Health Strategies{'\n'}
                hello@empowerhealthstrategies.com
              </Text>
            </View>
            <View style={styles.partyColumn}>
              <Text style={styles.partyLabel}>Licensee</Text>
              <Text style={styles.partyText}>
                {licenseeName}{'\n'}
                {licenseeOrganization}{'\n'}
                {licenseeEmail}
              </Text>
            </View>
          </View>
        </View>

        {/* License Details */}
        <View style={styles.licenseDetailsSection} wrap={false}>
          <Text style={styles.sectionTitle}>License Details</Text>
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>License Type:</Text>
              <Text style={styles.detailValue}>{licenseType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Scope:</Text>
              <Text style={styles.detailValue}>{licenseScope}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Territory:</Text>
              <Text style={styles.detailValue}>{territory}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{duration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>License Fee:</Text>
              <Text style={styles.detailValue}>{licenseFee}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Name:</Text>
              <Text style={styles.detailValue}>{serviceName}</Text>
            </View>
          </View>
        </View>

        {/* Usage Rights */}
        {usageRights.length > 0 && (
          <View style={styles.listSection} wrap={false}>
            <Text style={styles.sectionTitle}>Usage Rights</Text>
            {usageRights.map((right: any, index: number) => (
              <View key={right.id} style={styles.listItem}>
                <Text style={styles.listNumber}>{index + 1}.</Text>
                <Text style={styles.listText}>{right.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Restrictions */}
        {restrictions.length > 0 && (
          <View style={styles.listSection} wrap={false}>
            <Text style={styles.sectionTitle}>Restrictions</Text>
            {restrictions.map((restriction: any, index: number) => (
              <View key={restriction.id} style={styles.listItem}>
                <Text style={styles.listNumber}>{index + 1}.</Text>
                <Text style={styles.listText}>{restriction.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Terms & Conditions Sections */}
        {termsSections.map((section: any) => (
          <View key={section.id} style={styles.termsSection} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.termsContent}>{section.content}</Text>
          </View>
        ))}

        {/* Signature Section */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Agreement Acceptance</Text>
            <Text style={styles.signatureDescription}>
              By signing below, both parties agree to the licensing terms and conditions outlined in this document.
            </Text>
            <View style={styles.signatureGrid}>
              <View style={styles.signatureColumn}>
                <Text style={styles.signatureLabel}>Client Signature *</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureInput}>_________________________</Text>
                </View>
                <Text style={styles.dateLabel}>Date</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureInput}>_____________</Text>
                </View>
              </View>
              <View style={styles.signatureColumn}>
                <Text style={styles.signatureLabel}>Empower Health Strategies</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureReadonly}>Meredith Mangold, CPXP</Text>
                </View>
                <Text style={styles.dateLabel}>Date</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureInput}>_____________</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Empower Health Strategies | hello@empowerhealthstrategies.com
        </Text>
      </Page>
    </Document>
  );
}
