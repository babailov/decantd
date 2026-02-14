export interface CopyCatalog {
  metadata: {
    titleDefault: string;
    titleTemplate: string;
    description: string;
    manifestName: string;
    manifestDescription: string;
  };
  landing: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    stepsTitle: string;
    steps: Array<{
      step: string;
      title: string;
      description: string;
    }>;
  };
  auth: {
    signupTitle: string;
    loginTitle: string;
    signupDescription: string;
    loginDescription: string;
    googleIdle: string;
    googleLoading: string;
    signupCta: string;
    loginCta: string;
    signupSwitchPrompt: string;
    loginSwitchPrompt: string;
    signupSwitchCta: string;
    loginSwitchCta: string;
    forgotTitle: string;
    forgotDescription: string;
    forgotSentTitle: string;
    forgotSentDescription: string;
    forgotSubmitCta: string;
    backToSignIn: string;
    placeholders: {
      email: string;
      displayName: string;
      signupPassword: string;
      loginPassword: string;
    };
    welcomeSignupToast: string;
    welcomeLoginToast: string;
  };
  generation: {
    title: string;
    subtitle: string;
    idleTitle: string;
    idleDescription: string;
    idleCta: string;
    readyTitle: string;
    readyDescription: string;
    readyCta: string;
    actions: Array<{
      verb: string;
      detail: string;
    }>;
  };
  toasts: {
    generationLoading: string;
    generationErrorFallback: string;
    generationReady: string;
    generationReturnAction: string;
    generationOpenAction: string;
    shareCopied: string;
    imageSaved: string;
    imageSaveFailed: string;
    emailSent: string;
    emailFailed: string;
    palateCopied: string;
    ratingSaved: string;
    ratingFailed: string;
  };
  home: {
    subtitle: string;
    createPlan: string;
    palateTitle: string;
    recentPlansTitle: string;
    viewAll: string;
    journalCta: string;
  };
  review: {
    title: string;
    subtitle: string;
    optionalNoteLabel: string;
    optionalNotePlaceholder: string;
    optionalNoteLockedPlaceholder: string;
    optionalNoteUpgradeHint: string;
    upgradeInlineMessage: string;
    upgradeRateLimitMessage: string;
    upgradeAnonymousMessage: string;
    backCta: string;
    generateLoading: string;
    generateFoodToWine: string;
    generateWineToFood: string;
    modeFoodToWine: string;
    modeWineToFood: string;
    notSpecified: string;
    surprise: string;
    openCuisine: string;
    remainingTodaySuffix: string;
  };
  explore: {
    title: string;
    subtitle: string;
    newPlanTitle: string;
    newPlanDescription: string;
    features: {
      guided: { title: string; description: string; badge: string };
      aroma: { title: string; description: string; badge: string };
      serving: { title: string; description: string; badge: string };
      corkage: { title: string; description: string; badge: string };
    };
  };
  plan: {
    backToJournal: string;
    summaryFoodToWine: string;
    summaryWineToFood: string;
    corkageTitle: string;
    corkageDescription: string;
    flexibleCuisine: string;
    deepDiveTitle: string;
    estimatedTotalPrefix: string;
    selectedWinePrefix: string;
    pairingDirectionPrefix: string;
    saveTitle: string;
    saveDescription: string;
    saveCta: string;
    createAnotherCta: string;
    pairingsCountLabel: string;
    winesSingular: string;
    winesPlural: string;
  };
  profile: {
    plansLoadError: string;
    noPlansTitle: string;
    noPlansDescription: string;
    profileTitle: string;
    profileUnlockFallback: string;
    profileShareTitle: string;
    topRegions: string;
    topVarietals: string;
    adventurousness: string;
    basedOnRatingsPrefix: string;
  };
}
