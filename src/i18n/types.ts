export type Language = 'zh-TW' | 'zh-CN' | 'en';

export interface TranslationDictionary {
  // Common / Navbar
  appTitle: string;
  appSubtitle: string;
  subRegionTag: string;
  templeAddress: string;
  resetDemoData: string;
  tabPassenger: string;
  tabDriver: string;
  tabAdmin: string;
  selectEvent: string;
  topBanner: string;

  // Roles
  roleVolunteer: string;
  roleVolunteerDesc: string;
  roleAttendee: string;
  roleAttendeeDesc: string;
  roleBoth: string;

  // Legs
  outbound: string;
  returnLeg: string;
  bothLegs: string;
  outboundTimeLabel: string;
  returnTimeLabel: string;

  // Areas
  areas: {
    flushing: string;
    chinatown: string;
    brooklyn: string;
    queensOther: string;
    longIsland: string;
    newJersey: string;
    westchester: string;
    connecticut: string;
    other: string;
  };

  // Passenger View
  passengerTitle: string;
  passengerSubtitle: string;
  scheduleToggleOpen: string;
  scheduleToggleClose: string;
  scheduleTitle: string;
  remindersTitle: string;
  filterArea: string;
  filterAllAreas: string;
  filterRole: string;
  filterAllRoles: string;
  tabAvailableCars: string;
  tabSubmitRequest: string;
  seatsRemaining: string;
  seatsTotal: string;
  departureTime: string;
  bookSeatBtn: string;
  carOwner: string;
  noCarsFound: string;
  submitRequestPrompt: string;
  bookingSuccess: string;
  requestSuccess: string;

  // Booking Modal
  modalBookingTitle: string;
  modalNameLabel: string;
  modalPhoneLabel: string;
  modalContactLabel: string;
  modalCountLabel: string;
  modalOutboundRole: string;
  modalReturnRole: string;
  modalNotesLabel: string;
  modalNotesPlaceholder: string;
  modalCancelBtn: string;
  modalConfirmBtn: string;
  modalSelectLegWarning: string;

  // Request Form
  requestFormTitle: string;
  requestFormDesc: string;
  requestNameLabel: string;
  requestPhoneLabel: string;
  requestContactLabel: string;
  requestAreaLabel: string;
  requestPointLabel: string;
  requestPointPlaceholder: string;
  requestCountLabel: string;
  requestLegsLabel: string;
  requestOutboundCheck: string;
  requestReturnCheck: string;
  requestSubmitBtn: string;

  // Driver View
  driverTitle: string;
  driverSubtitle: string;
  tabOfferSeats: string;
  tabMyCars: string;
  tabClaimPassengers: string;
  driverFormNotice: string;
  driverNameLabel: string;
  driverPhoneLabel: string;
  driverContactLabel: string;
  driverCarModelLabel: string;
  driverCarColorLabel: string;
  driverPlateLabel: string;
  driverAreaLabel: string;
  driverPointLabel: string;
  driverPointPlaceholder: string;
  driverConfigureLegs: string;
  driverOfferOutbound: string;
  driverOfferReturn: string;
  driverOutboundSeats: string;
  driverReturnSeats: string;
  driverOutboundMode: string;
  driverReturnMode: string;
  driverNotesLabel: string;
  driverSubmitBtn: string;
  offerSuccess: string;
  myCarsTitle: string;
  passengersListTitle: string;
  claimSuccess: string;
  noWaitingPassengers: string;
  claimPassengerBtn: string;

  // Admin View
  adminTitle: string;
  adminSubtitle: string;
  adminLoginTitle: string;
  adminLoginDesc: string;
  adminUsernameLabel: string;
  adminPasswordLabel: string;
  adminLoginBtn: string;
  adminQuickTestBtn: string;
  adminLogoutBtn: string;
  adminInvalidCreds: string;
  adminTotalOffers: string;
  adminTotalSeats: string;
  adminMatchedCount: string;
  adminPendingCount: string;
  adminSmartMatchingTitle: string;
  adminSmartMatchingBadge: string;
  adminApplyAllMatches: string;
  adminAllMatchesApplied: string;
  adminSuggestedMatchReason: string;
  adminAdoptMatchBtn: string;
  adminNoMatchesSuggested: string;
  adminPhoneRegistrationBtn: string;
  adminExportCsvBtn: string;
  adminPrintBtn: string;
  adminRosterTitle: string;
  adminRequestsTitle: string;
  adminManualAssign: string;

  // Editing & Management
  editOfferBtn: string;
  editOfferModalTitle: string;
  editRequestBtn: string;
  editRequestModalTitle: string;
  saveChangesBtn: string;
  cancelEditBtn: string;
  myRequestsTab: string;
  myRequestsTitle: string;
  noRequestsSubmitted: string;
  updateSuccess: string;
  cancelRequestBtn: string;
  cancelRequestConfirm: string;
}
