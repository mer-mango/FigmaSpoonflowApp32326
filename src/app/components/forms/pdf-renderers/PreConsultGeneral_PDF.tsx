import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface PreConsultGeneralPDFProps {
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
  
  // Document title area
  documentTitle: {
    fontSize: 36,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  
  documentSubtitle: {
    fontSize: 12,
    color: '#2f829b',
    marginBottom: 12,
  },
  
  contactSummary: {
    fontSize: 11,
    color: '#034863',
    lineHeight: 1.5,
  },
  
  contactDivider: {
    fontSize: 11,
    color: '#034863',
    opacity: 0.4,
    marginHorizontal: 6,
  },
  
  // Instructions box
  instructionsBox: {
    backgroundColor: '#f5fafb',
    border: '2pt solid #ddecf0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  
  instructionsText: {
    fontSize: 11,
    color: '#034863',
    lineHeight: 1.6,
  },
  
  // Question sections
  questionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1pt solid #ddecf0',
  },
  
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f829b',
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingTop: 8,
    marginRight: 12,
  },
  
  questionText: {
    flex: 1,
    fontSize: 12,
    color: '#034863',
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.5,
  },
  
  answerText: {
    fontSize: 11,
    color: '#034863',
    lineHeight: 1.6,
    marginLeft: 44,
  },
  
  emptyAnswer: {
    fontSize: 11,
    color: '#034863',
    opacity: 0.5,
    marginLeft: 44,
  },
  
  additionalLabel: {
    fontSize: 10,
    color: '#034863',
    opacity: 0.7,
    marginLeft: 44,
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

export function PreConsultGeneralPDF({ documentData }: PreConsultGeneralPDFProps) {
  const {
    contactName = '',
    organizationName = '',
    contactEmail = '',
    organizationDescription = '',
    organizationLinks = '',
    whatBringsYou = '',
    successLooksLike = '',
    alreadyTried = '',
    keyStakeholders = '',
    timeline = '',
    budget = '',
    howDidYouHear = '',
    howDidYouHearOther = ''
  } = documentData || {};

  const formatContactSummary = () => {
    const parts = [];
    if (contactName) parts.push(contactName);
    if (organizationName) parts.push(organizationName);
    if (contactEmail) parts.push(contactEmail);
    return parts.join(' | ');
  };

  const formatHowDidYouHear = () => {
    if (howDidYouHear === 'Other' && howDidYouHearOther) {
      return `Other: ${howDidYouHearOther}`;
    }
    return howDidYouHear || '—';
  };

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
          <Text style={styles.documentTitle}>Pre-Consult Questionnaire</Text>
          <Text style={styles.documentSubtitle}>Preliminary Consultation</Text>
          {formatContactSummary() && (
            <Text style={styles.contactSummary}>{formatContactSummary()}</Text>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsBox} wrap={false}>
          <Text style={styles.instructionsText}>
            Thank you for your interest in Empower Health Strategies. The information below helps me understand 
            your context and goals so our consultation can be as focused and useful as possible.
          </Text>
        </View>

        {/* Question 1 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>1</Text>
            <Text style={styles.questionText}>
              Briefly tell us about your organization and the work you do.
            </Text>
          </View>
          <Text style={organizationDescription ? styles.answerText : styles.emptyAnswer}>
            {organizationDescription || '—'}
          </Text>
          {organizationLinks && (
            <>
              <Text style={styles.additionalLabel}>Links or Additional Materials:</Text>
              <Text style={styles.answerText}>{organizationLinks}</Text>
            </>
          )}
        </View>

        {/* Question 2 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>2</Text>
            <Text style={styles.questionText}>
              What brings you to Empower Health Strategies right now?
            </Text>
          </View>
          <Text style={whatBringsYou ? styles.answerText : styles.emptyAnswer}>
            {whatBringsYou || '—'}
          </Text>
        </View>

        {/* Question 3 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>3</Text>
            <Text style={styles.questionText}>
              What would success look like for you?
            </Text>
          </View>
          <Text style={successLooksLike ? styles.answerText : styles.emptyAnswer}>
            {successLooksLike || '—'}
          </Text>
        </View>

        {/* Question 4 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>4</Text>
            <Text style={styles.questionText}>
              What have you already tried or explored to address this?
            </Text>
          </View>
          <Text style={alreadyTried ? styles.answerText : styles.emptyAnswer}>
            {alreadyTried || '—'}
          </Text>
        </View>

        {/* Question 5 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>5</Text>
            <Text style={styles.questionText}>
              Who are the key stakeholders or decision-makers involved in this work?
            </Text>
          </View>
          <Text style={keyStakeholders ? styles.answerText : styles.emptyAnswer}>
            {keyStakeholders || '—'}
          </Text>
        </View>

        {/* Question 6 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>6</Text>
            <Text style={styles.questionText}>
              What's your ideal timeline for getting started?
            </Text>
          </View>
          <Text style={timeline ? styles.answerText : styles.emptyAnswer}>
            {timeline || '—'}
          </Text>
        </View>

        {/* Question 7 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>7</Text>
            <Text style={styles.questionText}>
              What's your estimated budget range for this work?
            </Text>
          </View>
          <Text style={budget ? styles.answerText : styles.emptyAnswer}>
            {budget || '—'}
          </Text>
        </View>

        {/* Question 8 */}
        <View style={styles.questionSection} wrap={false}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>8</Text>
            <Text style={styles.questionText}>
              How did you hear about Empower Health Strategies?
            </Text>
          </View>
          <Text style={howDidYouHear ? styles.answerText : styles.emptyAnswer}>
            {formatHowDidYouHear()}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Empower Health Strategies | hello@empowerhealthstrategies.com
        </Text>
      </Page>
    </Document>
  );
}
