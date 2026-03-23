/**
 * Journey Engine - Derives journey state from status events
 * Implements the station derivation rules from journey_config.ts
 */

import {
  JourneyType,
  WhoseMove,
  Phase,
  JOURNEYS,
  JourneyStation,
  Journey,
  STATUS_BY_ID,
  StatusDefinition,
} from './journey_config';

// ============================================================================
// TYPES
// ============================================================================

export interface StatusEvent {
  statusId: string;
  timestamp: Date;
  note?: string;
}

export interface ContactJourneyData {
  journeyType: JourneyType;
  statusEvents: StatusEvent[];
}

export interface DerivedJourneyState {
  journey: Journey;
  currentStation: JourneyStation;
  currentStationIndex: number;
  completedStations: JourneyStation[];
  upcomingStations: JourneyStation[];
  whoseMove: WhoseMove;
  currentStatus: StatusDefinition | null;
  lastUpdate: Date | null;
  formattedStatus: string;
}

// ============================================================================
// CORE DERIVATION FUNCTIONS
// ============================================================================

/**
 * Gets the journey definition for a given journey type
 * CLIENT, AUDIT_CLIENT, and WORKSHOP_CLIENT all use CLIENT_BASE stations
 */
function getJourneyForType(journeyType: JourneyType): Journey {
  if (journeyType === JourneyType.PROSPECT) {
    return JOURNEYS.PROSPECT;
  }
  // All client types use CLIENT_BASE
  return JOURNEYS.CLIENT_BASE;
}

/**
 * Derives the current journey state from contact data and status events
 * Implements all three derivation rules from the config
 */
export function deriveJourneyState(contactData: ContactJourneyData): DerivedJourneyState {
  const journey = getJourneyForType(contactData.journeyType);
  
  // Rule 1: Derive current station from most recent status event
  const mostRecentEvent = contactData.statusEvents.length > 0
    ? contactData.statusEvents[contactData.statusEvents.length - 1]
    : null;

  let currentStatus: StatusDefinition | null = null;
  let currentStation: JourneyStation;
  let whoseMove: WhoseMove = WhoseMove.ACTION_REQUIRED;
  let lastUpdate: Date | null = null;

  if (mostRecentEvent) {
    currentStatus = STATUS_BY_ID.get(mostRecentEvent.statusId) || null;
    // Ensure timestamp is a Date object (handles both Date objects and string timestamps from localStorage)
    lastUpdate = mostRecentEvent.timestamp instanceof Date 
      ? mostRecentEvent.timestamp 
      : new Date(mostRecentEvent.timestamp);

    if (currentStatus) {
      // Resolve station by matching journeyType
      const targetStationId = currentStatus.mapsTo.stationId;
      const foundStation = journey.stations.find((s) => s.id === targetStationId);
      
      if (foundStation) {
        currentStation = foundStation;
      } else {
        // Fallback to first station if mapping fails
        currentStation = journey.stations[0];
      }

      whoseMove = currentStatus.whoseMove;
    } else {
      // Unknown status ID - default to first station
      currentStation = journey.stations[0];
    }
  } else {
    // No status events - default to first station
    currentStation = journey.stations[0];
  }

  const currentStationIndex = journey.stations.findIndex((s) => s.id === currentStation.id);

  // Rule 2: Derive completed stations
  const completedStations = journey.stations.filter(
    (station) => station.order < currentStation.order
  );

  // Rule 3: Derive upcoming stations
  const upcomingStations = journey.stations.filter(
    (station) => station.order > currentStation.order
  );

  // Format status string: "[Phase] - [Action] - [Whose Move]"
  const formattedStatus = currentStatus
    ? `${currentStatus.phase} - ${currentStatus.action} - ${formatWhoseMove(whoseMove)}`
    : `${contactData.journeyType} - At ${currentStation.label}`;

  return {
    journey,
    currentStation,
    currentStationIndex,
    completedStations,
    upcomingStations,
    whoseMove,
    currentStatus,
    lastUpdate,
    formattedStatus,
  };
}

/**
 * Converts WhoseMove enum to display string
 */
function formatWhoseMove(whoseMove: WhoseMove): string {
  switch (whoseMove) {
    case WhoseMove.AWAITING_CLIENT:
      return 'Awaiting Client';
    case WhoseMove.ACTION_REQUIRED:
      return 'Action Required';
    case WhoseMove.IN_PROGRESS:
      return 'In Progress';
    case WhoseMove.COMPLETE:
      return 'Complete';
  }
}

/**
 * Converts WhoseMove enum to the display format used by timeline component
 */
export function whoseMoveToDisplay(whoseMove: WhoseMove): 'Awaiting Client' | 'Action Required' | 'In Progress' | 'Complete' {
  return formatWhoseMove(whoseMove) as any;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a status event at the current timestamp
 */
export function createStatusEvent(statusId: string, note?: string): StatusEvent {
  return {
    statusId,
    timestamp: new Date(),
    note,
  };
}

/**
 * Validates that a status ID exists in the catalog
 */
export function isValidStatusId(statusId: string): boolean {
  return STATUS_BY_ID.has(statusId);
}

/**
 * Gets all valid status IDs for a given journey type
 */
export function getValidStatusIdsForJourney(journeyType: JourneyType): string[] {
  return Array.from(STATUS_BY_ID.values())
    .filter((status) => status.mapsTo.journeyType === journeyType)
    .map((status) => status.id);
}
