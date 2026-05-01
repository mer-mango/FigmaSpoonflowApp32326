// This utility calculates section numbers based on which sections are enabled

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

type SectionKey = keyof SectionToggles;

const sectionOrder: SectionKey[] = [
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

export function getSectionNumber(
  sectionKey: SectionKey,
  enabledSections: SectionToggles
): number {
  let count = 0;
  for (const key of sectionOrder) {
    if (enabledSections[key]) {
      count++;
    }
    if (key === sectionKey) {
      return count;
    }
  }
  return count;
}

export type { SectionToggles, SectionKey };
