import { FormTemplate } from './FormTemplateEditor';

export function getDefaultTemplate(formId: string, formTitle?: string): FormTemplate {
  const templates: Record<string, FormTemplate> = {
    'pre-consult-general': {
      id: formId,
      title: 'General Pre-Consultation Form',
      description: 'Thank you for your interest in Empower Health Strategies. The questions below help me understand your context and goals so our consultation can be as focused and useful as possible. This should take just a few minutes to complete.',
      sections: [
        {
          id: 'contact_info',
          title: 'Contact Information',
          fields: [
            {
              id: 'contactName',
              type: 'text',
              name: 'contactName',
              label: 'Your Name *',
              placeholder: 'Enter your full name',
              required: true
            },
            {
              id: 'contactEmail',
              type: 'email',
              name: 'contactEmail',
              label: 'Email Address *',
              placeholder: 'your.email@example.com',
              required: true
            },
            {
              id: 'organizationName',
              type: 'text',
              name: 'organizationName',
              label: 'Organization Name *',
              placeholder: 'Your organization',
              required: true
            },
            {
              id: 'organizationDescription',
              type: 'textarea',
              name: 'organizationDescription',
              label: 'Brief Organization Description *',
              placeholder: 'Tell us about your organization...',
              required: true,
              rows: 4
            },
            {
              id: 'organizationLinks',
              type: 'text',
              name: 'organizationLinks',
              label: 'Organization Website/Links',
              placeholder: 'https://yourwebsite.com',
              required: false
            }
          ]
        },
        {
          id: 'goals_context',
          title: 'Your Goals and Context',
          fields: [
            {
              id: 'whatBringsYou',
              type: 'textarea',
              name: 'whatBringsYou',
              label: 'What brings you to Empower Health Strategies? *',
              placeholder: 'What challenges or opportunities are you facing?',
              required: true,
              rows: 5
            },
            {
              id: 'successLooksLike',
              type: 'textarea',
              name: 'successLooksLike',
              label: 'What would success look like for you? *',
              placeholder: 'Describe your ideal outcome...',
              required: true,
              rows: 5
            },
            {
              id: 'alreadyTried',
              type: 'textarea',
              name: 'alreadyTried',
              label: 'What have you already tried to address this?',
              placeholder: 'Any previous approaches or solutions...',
              required: false,
              rows: 4
            },
            {
              id: 'keyStakeholders',
              type: 'text',
              name: 'keyStakeholders',
              label: 'Who are the key stakeholders involved?',
              placeholder: 'e.g., Executive team, HR, specific departments...',
              required: false
            }
          ]
        },
        {
          id: 'project_details',
          title: 'Project Details',
          fields: [
            {
              id: 'timeline',
              type: 'text',
              name: 'timeline',
              label: 'Timeline/Urgency',
              placeholder: 'e.g., Q1 2024, ASAP, Flexible...',
              required: false
            },
            {
              id: 'budget',
              type: 'select',
              name: 'budget',
              label: 'Approximate Budget Range',
              placeholder: 'Select a budget range',
              required: false,
              options: ['$750-1,500', '$1,500-5,000', '$5,000+']
            },
            {
              id: 'howDidYouHear',
              type: 'select',
              name: 'howDidYouHear',
              label: 'How did you hear about us?',
              placeholder: 'Select an option',
              required: false,
              options: ['Website', 'Google', 'LinkedIn', 'Referral', 'Other']
            }
          ]
        }
      ]
    },
    'pre-consult-audit': {
      id: formId,
      title: 'Innovation Audit Pre-Consultation',
      description: 'Thank you for your interest in the Innovation Health Audit. This questionnaire helps me understand your organization\'s current innovation capabilities and aspirations so we can make the most of our consultation.',
      sections: [
        {
          id: 'contact_info',
          title: 'Contact Information',
          fields: [
            {
              id: 'contactName',
              type: 'text',
              name: 'contactName',
              label: 'Your Name *',
              placeholder: 'Enter your full name',
              required: true
            },
            {
              id: 'contactEmail',
              type: 'email',
              name: 'contactEmail',
              label: 'Email Address *',
              placeholder: 'your.email@example.com',
              required: true
            },
            {
              id: 'organizationName',
              type: 'text',
              name: 'organizationName',
              label: 'Organization Name *',
              placeholder: 'Your organization',
              required: true
            }
          ]
        },
        {
          id: 'innovation_context',
          title: 'Innovation Context',
          fields: [
            {
              id: 'auditInterest',
              type: 'textarea',
              name: 'auditInterest',
              label: 'What sparked your interest in an innovation audit? *',
              placeholder: 'Share what brought you here...',
              required: true,
              rows: 5
            },
            {
              id: 'innovationChallenges',
              type: 'textarea',
              name: 'innovationChallenges',
              label: 'What innovation challenges are you currently facing? *',
              placeholder: 'Describe your challenges...',
              required: true,
              rows: 5
            },
            {
              id: 'currentInnovationApproach',
              type: 'textarea',
              name: 'currentInnovationApproach',
              label: 'Describe your organization\'s current approach to innovation',
              placeholder: 'How does innovation happen in your organization?',
              required: false,
              rows: 4
            },
            {
              id: 'auditGoals',
              type: 'textarea',
              name: 'auditGoals',
              label: 'What would you like to learn from the audit?',
              placeholder: 'What insights are you hoping to gain?',
              required: false,
              rows: 4
            }
          ]
        }
      ]
    },
    'pre-consult-workshop': {
      id: formId,
      title: 'Workshop Pre-Consultation',
      description: 'Thank you for your interest in training and workshop services. These questions help me design a learning experience that meets your team\'s specific needs and goals.',
      sections: [
        {
          id: 'contact_info',
          title: 'Contact Information',
          fields: [
            {
              id: 'contactName',
              type: 'text',
              name: 'contactName',
              label: 'Your Name *',
              placeholder: 'Enter your full name',
              required: true
            },
            {
              id: 'contactEmail',
              type: 'email',
              name: 'contactEmail',
              label: 'Email Address *',
              placeholder: 'your.email@example.com',
              required: true
            },
            {
              id: 'organizationName',
              type: 'text',
              name: 'organizationName',
              label: 'Organization Name *',
              placeholder: 'Your organization',
              required: true
            }
          ]
        },
        {
          id: 'training_needs',
          title: 'Training Needs',
          fields: [
            {
              id: 'trainingTopics',
              type: 'textarea',
              name: 'trainingTopics',
              label: 'What training topic(s) are you interested in? *',
              placeholder: 'Describe the topics you\'d like covered...',
              required: true,
              rows: 4
            },
            {
              id: 'trainingAudience',
              type: 'text',
              name: 'trainingAudience',
              label: 'Who will be attending? (roles, number of participants) *',
              placeholder: 'e.g., 20 managers, executive team of 8...',
              required: true
            },
            {
              id: 'trainingChallenges',
              type: 'textarea',
              name: 'trainingChallenges',
              label: 'What challenges or skill gaps are you trying to address?',
              placeholder: 'What specific problems are you hoping to solve?',
              required: false,
              rows: 5
            },
            {
              id: 'trainingFormat',
              type: 'text',
              name: 'trainingFormat',
              label: 'Preferred format and duration',
              placeholder: 'e.g., Half-day workshop, 2-day retreat, virtual series...',
              required: false
            }
          ]
        }
      ]
    },
    'feedback-testimonial': {
      id: formId,
      title: 'Feedback & Testimonial Form',
      description: 'Thank you for taking the time to share your feedback! Your insights help me continuously improve and serve future clients better. Your testimonial may also be used (with your permission) to help others understand the value of our work together.',
      sections: [
        {
          id: 'your_info',
          title: 'Your Information',
          fields: [
            {
              id: 'contactName',
              type: 'text',
              name: 'contactName',
              label: 'Your Name *',
              placeholder: 'Enter your full name',
              required: true
            },
            {
              id: 'role',
              type: 'text',
              name: 'role',
              label: 'Your Title/Role',
              placeholder: 'Your job title',
              required: false
            },
            {
              id: 'organization',
              type: 'text',
              name: 'organization',
              label: 'Organization',
              placeholder: 'Your organization',
              required: false
            }
          ]
        },
        {
          id: 'feedback',
          title: 'Your Feedback',
          fields: [
            {
              id: 'experience',
              type: 'textarea',
              name: 'experience',
              label: 'What was your experience working with Empower Health Strategies? *',
              placeholder: 'Share your overall experience...',
              required: true,
              rows: 6
            },
            {
              id: 'results',
              type: 'textarea',
              name: 'results',
              label: 'What specific results or outcomes did you achieve? *',
              placeholder: 'What changed or improved?',
              required: true,
              rows: 5
            },
            {
              id: 'recommendation',
              type: 'textarea',
              name: 'recommendation',
              label: 'Would you recommend Empower Health Strategies to others? Why?',
              placeholder: 'Share your thoughts...',
              required: false,
              rows: 5
            },
            {
              id: 'suggestions',
              type: 'textarea',
              name: 'suggestions',
              label: 'Any suggestions for improvement?',
              placeholder: 'How could we do better?',
              required: false,
              rows: 4
            },
            {
              id: 'allowTestimonial',
              type: 'checkbox',
              name: 'allowTestimonial',
              label: 'I give permission for Empower Health Strategies to use my feedback as a testimonial on their website and marketing materials.',
              required: false
            }
          ]
        }
      ]
    },
    'scope-of-work': {
      id: formId,
      title: 'Scope of Work',
      description: 'This document outlines the proposed engagement, deliverables, timeline, and investment for our work together.',
      sections: [
        {
          id: 'project_overview',
          title: 'Project Overview',
          fields: [
            {
              id: 'projectTitle',
              type: 'text',
              name: 'projectTitle',
              label: 'Project Title *',
              placeholder: 'Enter project name',
              required: true
            },
            {
              id: 'clientName',
              type: 'text',
              name: 'clientName',
              label: 'Client Name *',
              placeholder: 'Organization name',
              required: true
            },
            {
              id: 'projectDescription',
              type: 'textarea',
              name: 'projectDescription',
              label: 'Project Description *',
              placeholder: 'Describe the engagement...',
              required: true,
              rows: 5
            }
          ]
        },
        {
          id: 'deliverables',
          title: 'Deliverables & Timeline',
          fields: [
            {
              id: 'deliverables',
              type: 'textarea',
              name: 'deliverables',
              label: 'Key Deliverables *',
              placeholder: 'List what will be delivered...',
              required: true,
              rows: 6
            },
            {
              id: 'timeline',
              type: 'text',
              name: 'timeline',
              label: 'Timeline *',
              placeholder: 'e.g., 6-8 weeks, Q1 2024',
              required: true
            },
            {
              id: 'milestones',
              type: 'textarea',
              name: 'milestones',
              label: 'Key Milestones',
              placeholder: 'Major project phases or checkpoints...',
              required: false,
              rows: 4
            }
          ]
        },
        {
          id: 'investment',
          title: 'Investment',
          fields: [
            {
              id: 'totalInvestment',
              type: 'text',
              name: 'totalInvestment',
              label: 'Total Investment *',
              placeholder: 'e.g., $5,000',
              required: true
            },
            {
              id: 'paymentTerms',
              type: 'textarea',
              name: 'paymentTerms',
              label: 'Payment Terms *',
              placeholder: 'Describe payment schedule...',
              required: true,
              rows: 3
            }
          ]
        }
      ]
    },
    'invoice': {
      id: formId,
      title: 'Invoice',
      description: 'Professional invoice for services rendered.',
      sections: [
        {
          id: 'invoice_details',
          title: 'Invoice Information',
          fields: [
            {
              id: 'invoiceNumber',
              type: 'text',
              name: 'invoiceNumber',
              label: 'Invoice Number *',
              placeholder: 'INV-001',
              required: true
            },
            {
              id: 'invoiceDate',
              type: 'text',
              name: 'invoiceDate',
              label: 'Invoice Date *',
              placeholder: 'MM/DD/YYYY',
              required: true
            },
            {
              id: 'dueDate',
              type: 'text',
              name: 'dueDate',
              label: 'Due Date *',
              placeholder: 'MM/DD/YYYY',
              required: true
            }
          ]
        },
        {
          id: 'client_info',
          title: 'Bill To',
          fields: [
            {
              id: 'clientName',
              type: 'text',
              name: 'clientName',
              label: 'Client Name *',
              placeholder: 'Client or organization name',
              required: true
            },
            {
              id: 'clientAddress',
              type: 'textarea',
              name: 'clientAddress',
              label: 'Client Address',
              placeholder: 'Street address, city, state, ZIP',
              required: false,
              rows: 3
            },
            {
              id: 'clientEmail',
              type: 'email',
              name: 'clientEmail',
              label: 'Client Email',
              placeholder: 'client@email.com',
              required: false
            }
          ]
        },
        {
          id: 'line_items',
          title: 'Services',
          fields: [
            {
              id: 'serviceDescription',
              type: 'textarea',
              name: 'serviceDescription',
              label: 'Service Description *',
              placeholder: 'Describe services provided...',
              required: true,
              rows: 4
            },
            {
              id: 'amount',
              type: 'text',
              name: 'amount',
              label: 'Amount *',
              placeholder: '$0.00',
              required: true
            },
            {
              id: 'paymentInstructions',
              type: 'textarea',
              name: 'paymentInstructions',
              label: 'Payment Instructions',
              placeholder: 'Payment methods and instructions...',
              required: false,
              rows: 3
            }
          ]
        }
      ]
    },
    'services-brochure': {
      id: formId,
      title: 'Services Brochure',
      description: 'Showcase your service offerings with detailed descriptions and investment information.',
      sections: [
        {
          id: 'service_overview',
          title: 'Service Overview',
          fields: [
            {
              id: 'serviceName',
              type: 'text',
              name: 'serviceName',
              label: 'Service Name *',
              placeholder: 'Name of service offering',
              required: true
            },
            {
              id: 'serviceTagline',
              type: 'text',
              name: 'serviceTagline',
              label: 'Tagline',
              placeholder: 'Brief tagline or subtitle',
              required: false
            },
            {
              id: 'serviceDescription',
              type: 'textarea',
              name: 'serviceDescription',
              label: 'Service Description *',
              placeholder: 'Detailed description of the service...',
              required: true,
              rows: 6
            }
          ]
        },
        {
          id: 'what_included',
          title: 'What\'s Included',
          fields: [
            {
              id: 'inclusions',
              type: 'textarea',
              name: 'inclusions',
              label: 'What\'s Included *',
              placeholder: 'List everything included in this service...',
              required: true,
              rows: 8
            },
            {
              id: 'duration',
              type: 'text',
              name: 'duration',
              label: 'Duration/Timeline',
              placeholder: 'e.g., 4-6 weeks, 3-month engagement',
              required: false
            }
          ]
        },
        {
          id: 'investment_info',
          title: 'Investment',
          fields: [
            {
              id: 'pricing',
              type: 'text',
              name: 'pricing',
              label: 'Investment *',
              placeholder: 'e.g., Starting at $3,000',
              required: true
            },
            {
              id: 'pricingDetails',
              type: 'textarea',
              name: 'pricingDetails',
              label: 'Pricing Details',
              placeholder: 'Additional pricing information or options...',
              required: false,
              rows: 3
            }
          ]
        }
      ]
    },
    'licensing': {
      id: formId,
      title: 'Licensing Agreement',
      description: 'Define licensing terms and intellectual property usage rights.',
      sections: [
        {
          id: 'license_details',
          title: 'License Information',
          fields: [
            {
              id: 'licenseeName',
              type: 'text',
              name: 'licenseeName',
              label: 'Licensee Name *',
              placeholder: 'Organization receiving license',
              required: true
            },
            {
              id: 'licenseType',
              type: 'select',
              name: 'licenseType',
              label: 'License Type *',
              placeholder: 'Select license type',
              required: true,
              options: ['Single-User', 'Team License', 'Organization-Wide', 'Custom']
            },
            {
              id: 'licensedMaterial',
              type: 'textarea',
              name: 'licensedMaterial',
              label: 'Licensed Material *',
              placeholder: 'Describe what is being licensed...',
              required: true,
              rows: 4
            }
          ]
        },
        {
          id: 'terms_usage',
          title: 'Terms & Usage Rights',
          fields: [
            {
              id: 'usageRights',
              type: 'textarea',
              name: 'usageRights',
              label: 'Permitted Usage *',
              placeholder: 'Define how the material may be used...',
              required: true,
              rows: 6
            },
            {
              id: 'restrictions',
              type: 'textarea',
              name: 'restrictions',
              label: 'Restrictions',
              placeholder: 'What is not permitted...',
              required: false,
              rows: 4
            },
            {
              id: 'licenseDuration',
              type: 'text',
              name: 'licenseDuration',
              label: 'License Duration *',
              placeholder: 'e.g., 1 year, Perpetual, 3 years',
              required: true
            },
            {
              id: 'licenseFee',
              type: 'text',
              name: 'licenseFee',
              label: 'License Fee *',
              placeholder: '$0.00',
              required: true
            }
          ]
        }
      ]
    },
    'payment-params': {
      id: formId,
      title: 'Payment Parameters',
      description: 'Establish payment schedules, milestones, and terms for your engagement.',
      sections: [
        {
          id: 'payment_overview',
          title: 'Payment Overview',
          fields: [
            {
              id: 'clientName',
              type: 'text',
              name: 'clientName',
              label: 'Client Name *',
              placeholder: 'Organization name',
              required: true
            },
            {
              id: 'projectName',
              type: 'text',
              name: 'projectName',
              label: 'Project/Engagement Name *',
              placeholder: 'Name of project',
              required: true
            },
            {
              id: 'totalInvestment',
              type: 'text',
              name: 'totalInvestment',
              label: 'Total Investment *',
              placeholder: '$0.00',
              required: true
            }
          ]
        },
        {
          id: 'payment_schedule',
          title: 'Payment Schedule',
          fields: [
            {
              id: 'paymentStructure',
              type: 'select',
              name: 'paymentStructure',
              label: 'Payment Structure *',
              placeholder: 'Select structure',
              required: true,
              options: ['50/50 (Start/End)', '3 Installments', 'Monthly', 'Milestone-Based', 'Custom']
            },
            {
              id: 'paymentSchedule',
              type: 'textarea',
              name: 'paymentSchedule',
              label: 'Payment Schedule Details *',
              placeholder: 'Describe when payments are due...',
              required: true,
              rows: 6
            },
            {
              id: 'paymentMethod',
              type: 'select',
              name: 'paymentMethod',
              label: 'Accepted Payment Methods',
              placeholder: 'Select method',
              required: false,
              options: ['Stripe/Credit Card', 'ACH/Bank Transfer', 'Check', 'Wire Transfer', 'Multiple Methods']
            }
          ]
        },
        {
          id: 'additional_terms',
          title: 'Additional Terms',
          fields: [
            {
              id: 'lateFeePolicy',
              type: 'textarea',
              name: 'lateFeePolicy',
              label: 'Late Payment Policy',
              placeholder: 'Late fees, grace period, etc...',
              required: false,
              rows: 3
            },
            {
              id: 'refundPolicy',
              type: 'textarea',
              name: 'refundPolicy',
              label: 'Refund/Cancellation Policy',
              placeholder: 'Terms for refunds or cancellations...',
              required: false,
              rows: 3
            }
          ]
        }
      ]
    },
    'workshop-curriculum': {
      id: formId,
      title: 'Training Curriculum',
      description: 'Design structured learning experiences and training programs for your team.',
      sections: [
        {
          id: 'workshop_overview',
          title: 'Workshop Overview',
          fields: [
            {
              id: 'workshopTitle',
              type: 'text',
              name: 'workshopTitle',
              label: 'Workshop Title *',
              placeholder: 'Name of the training',
              required: true
            },
            {
              id: 'targetAudience',
              type: 'text',
              name: 'targetAudience',
              label: 'Target Audience *',
              placeholder: 'Who is this for?',
              required: true
            },
            {
              id: 'workshopDescription',
              type: 'textarea',
              name: 'workshopDescription',
              label: 'Workshop Description *',
              placeholder: 'Overview of the training program...',
              required: true,
              rows: 5
            },
            {
              id: 'duration',
              type: 'text',
              name: 'duration',
              label: 'Duration *',
              placeholder: 'e.g., Half-day, 2 days, 4-week series',
              required: true
            }
          ]
        },
        {
          id: 'learning_objectives',
          title: 'Learning Objectives',
          fields: [
            {
              id: 'objectives',
              type: 'textarea',
              name: 'objectives',
              label: 'Learning Objectives *',
              placeholder: 'What will participants learn and be able to do?',
              required: true,
              rows: 6
            },
            {
              id: 'outcomes',
              type: 'textarea',
              name: 'outcomes',
              label: 'Expected Outcomes',
              placeholder: 'What changes or improvements should result?',
              required: false,
              rows: 4
            }
          ]
        },
        {
          id: 'curriculum_details',
          title: 'Curriculum Content',
          fields: [
            {
              id: 'modules',
              type: 'textarea',
              name: 'modules',
              label: 'Modules/Sessions *',
              placeholder: 'List modules, topics, and activities...',
              required: true,
              rows: 8
            },
            {
              id: 'materials',
              type: 'textarea',
              name: 'materials',
              label: 'Materials Provided',
              placeholder: 'Workbooks, templates, resources included...',
              required: false,
              rows: 4
            },
            {
              id: 'investment',
              type: 'text',
              name: 'investment',
              label: 'Investment',
              placeholder: '$0.00',
              required: false
            }
          ]
        }
      ]
    },
    'innovation-audit': {
      id: formId,
      title: 'Innovation Audit Template',
      description: 'Comprehensive assessment of organizational innovation capabilities and opportunities.',
      sections: [
        {
          id: 'audit_overview',
          title: 'Audit Overview',
          fields: [
            {
              id: 'organizationName',
              type: 'text',
              name: 'organizationName',
              label: 'Organization Name *',
              placeholder: 'Client organization',
              required: true
            },
            {
              id: 'auditDate',
              type: 'text',
              name: 'auditDate',
              label: 'Audit Date *',
              placeholder: 'MM/DD/YYYY',
              required: true
            },
            {
              id: 'auditScope',
              type: 'textarea',
              name: 'auditScope',
              label: 'Audit Scope *',
              placeholder: 'What areas will be evaluated?',
              required: true,
              rows: 4
            }
          ]
        },
        {
          id: 'assessment_areas',
          title: 'Assessment Areas',
          fields: [
            {
              id: 'innovationStrategy',
              type: 'textarea',
              name: 'innovationStrategy',
              label: 'Innovation Strategy Assessment',
              placeholder: 'Evaluate strategic approach to innovation...',
              required: false,
              rows: 5
            },
            {
              id: 'innovationCulture',
              type: 'textarea',
              name: 'innovationCulture',
              label: 'Innovation Culture Assessment',
              placeholder: 'Assess cultural factors and mindsets...',
              required: false,
              rows: 5
            },
            {
              id: 'innovationProcesses',
              type: 'textarea',
              name: 'innovationProcesses',
              label: 'Innovation Processes Assessment',
              placeholder: 'Review systems and processes for innovation...',
              required: false,
              rows: 5
            },
            {
              id: 'innovationCapabilities',
              type: 'textarea',
              name: 'innovationCapabilities',
              label: 'Capabilities & Resources',
              placeholder: 'Evaluate team capabilities and resources...',
              required: false,
              rows: 5
            }
          ]
        },
        {
          id: 'recommendations',
          title: 'Findings & Recommendations',
          fields: [
            {
              id: 'keyFindings',
              type: 'textarea',
              name: 'keyFindings',
              label: 'Key Findings',
              placeholder: 'Summarize major findings...',
              required: false,
              rows: 6
            },
            {
              id: 'recommendations',
              type: 'textarea',
              name: 'recommendations',
              label: 'Recommendations',
              placeholder: 'Strategic recommendations and next steps...',
              required: false,
              rows: 6
            }
          ]
        }
      ]
    },
    'scheduling': {
      id: formId,
      title: 'Scheduling Page',
      description: 'Create a scheduling page with Google Calendar links for consultations and calls.',
      sections: [
        {
          id: 'scheduling_info',
          title: 'Scheduling Information',
          fields: [
            {
              id: 'meetingType',
              type: 'select',
              name: 'meetingType',
              label: 'Meeting Type *',
              placeholder: 'Select meeting type',
              required: true,
              options: ['Initial Consultation', 'Follow-Up Call', 'Strategy Session', 'Workshop Planning', 'Custom']
            },
            {
              id: 'meetingTitle',
              type: 'text',
              name: 'meetingTitle',
              label: 'Meeting Title *',
              placeholder: 'Name of the meeting',
              required: true
            },
            {
              id: 'meetingDescription',
              type: 'textarea',
              name: 'meetingDescription',
              label: 'Meeting Description *',
              placeholder: 'What will be discussed?',
              required: true,
              rows: 4
            },
            {
              id: 'duration',
              type: 'select',
              name: 'duration',
              label: 'Duration *',
              placeholder: 'Select duration',
              required: true,
              options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes']
            }
          ]
        },
        {
          id: 'calendar_links',
          title: 'Calendar Links',
          fields: [
            {
              id: 'calendarLink',
              type: 'text',
              name: 'calendarLink',
              label: 'Google Calendar Scheduling Link *',
              placeholder: 'https://calendar.google.com/...',
              required: true
            },
            {
              id: 'timezone',
              type: 'select',
              name: 'timezone',
              label: 'Timezone',
              placeholder: 'Select timezone',
              required: false,
              options: ['Eastern Time', 'Central Time', 'Mountain Time', 'Pacific Time', 'Other']
            },
            {
              id: 'availability',
              type: 'textarea',
              name: 'availability',
              label: 'Availability Notes',
              placeholder: 'Additional scheduling information...',
              required: false,
              rows: 3
            }
          ]
        },
        {
          id: 'preparation',
          title: 'Meeting Preparation',
          fields: [
            {
              id: 'preparationInstructions',
              type: 'textarea',
              name: 'preparationInstructions',
              label: 'Preparation Instructions',
              placeholder: 'What should attendees prepare before the meeting?',
              required: false,
              rows: 4
            }
          ]
        }
      ]
    }
  };

  return templates[formId] || {
    id: formId,
    title: formTitle || 'Untitled Form',
    description: '',
    sections: []
  };
}