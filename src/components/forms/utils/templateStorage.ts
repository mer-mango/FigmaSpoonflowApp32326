// Template storage for Empower Health Strategies Forms System
// This defines the STRUCTURE (Layer 1) that Form Editors (Layer 2) will read from

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  defaultValue?: string | number | boolean;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  options?: string[]; // for select fields
  helpText?: string;
  order?: number;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  visible?: boolean;
  order?: number;
  fields: TemplateField[];
}

// Type aliases for consistency
export type FormField = TemplateField;
export type FormSection = TemplateSection;

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  sections: FormSection[];
  lastModified: string; // ISO timestamp
}

// ============================================
// INVOICE TEMPLATE
// ============================================
const invoiceTemplate: FormTemplate = {
  id: 'invoice',
  name: 'Invoice',
  description: 'Generate professional invoices with itemized services and payment terms',
  sections: [
    {
      id: 'invoice-information',
      title: 'Invoice Information',
      description: 'Basic invoice details and dates',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'invoice-number',
          label: 'Invoice Number',
          type: 'text',
          defaultValue: 'INV-2026-001',
          placeholder: 'INV-2026-001',
          required: true,
          visible: true,
          helpText: 'Unique identifier for this invoice'
        },
        {
          id: 'invoice-date',
          label: 'Invoice Date',
          type: 'text',
          defaultValue: 'January 1, 2026',
          placeholder: 'January 1, 2026',
          required: true,
          visible: true,
          helpText: 'Date the invoice was issued'
        },
        {
          id: 'due-date',
          label: 'Due Date',
          type: 'text',
          defaultValue: 'January 31, 2026',
          placeholder: 'January 31, 2026',
          required: true,
          visible: true,
          helpText: 'Payment due date'
        }
      ]
    },
    {
      id: 'bill-to',
      title: 'Bill To',
      description: 'Client information',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'client-company',
          label: 'Client Company',
          type: 'text',
          defaultValue: 'Memorial Regional Healthcare',
          placeholder: 'Company name',
          required: true,
          visible: true,
          helpText: 'Client organization name'
        },
        {
          id: 'client-name',
          label: 'Client Name',
          type: 'text',
          defaultValue: 'Jane Thompson',
          placeholder: 'Contact person name',
          required: true,
          visible: true,
          helpText: 'Primary contact person'
        },
        {
          id: 'client-role',
          label: 'Client Role',
          type: 'text',
          defaultValue: 'Director of Patient Experience',
          placeholder: 'Job title',
          required: false,
          visible: true,
          helpText: 'Contact person\'s role or title'
        },
        {
          id: 'client-email',
          label: 'Client Email',
          type: 'email',
          defaultValue: 'billing@memorialregional.org',
          placeholder: 'email@company.com',
          required: true,
          visible: true,
          helpText: 'Billing contact email'
        }
      ]
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      description: 'Payment terms and conditions',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'payment-terms-text',
          label: 'Payment Terms',
          type: 'textarea',
          defaultValue: 'Payment is due within 30 days of invoice date. Late payments will incur a 1.5% monthly interest charge. Payment can be made via ACH transfer, check, or credit card.',
          placeholder: 'Enter payment terms and conditions',
          required: true,
          visible: true,
          helpText: 'Define payment deadlines, late fees, and accepted payment methods'
        }
      ]
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Additional notes or thank you message',
      visible: true,
      order: 4,
      fields: [
        {
          id: 'notes-text',
          label: 'Notes',
          type: 'textarea',
          defaultValue: 'Thank you for partnering with Empower Health Strategies. We look forward to continuing our work together to transform patient experiences at your organization.',
          placeholder: 'Additional notes or thank you message...',
          required: false,
          visible: true,
          helpText: 'Optional message to include on the invoice'
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// PAYMENT TERMS TEMPLATE
// ============================================
const paymentTemplate: FormTemplate = {
  id: 'payment',
  name: 'Payment Terms',
  description: 'Establish payment schedules, milestones, and terms',
  sections: [
    {
      id: 'document-information',
      title: 'Document Information',
      description: 'Agreement header details',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'agreement-title',
          label: 'Agreement Title',
          type: 'text',
          defaultValue: 'Payment Schedule & Terms',
          placeholder: 'Payment Schedule & Terms',
          required: true,
          visible: true,
          helpText: 'Title of the payment agreement document'
        },
        {
          id: 'agreement-date',
          label: 'Date',
          type: 'text',
          defaultValue: 'January 1, 2026',
          placeholder: 'January 1, 2026',
          required: true,
          visible: true,
          helpText: 'Date of the agreement'
        }
      ]
    },
    {
      id: 'project-information',
      title: 'Project Information',
      description: 'Project and client details',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'project-name',
          label: 'Project Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter project name',
          required: true,
          visible: true,
          helpText: 'Name of the project or engagement'
        },
        {
          id: 'client-name',
          label: 'Client Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Enter client name',
          required: true,
          visible: true,
          helpText: 'Client organization or individual name'
        },
        {
          id: 'total-project-value',
          label: 'Total Project Value ($)',
          type: 'number',
          defaultValue: 50000,
          placeholder: '50000',
          required: true,
          visible: true,
          helpText: 'Total value of the project in USD'
        }
      ]
    },
    {
      id: 'terms-conditions',
      title: 'Terms & Conditions',
      description: 'Payment policies and terms',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'payment-terms',
          label: 'Payment Terms',
          type: 'textarea',
          defaultValue: 'Payment is due within 15 days of invoice date unless otherwise specified in milestone schedule. Late payments will incur a 1.5% monthly interest charge.',
          placeholder: 'Enter payment terms',
          required: true,
          visible: true,
          helpText: 'General payment terms and due date policies'
        },
        {
          id: 'cancellation-policy',
          label: 'Cancellation Policy',
          type: 'textarea',
          defaultValue: 'Either party may terminate this agreement with 30 days written notice. Client is responsible for payment of work completed through the termination date.',
          placeholder: 'Enter cancellation policy',
          required: true,
          visible: true,
          helpText: 'Terms for cancelling or terminating the agreement'
        },
        {
          id: 'additional-notes',
          label: 'Additional Notes',
          type: 'textarea',
          defaultValue: 'All fees are in USD. Travel expenses, if applicable, will be billed separately with prior approval.',
          placeholder: 'Enter additional notes',
          required: false,
          visible: true,
          helpText: 'Any additional information or disclaimers'
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// LICENSING TERMS TEMPLATE
// ============================================
const licensingTemplate: FormTemplate = {
  id: 'licensing',
  name: 'Licensing Terms',
  description: 'Define licensing terms and intellectual property agreements',
  sections: [
    {
      id: 'agreement-information',
      title: 'Agreement Information',
      description: 'Basic agreement details',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'agreement-title',
          label: 'Agreement Title',
          type: 'text',
          defaultValue: 'Licensing Agreement',
          placeholder: 'Licensing Agreement',
          required: true,
          visible: true,
          helpText: 'Title of the licensing agreement'
        },
        {
          id: 'effective-date',
          label: 'Effective Date',
          type: 'text',
          defaultValue: 'January 1, 2026',
          placeholder: 'January 1, 2026',
          required: true,
          visible: true,
          helpText: 'Date the agreement becomes effective'
        }
      ]
    },
    {
      id: 'licensee-information',
      title: 'Licensee Information',
      description: 'Information about the licensee',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'licensee-name',
          label: 'Licensee Name',
          type: 'text',
          defaultValue: '',
          placeholder: 'Full name of licensee',
          required: true,
          visible: true,
          helpText: 'Full name of the person receiving the license'
        },
        {
          id: 'licensee-organization',
          label: 'Organization',
          type: 'text',
          defaultValue: '',
          placeholder: 'Organization name',
          required: true,
          visible: true,
          helpText: 'Organization or company name'
        },
        {
          id: 'licensee-email',
          label: 'Email Address',
          type: 'email',
          defaultValue: '',
          placeholder: 'email@example.com',
          required: true,
          visible: true,
          helpText: 'Primary contact email for the licensee'
        }
      ]
    },
    {
      id: 'license-details',
      title: 'License Details',
      description: 'Scope and terms of the license',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'license-type',
          label: 'License Type',
          type: 'text',
          defaultValue: 'Enterprise License',
          placeholder: 'e.g., Enterprise License, Individual License',
          required: true,
          visible: true,
          helpText: 'Type or category of license being granted'
        },
        {
          id: 'license-scope',
          label: 'License Scope',
          type: 'textarea',
          defaultValue: 'Non-exclusive license to use proprietary methodologies, frameworks, and materials',
          placeholder: 'Describe what is being licensed',
          required: true,
          visible: true,
          helpText: 'Detailed description of what the license covers'
        },
        {
          id: 'territory',
          label: 'Territory',
          type: 'text',
          defaultValue: 'United States',
          placeholder: 'Geographic scope',
          required: true,
          visible: true,
          helpText: 'Geographic territory where license is valid'
        },
        {
          id: 'duration',
          label: 'Duration',
          type: 'text',
          defaultValue: '12 months from effective date',
          placeholder: 'e.g., 12 months, perpetual',
          required: true,
          visible: true,
          helpText: 'How long the license is valid'
        },
        {
          id: 'license-fee',
          label: 'License Fee',
          type: 'text',
          defaultValue: '$25,000 annually',
          placeholder: 'e.g., $25,000 annually',
          required: true,
          visible: true,
          helpText: 'Cost of the license'
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// PRE-CONSULT QUESTIONNAIRE (GENERAL/NEUTRAL) TEMPLATE
// ============================================
const preConsultGeneralTemplate: FormTemplate = {
  id: 'pre-consult-general',
  name: 'Pre-Consult Questionnaire',
  description: 'General pre-consultation questionnaire to learn about organization and needs',
  sections: [
    {
      id: 'contact-info',
      title: 'Contact Information',
      description: 'Basic contact details',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'contact-name',
          label: 'Your Name',
          type: 'text',
          placeholder: 'Enter your full name',
          required: true,
          visible: true
        },
        {
          id: 'contact-email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your.email@example.com',
          required: true,
          visible: true
        },
        {
          id: 'organization-name',
          label: 'Organization Name',
          type: 'text',
          placeholder: 'Enter organization name',
          required: true,
          visible: true
        }
      ]
    },
    {
      id: 'org-description',
      title: 'About Your Organization',
      description: 'Tell us about your organization and work',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'organization-description',
          label: 'Briefly tell us about your organization and the work you do.',
          type: 'textarea',
          placeholder: 'Tell us about your organization and work...',
          required: false,
          visible: true
        },
        {
          id: 'organization-links',
          label: 'Links or Additional Materials (optional)',
          type: 'textarea',
          placeholder: 'Paste links or describe materials here...',
          required: false,
          visible: true,
          helpText: 'Examples: website link, product overview, slide deck, demo link'
        }
      ]
    },
    {
      id: 'what-brings-you',
      title: 'Current Situation',
      description: 'Help us understand your context',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'what-brings-you',
          label: 'What brings you to Empower Health Strategies right now?',
          type: 'textarea',
          placeholder: 'Share what prompted you to reach out...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'success',
      title: 'Desired Outcomes',
      description: 'Define success',
      visible: true,
      order: 4,
      fields: [
        {
          id: 'success-looks-like',
          label: 'What would success look like for you?',
          type: 'textarea',
          placeholder: 'Describe your desired outcomes...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'already-tried',
      title: 'Previous Efforts',
      description: 'Past approaches',
      visible: true,
      order: 5,
      fields: [
        {
          id: 'already-tried',
          label: 'What have you already tried or explored to address this?',
          type: 'textarea',
          placeholder: 'Share your past efforts and experiences...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'stakeholders',
      title: 'Key People',
      description: 'Decision makers',
      visible: true,
      order: 6,
      fields: [
        {
          id: 'key-stakeholders',
          label: 'Who are the key stakeholders or decision-makers involved in this work?',
          type: 'textarea',
          placeholder: 'Identify the key people involved...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'timeline',
      title: 'Timeline',
      description: 'When you need to start',
      visible: true,
      order: 7,
      fields: [
        {
          id: 'timeline',
          label: "What's your ideal timeline for getting started?",
          type: 'textarea',
          placeholder: 'Share your preferred timeline or any relevant deadlines...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget',
      description: 'Investment range',
      visible: true,
      order: 8,
      fields: [
        {
          id: 'budget',
          label: "What's your estimated budget range for this work?",
          type: 'select',
          options: ['$750-1,500', '$1,500-5,000', '$5,000+'],
          required: true,
          visible: true
        }
      ]
    },
    {
      id: 'referral',
      title: 'How You Found Us',
      description: 'Referral source',
      visible: true,
      order: 9,
      fields: [
        {
          id: 'how-did-you-hear',
          label: 'How did you hear about Empower Health Strategies?',
          type: 'select',
          options: ['Website', 'Google', 'LinkedIn', 'Referral', 'Other'],
          required: true,
          visible: true
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// PRE-CONSULT QUESTIONNAIRE: AUDIT TEMPLATE
// ============================================
const preConsultAuditTemplate: FormTemplate = {
  id: 'pre-consult-audit',
  name: 'Pre-Consult Q: Audit',
  description: 'Pre-consultation questionnaire for prospects interested in the audit service',
  sections: [
    {
      id: 'contact-info',
      title: 'Contact Information',
      description: 'Basic contact details',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'contact-name',
          label: 'Your Name',
          type: 'text',
          placeholder: 'Enter your full name',
          required: true,
          visible: true
        },
        {
          id: 'contact-email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your.email@example.com',
          required: true,
          visible: true
        },
        {
          id: 'organization-name',
          label: 'Organization Name',
          type: 'text',
          placeholder: 'Enter organization name',
          required: true,
          visible: true
        }
      ]
    },
    {
      id: 'org-context',
      title: 'Organization Context',
      description: 'About your organization and product',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'organization-description',
          label: 'Briefly share about your organization and the product or care experience you\'re working on.',
          type: 'textarea',
          placeholder: 'Tell us about your organization and product...',
          required: true,
          visible: true
        }
      ]
    },
    {
      id: 'product-stage',
      title: 'Product Stage',
      description: 'Current stage of development',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'product-stage',
          label: 'If you\'re building a specific product, what stage is it currently in?',
          type: 'select',
          options: ['Concept / early validation', 'MVP or pilot', 'Live with users', 'Mature product', 'Not applicable / general care experience improvement'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'audit-prompt',
      title: 'Why an Audit Now',
      description: 'What prompted your interest',
      visible: true,
      order: 4,
      fields: [
        {
          id: 'audit-prompt',
          label: 'What prompted you to seek a Patient Experience (PX) & Impact Audit now?',
          type: 'textarea',
          placeholder: 'Share what brought you here...',
          required: true,
          visible: true
        }
      ]
    },
    {
      id: 'areas-clarity',
      title: 'Areas for Clarity',
      description: 'What you want to explore',
      visible: true,
      order: 5,
      fields: [
        {
          id: 'areas-to-clarity',
          label: 'Which areas do you most want clarity on through the audit?',
          type: 'checkbox',
          options: ['User pain points & unmet needs', 'Journey gaps or friction points', 'Stakeholder alignment on PX priorities', 'Product-market fit or value proposition clarity', 'Competitive differentiation', 'Impact measurement or outcomes framework', 'Other'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'decision-involvement',
      title: 'Decision Making',
      description: 'Your role in decisions',
      visible: true,
      order: 6,
      fields: [
        {
          id: 'decision-involvement',
          label: 'Are you the primary decision-maker, or are there others who\'ll be involved in deciding to move forward?',
          type: 'textarea',
          placeholder: 'Describe your decision-making context...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'consultation-goals',
      title: 'Consultation Goals',
      description: 'What you hope to accomplish',
      visible: true,
      order: 7,
      fields: [
        {
          id: 'consultation-goals',
          label: 'What would you most like to get out of our consultation call?',
          type: 'checkbox',
          options: ['Understand the audit process and what\'s involved', 'Get a sense of what insights I might uncover', 'Explore whether this is the right fit for my current stage', 'Talk through pricing and timeline', 'Other'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'timeline',
      title: 'Timeline',
      description: 'When you want to start',
      visible: true,
      order: 8,
      fields: [
        {
          id: 'timeline',
          label: 'What\'s your ideal timeline for moving forward?',
          type: 'select',
          options: ['ASAP (within 2 weeks)', 'Within a month', '1-3 months', 'Exploratory / no set timeline yet'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget',
      description: 'Investment range',
      visible: true,
      order: 9,
      fields: [
        {
          id: 'budget',
          label: 'Do you have a budget range in mind for this work?',
          type: 'select',
          options: ['$750-1,500', '$1,500-5,000', '$5,000+', 'Not sure yet'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'referral',
      title: 'How You Found Us',
      description: 'Referral source',
      visible: true,
      order: 10,
      fields: [
        {
          id: 'how-did-you-hear',
          label: 'How did you hear about Empower Health Strategies?',
          type: 'select',
          options: ['Website', 'Google', 'LinkedIn', 'Referral', 'Newsletter/Content', 'Other'],
          required: false,
          visible: true
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// PRE-CONSULT QUESTIONNAIRE: WORKSHOP/TRAINING TEMPLATE
// ============================================
const preConsultWorkshopTemplate: FormTemplate = {
  id: 'pre-consult-workshop',
  name: 'Pre-Consult Q: Training',
  description: 'Pre-consultation questionnaire for prospects interested in workshop/training',
  sections: [
    {
      id: 'contact-info',
      title: 'Contact Information',
      description: 'Basic contact details',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'contact-name',
          label: 'Your Name',
          type: 'text',
          placeholder: 'Enter your full name',
          required: true,
          visible: true
        },
        {
          id: 'contact-email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your.email@example.com',
          required: true,
          visible: true
        },
        {
          id: 'organization-name',
          label: 'Organization Name',
          type: 'text',
          placeholder: 'Enter organization name',
          required: true,
          visible: true
        }
      ]
    },
    {
      id: 'org-context',
      title: 'Organization Context',
      description: 'About your organization',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'organization-context',
          label: 'Briefly tell us about your organization and the work you do.',
          type: 'textarea',
          placeholder: 'Tell us about your organization...',
          required: true,
          visible: true
        },
        {
          id: 'organization-links',
          label: 'Links or Additional Materials (optional)',
          type: 'textarea',
          placeholder: 'Paste links to your website, materials, etc...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'target-audience',
      title: 'Target Audience',
      description: 'Who will participate',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'target-audience',
          label: 'Who would this virtual workshop or training be for?',
          type: 'checkbox',
          options: ['Product team', 'Design / UX team', 'Leadership / strategy team', 'Clinical or care delivery team', 'Cross-functional group', 'Other'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'team-size',
      title: 'Team Size',
      description: 'Number of participants',
      visible: true,
      order: 4,
      fields: [
        {
          id: 'team-size',
          label: 'How large is the group you\'re envisioning?',
          type: 'select',
          options: ['Just me (1:1 coaching)', '2-5 people', '6-15 people', '16-30 people', '30+ people', 'Not sure yet'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'training-goals',
      title: 'Training Goals',
      description: 'What you hope to accomplish',
      visible: true,
      order: 5,
      fields: [
        {
          id: 'training-goals',
          label: 'What would you most like this group to walk away with?',
          type: 'checkbox',
          options: ['Practical tools or frameworks they can apply immediately', 'Shared language and mental models for PX work', 'Strategic vision or direction setting', 'Hands-on practice (e.g., journey mapping, patient personas)', 'External perspective or validation', 'Other'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'current-context',
      title: 'Current Context',
      description: 'What prompted this request',
      visible: true,
      order: 6,
      fields: [
        {
          id: 'current-context',
          label: 'What\'s happening right now that makes this training feel timely or needed?',
          type: 'textarea',
          placeholder: 'Share your current context...',
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'format-preference',
      title: 'Format Preference',
      description: 'How you envision the training',
      visible: true,
      order: 7,
      fields: [
        {
          id: 'format-preference',
          label: 'Do you have a format preference?',
          type: 'select',
          options: ['Single session (90min - 2 hours)', 'Half-day (3-4 hours)', 'Multi-session series', 'Not sure yet — open to recommendations'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'timeline',
      title: 'Timeline',
      description: 'When you want to start',
      visible: true,
      order: 8,
      fields: [
        {
          id: 'timeline',
          label: 'What\'s your ideal timeline for this?',
          type: 'select',
          options: ['ASAP (within 2 weeks)', 'Within a month', '1-3 months', 'Exploratory / no set timeline yet'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'budget',
      title: 'Budget',
      description: 'Investment range',
      visible: true,
      order: 9,
      fields: [
        {
          id: 'budget',
          label: 'Do you have a budget range in mind?',
          type: 'select',
          options: ['$750-1,500', '$1,500-5,000', '$5,000+', 'Not sure yet'],
          required: false,
          visible: true
        }
      ]
    },
    {
      id: 'referral',
      title: 'How You Found Us',
      description: 'Referral source',
      visible: true,
      order: 10,
      fields: [
        {
          id: 'how-did-you-hear',
          label: 'How did you hear about Empower Health Strategies?',
          type: 'select',
          options: ['Website', 'Google', 'LinkedIn', 'Referral', 'Newsletter/Content', 'Other'],
          required: false,
          visible: true
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// INNOVATION AUDIT TEMPLATE
// ============================================
const innovationAuditTemplate: FormTemplate = {
  id: 'innovation',
  name: 'Audit Template',
  description: 'Evaluate organizational innovation capabilities and opportunities',
  sections: [
    {
      id: 'audit-header',
      title: 'Audit Header Information',
      description: 'Basic audit identification and metadata',
      visible: true,
      order: 1,
      fields: [
        {
          id: 'audit-title',
          label: 'Audit Title',
          type: 'text',
          defaultValue: 'Patient Experience Innovation Audit',
          placeholder: 'Audit Title',
          required: true,
          visible: true,
          helpText: 'The main title that will appear on the audit document'
        },
        {
          id: 'audit-date',
          label: 'Audit Date',
          type: 'text',
          defaultValue: 'January 1, 2026',
          placeholder: 'January 1, 2026',
          required: true,
          visible: true,
          helpText: 'Date the audit was conducted or issued'
        }
      ]
    },
    {
      id: 'organization-info',
      title: 'Organization Information',
      description: 'Details about the organization being audited',
      visible: true,
      order: 2,
      fields: [
        {
          id: 'organization-name',
          label: 'Organization Name',
          type: 'text',
          placeholder: 'Company or organization name',
          required: true,
          visible: true,
          helpText: 'Full name of the organization'
        },
        {
          id: 'organization-type',
          label: 'Organization Type',
          type: 'text',
          placeholder: 'e.g., Healthcare Provider, MedTech Startup',
          required: false,
          visible: true,
          helpText: 'Type or sector of the organization'
        },
        {
          id: 'contact-name',
          label: 'Primary Contact Name',
          type: 'text',
          placeholder: 'Contact person name',
          required: true,
          visible: true,
          helpText: 'Main point of contact for this audit'
        },
        {
          id: 'contact-email',
          label: 'Contact Email',
          type: 'email',
          placeholder: 'email@example.com',
          required: true,
          visible: true,
          helpText: 'Contact email address'
        }
      ]
    },
    {
      id: 'audit-purpose',
      title: 'Audit Purpose',
      description: 'Why this audit is being conducted',
      visible: true,
      order: 3,
      fields: [
        {
          id: 'audit-purpose',
          label: 'Purpose Statement',
          type: 'textarea',
          defaultValue: 'This innovation audit assesses your organization\'s current capabilities, culture, and readiness for patient experience innovation. The results will identify strengths, opportunities, and actionable recommendations for improvement.',
          placeholder: 'Describe the purpose of this audit...',
          required: false,
          visible: true,
          helpText: 'A clear statement about the goals and scope of this audit'
        }
      ]
    },
    {
      id: 'audit-classification',
      title: 'Audit Classification',
      description: 'Categorize the focus areas of this audit',
      visible: true,
      order: 4,
      fields: [
        {
          id: 'audit-focus',
          label: 'Audit Focus Areas',
          type: 'checkbox',
          options: ['Digital Health', 'Patient Journey', 'Service Design', 'Experience Strategy', 'Innovation Culture'],
          required: false,
          visible: true,
          helpText: 'Select all focus areas that apply to this audit'
        },
        {
          id: 'innovation-type',
          label: 'Innovation Type',
          type: 'checkbox',
          options: ['Product', 'Service', 'Process', 'Business Model', 'Technology'],
          required: false,
          visible: true,
          helpText: 'Types of innovation being evaluated'
        },
        {
          id: 'end-user',
          label: 'End User Groups',
          type: 'checkbox',
          options: ['Patients', 'Caregivers', 'Clinicians', 'Care Teams', 'Health Systems'],
          required: false,
          visible: true,
          helpText: 'Who will be impacted by the innovation'
        }
      ]
    },
    {
      id: 'video-overview',
      title: 'Video Overview',
      description: 'Optional Loom video walkthrough',
      visible: true,
      order: 5,
      fields: [
        {
          id: 'loom-video-url',
          label: 'Loom Video URL',
          type: 'text',
          placeholder: 'https://www.loom.com/share/...',
          required: false,
          visible: true,
          helpText: 'Link to a Loom video overview of the audit findings'
        }
      ]
    }
  ],
  lastModified: new Date().toISOString()
};

// ============================================
// STORAGE FUNCTIONS
// ============================================

const STORAGE_KEY = 'empower_health_form_templates';

// Initialize default templates
const defaultTemplates: Record<string, FormTemplate> = {
  invoice: invoiceTemplate,
  payment: paymentTemplate,
  licensing: licensingTemplate,
  'pre-consult-general': preConsultGeneralTemplate,
  'pre-consult-audit': preConsultAuditTemplate,
  'pre-consult-workshop': preConsultWorkshopTemplate,
  // Aliases for forms that use different template IDs
  'sow': { ...invoiceTemplate, id: 'sow', name: 'Scope of Work', description: 'Create comprehensive project proposals with single engagement option' },
  'sow-multiple': { ...invoiceTemplate, id: 'sow-multiple', name: 'SOW: Multiple Options', description: 'Create proposals with multiple engagement options for clients to choose' },
  'workshop': { ...licensingTemplate, id: 'workshop', name: 'Training Curriculum', description: 'Design structured learning experiences and training programs' },
  'innovation': innovationAuditTemplate,
  'px-audit': { ...preConsultAuditTemplate, id: 'px-audit', name: 'PX Audit Onboarding Intake', description: 'Patient Experience audit onboarding: understand product perception and context' },
  'scheduling': { ...preConsultGeneralTemplate, id: 'scheduling', name: 'Scheduling Page', description: 'Create scheduling pages with Google Calendar links for consultations and calls' },
  'feedback': { ...preConsultGeneralTemplate, id: 'feedback', name: 'Feedback & Testimonial', description: 'Request feedback and testimonials from clients' },
};

// Get all templates from localStorage or use defaults
export function getAllTemplates(): Record<string, FormTemplate> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('📖 Loading templates from localStorage:', stored ? 'FOUND' : 'NOT FOUND');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📖 Loaded templates:', Object.keys(parsed));
      return parsed;
    }
  } catch (error) {
    console.error('Error loading templates from localStorage:', error);
  }
  console.log('📖 Using default templates');
  return defaultTemplates;
}

// Get a specific template by ID
export function getTemplate(templateId: string): FormTemplate | null {
  const templates = getAllTemplates();
  const template = templates[templateId] || null;
  console.log(`📖 Getting template "${templateId}":`, template ? 'FOUND' : 'NOT FOUND');
  return template;
}

// Save a template (after editing in Template Editor)
export function saveTemplate(template: FormTemplate): void {
  try {
    const templates = getAllTemplates();
    templates[template.id] = {
      ...template,
      lastModified: new Date().toISOString()
    };
    
    console.log('💾 BEFORE SAVE - Template data:', {
      id: template.id,
      sectionsCount: template.sections.length,
      firstSectionFields: template.sections[0]?.fields.length,
      firstFieldRequired: template.sections[0]?.fields[0]?.required
    });
    
    const stringified = JSON.stringify(templates);
    console.log('💾 Stringified size:', stringified.length, 'characters');
    
    localStorage.setItem(STORAGE_KEY, stringified);
    
    // Verify the save worked
    const verify = localStorage.getItem(STORAGE_KEY);
    console.log('💾 VERIFY - localStorage has data:', verify ? 'YES' : 'NO');
    
    if (verify) {
      const parsed = JSON.parse(verify);
      const savedTemplate = parsed[template.id];
      console.log('💾 VERIFY - Saved template data:', {
        id: savedTemplate?.id,
        sectionsCount: savedTemplate?.sections?.length,
        firstSectionFields: savedTemplate?.sections[0]?.fields?.length,
        firstFieldRequired: savedTemplate?.sections[0]?.fields[0]?.required
      });
    }
    
    console.log('💾 Template saved successfully:', template.id);
  } catch (error) {
    console.error('Error saving template to localStorage:', error);
    throw error;
  }
}

// Reset a template to default
export function resetTemplate(templateId: string): void {
  try {
    const templates = getAllTemplates();
    const defaultTemplate = defaultTemplates[templateId];
    
    if (defaultTemplate) {
      templates[templateId] = { ...defaultTemplate };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  } catch (error) {
    console.error('Error resetting template:', error);
    throw error;
  }
}

// Reset all templates to defaults
export function resetAllTemplates(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
  } catch (error) {
    console.error('Error resetting all templates:', error);
    throw error;
  }
}

// Export list of available template IDs
export function getTemplateIds(): string[] {
  return Object.keys(getAllTemplates());
}