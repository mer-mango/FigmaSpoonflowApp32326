/**
 * Journey Timeline Configuration v1.0-lean
 * Source of truth for journey stations, status catalog, and derivation rules
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum Phase {
  PROSPECT = 'PROSPECT',
  CLIENT = 'CLIENT',
}

export enum WhoseMove {
  AWAITING_CLIENT = 'AWAITING_CLIENT',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}

export enum JourneyType {
  PROSPECT = 'PROSPECT',
  CLIENT = 'CLIENT',
  AUDIT_CLIENT = 'AUDIT_CLIENT',
  WORKSHOP_CLIENT = 'WORKSHOP_CLIENT',
}

// ============================================================================
// JOURNEY STATIONS
// ============================================================================

export interface JourneyStation {
  id: string;
  order: number;
  label: string;
}

export interface Journey {
  id: string;
  label: string;
  stations: JourneyStation[];
}

export const JOURNEYS: Record<string, Journey> = {
  PROSPECT: {
    id: 'PROSPECT',
    label: 'Prospect Journey',
    stations: [
      { id: 'P1', order: 1, label: 'New Inquiry' },
      { id: 'P2', order: 2, label: 'Discovery Sent' },
      { id: 'P3', order: 3, label: 'Intake Completed' },
      { id: 'P4', order: 4, label: 'Consultation Scheduled' },
      { id: 'P5', order: 5, label: 'Consultation Held' },
      { id: 'P6', order: 6, label: 'SOW Sent' },
      { id: 'P7', order: 7, label: 'Decision Pending' },
      { id: 'P8', order: 8, label: 'Converted to Client' },
      { id: 'P9', order: 9, label: 'Closed / Not a Fit' },
    ],
  },
  CLIENT_BASE: {
    id: 'CLIENT_BASE',
    label: 'Client Journey',
    stations: [
      { id: 'C1', order: 1, label: 'Client Onboarded' },
      { id: 'C2', order: 2, label: 'Engagement Drafted' },
      { id: 'C3', order: 3, label: 'Engagement Sent' },
      { id: 'C4', order: 4, label: 'Client Inputs In Progress' },
      { id: 'C5', order: 5, label: 'Awaiting Review' },
      { id: 'C6', order: 6, label: 'Payment Complete' },
      { id: 'C7', order: 7, label: 'Delivering Work' },
      { id: 'C8', order: 8, label: 'Delivered Work' },
      { id: 'C9', order: 9, label: 'Engagement Closed' },
    ],
  },
};

// ============================================================================
// STATUS CATALOG
// ============================================================================

export interface StatusDefinition {
  id: string;
  phase: Phase;
  action: string;
  whoseMove: WhoseMove;
  mapsTo: {
    journeyType: JourneyType;
    stationId: string;
  };
}

export const STATUS_CATALOG: StatusDefinition[] = [
  // Prospect Statuses
  { id: 'S_PROSPECT_NEW_INQUIRY', phase: Phase.PROSPECT, action: 'New Inquiry', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P1' } },
  { id: 'S_PROSPECT_SENT_DISCOVERY', phase: Phase.PROSPECT, action: 'Sent Discovery', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P2' } },
  { id: 'S_PROSPECT_SENT_INTAKE', phase: Phase.PROSPECT, action: 'Sent Intake', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P2' } },
  { id: 'S_PROSPECT_FORMS_COMPLETED', phase: Phase.PROSPECT, action: 'Forms Completed', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P3' } },
  { id: 'S_PROSPECT_SENT_CONSULT_LINK', phase: Phase.PROSPECT, action: 'Sent Consultation Link', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P4' } },
  { id: 'S_PROSPECT_CONSULT_BOOKED', phase: Phase.PROSPECT, action: 'Consultation Booked', whoseMove: WhoseMove.IN_PROGRESS, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P4' } },
  { id: 'S_PROSPECT_CONSULT_HELD', phase: Phase.PROSPECT, action: 'Consultation Held', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P5' } },
  { id: 'S_PROSPECT_SENT_SOW', phase: Phase.PROSPECT, action: 'Sent SOW', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P6' } },
  { id: 'S_PROSPECT_DECISION_PENDING', phase: Phase.PROSPECT, action: 'Decision Pending', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P7' } },
  { id: 'S_CLIENT_CONVERTED', phase: Phase.CLIENT, action: 'Converted', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P8' } },
  { id: 'S_PROSPECT_CLOSED_NOT_FIT', phase: Phase.PROSPECT, action: 'Closed / Not a Fit', whoseMove: WhoseMove.COMPLETE, mapsTo: { journeyType: JourneyType.PROSPECT, stationId: 'P9' } },

  // Client Statuses (Base)
  { id: 'S_CLIENT_ONBOARDED', phase: Phase.CLIENT, action: 'Onboarded', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C1' } },
  { id: 'S_CLIENT_ENGAGEMENT_DRAFTED', phase: Phase.CLIENT, action: 'Engagement Drafted', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C2' } },
  { id: 'S_CLIENT_SENT_ENGAGEMENT_FLOW', phase: Phase.CLIENT, action: 'Sent Engagement Flow', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C3' } },
  { id: 'S_CLIENT_FORMS_PENDING', phase: Phase.CLIENT, action: 'Forms Pending', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C4' } },
  { id: 'S_CLIENT_FORMS_COMPLETED', phase: Phase.CLIENT, action: 'Forms Completed', whoseMove: WhoseMove.ACTION_REQUIRED, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C5' } },
  { id: 'S_CLIENT_SENT_INVOICE', phase: Phase.CLIENT, action: 'Sent Invoice', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C5' } },
  { id: 'S_CLIENT_PAYMENT_RECEIVED', phase: Phase.CLIENT, action: 'Payment Received', whoseMove: WhoseMove.IN_PROGRESS, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C6' } },
  { id: 'S_CLIENT_DELIVERING_WORK', phase: Phase.CLIENT, action: 'Delivering Work', whoseMove: WhoseMove.IN_PROGRESS, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C7' } },
  { id: 'S_CLIENT_DELIVERED', phase: Phase.CLIENT, action: 'Delivered Work', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C8' } },
  { id: 'S_CLIENT_ENGAGEMENT_COMPLETE', phase: Phase.CLIENT, action: 'Engagement Complete', whoseMove: WhoseMove.COMPLETE, mapsTo: { journeyType: JourneyType.CLIENT, stationId: 'C9' } },

  // Audit Client Specific
  { id: 'S_AUDIT_DELIVERING_AUDIT', phase: Phase.CLIENT, action: 'Delivering Audit', whoseMove: WhoseMove.IN_PROGRESS, mapsTo: { journeyType: JourneyType.AUDIT_CLIENT, stationId: 'C7' } },
  { id: 'S_AUDIT_AUDIT_DELIVERED', phase: Phase.CLIENT, action: 'Audit Delivered', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.AUDIT_CLIENT, stationId: 'C8' } },

  // Workshop Client Specific
  { id: 'S_WORKSHOP_SCHEDULED', phase: Phase.CLIENT, action: 'Workshop Scheduled', whoseMove: WhoseMove.IN_PROGRESS, mapsTo: { journeyType: JourneyType.WORKSHOP_CLIENT, stationId: 'C7' } },
  { id: 'S_WORKSHOP_DELIVERED', phase: Phase.CLIENT, action: 'Workshop Delivered', whoseMove: WhoseMove.AWAITING_CLIENT, mapsTo: { journeyType: JourneyType.WORKSHOP_CLIENT, stationId: 'C8' } },
];

// Create lookup map for fast access
export const STATUS_BY_ID = new Map<string, StatusDefinition>(
  STATUS_CATALOG.map((status) => [status.id, status])
);

// ============================================================================
// DERIVATION RULES (documented)
// ============================================================================

/**
 * Station Derivation Rules:
 * 
 * 1. deriveCurrentStation:
 *    - Use the most recent status event
 *    - Resolve mapsTo.journeyType by contact.journeyType
 *    - Fallback to CLIENT_BASE for CLIENT
 * 
 * 2. deriveCompletedStations:
 *    - All stations in the active journey with order < currentStation.order are completed
 * 
 * 3. deriveUpcomingStations:
 *    - All stations in the active journey with order > currentStation.order are upcoming
 */
