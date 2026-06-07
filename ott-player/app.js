(() => {
  "use strict";

  const STATE_KEY = "sfvip-ott-state-v1";
  const STATE_SCHEMA = 2;
  const DB_NAME = "sfvip-ott-catalog-v1";
  const DB_VERSION = 2;
  const STORE = "channels";
  const DEMO_ID = "demo";
  const STABLE_LIVE_RATE = 1;
  const QOE_HEARTBEAT_MS = 5000;
  const CATALOG_BATCH_SIZE = 80;
  const CATALOG_BATCH_STEP = 80;
  const PROFILE_LOAD_CHUNK_SIZE = 900;
  const PROFILE_RENDER_THROTTLE_MS = 180;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    app: $("#app"),
    accountGate: $("#accountGate"),
    exploreDemoBtn: $("#exploreDemoBtn"),
    authForm: $("#authForm"),
    authTitle: $("#authTitle"),
    authCopy: $("#authCopy"),
    authNameField: $("#authNameField"),
    authName: $("#authName"),
    authEmail: $("#authEmail"),
    authPassword: $("#authPassword"),
    authBusy: $("#authBusy"),
    authSubmitBtn: $("#authSubmitBtn"),
    authModeButtons: $$("[data-auth-mode]"),
    profileGate: $("#profileGate"),
    profileCards: $("#profileCards"),
    profileGateSubtitle: $("#profileGateSubtitle"),
    manageProfilesBtn: $("#manageProfilesBtn"),
    gateUpgradeBtn: $("#gateUpgradeBtn"),
    gateAccountBtn: $("#gateAccountBtn"),
    nav: $$(".nav-link"),
    searchInput: $("#searchInput"),
    searchForm: $("#searchForm"),
    searchToggle: $("#searchToggle"),
    profileSelect: $("#profileSelect"),
    activeProfileBtn: $("#activeProfileBtn"),
    activeProfileAvatar: $("#activeProfileAvatar"),
    activeProfileName: $("#activeProfileName"),
    profileMenu: $("#profileMenu"),
    profileMenuList: $("#profileMenuList"),
    profileMenuSwitch: $("#profileMenuSwitch"),
    profileMenuEdit: $("#profileMenuEdit"),
    profileMenuAdd: $("#profileMenuAdd"),
    profileMenuRefresh: $("#profileMenuRefresh"),
    accountBtn: $("#accountBtn"),
    accountPlanLabel: $("#accountPlanLabel"),
    accountMenu: $("#accountMenu"),
    accountMenuKicker: $("#accountMenuKicker"),
    accountMenuName: $("#accountMenuName"),
    accountMenuEmail: $("#accountMenuEmail"),
    accountMenuPlan: $("#accountMenuPlan"),
    accountMenuSlots: $("#accountMenuSlots"),
    accountMenuUpgrade: $("#accountMenuUpgrade"),
    accountMenuBilling: $("#accountMenuBilling"),
    accountMenuLogout: $("#accountMenuLogout"),
    watchStage: $(".watch-stage"),
    homeView: $("#homeView"),
    groupList: $("#groupList"),
    catalogGrid: $("#catalogGrid"),
    browseTitle: $("#browseTitle"),
    catalogKicker: $("#catalogKicker"),
    catalogTitle: $("#catalogTitle"),
    catalogMeta: $("#catalogMeta"),
    seriesBackBtn: $("#seriesBackBtn"),
    loadPill: $("#loadPill"),
    playerCard: $(".player-card"),
    player: $("#player"),
    playerEmpty: $("#playerEmpty"),
    nowKind: $("#nowKind"),
    nowTitle: $("#nowTitle"),
    nowMeta: $("#nowMeta"),
    playerStatus: $("#playerStatus"),
    closePlayerBtn: $("#closePlayerBtn"),
    playerCloseX: $("#playerCloseX"),
    back10Btn: $("#back10Btn"),
    fwd10Btn: $("#fwd10Btn"),
    playPauseBtn: $("#playPauseBtn"),
    nextBtn: $("#nextBtn"),
    muteBtn: $("#muteBtn"),
    volumeRange: $("#volumeRange"),
    seekRange: $("#seekRange"),
    playerTime: $("#playerTime"),
    speedBtn: $("#speedBtn"),
    speedMenu: $("#speedMenu"),
    subsBtn: $("#subsBtn"),
    playerBarTitle: $("#playerBarTitle"),
    pipBtn: $("#pipBtn"),
    fullscreenBtn: $("#fullscreenBtn"),
    detailType: $("#detailType"),
    detailTitle: $("#detailTitle"),
    detailDesc: $("#detailDesc"),
    heroPlayBtn: $("#heroPlayBtn"),
    favoriteBtn: $("#favoriteBtn"),
    epgPanel: $("#epgPanel"),
    epgNowTitle: $("#epgNowTitle"),
    epgNowMeta: $("#epgNowMeta"),
    epgProgress: $("#epgProgress"),
    epgNextList: $("#epgNextList"),
    statLive: $("#statLive"),
    statMovies: $("#statMovies"),
    statSeries: $("#statSeries"),
    profileDialog: $("#profileDialog"),
    profileDialogTitle: $("#profileDialogTitle"),
    profileForm: $("#profileForm"),
    profileName: $("#profileName"),
    macPortal: $("#macPortal"),
    macValue: $("#macValue"),
    m3uUrl: $("#m3uUrl"),
    xtreamServer: $("#xtreamServer"),
    xtreamUser: $("#xtreamUser"),
    xtreamPass: $("#xtreamPass"),
    profileBusy: $("#profileBusy"),
    saveProfileBtn: $("#saveProfileBtn"),
    proDialog: $("#proDialog"),
    proDialogCopy: $("#proDialogCopy"),
    startCheckoutBtn: $("#startCheckoutBtn"),
    proBillingNote: $("#proBillingNote"),
    busyOverlay: $("#busyOverlay"),
    toastStack: $("#toastStack"),
    accountMenuSettings: $("#accountMenuSettings"),
    settingsDialog: $("#settingsDialog"),
    setLockAdult: $("#setLockAdult"),
    setParentalPin: $("#setParentalPin"),
    setAspect: $("#setAspect"),
    exportDataBtn: $("#exportDataBtn"),
    importDataBtn: $("#importDataBtn"),
    importDataInput: $("#importDataInput"),
    saveSettingsBtn: $("#saveSettingsBtn"),
    pinDialog: $("#pinDialog"),
    pinForm: $("#pinForm"),
    pinInput: $("#pinInput"),
    pinError: $("#pinError"),
    pinDialogTitle: $("#pinDialogTitle"),
    homeHero: $("#homeHero"),
    heroTrack: $("#heroTrack"),
    heroPrev: $("#heroPrev"),
    heroNext: $("#heroNext"),
    heroDots: $("#heroDots"),
    heroPause: $("#heroPause"),
    titleModal: $("#titleModal"),
    tmodalArt: $("#tmodalArt"),
    tmodalTitle: $("#tmodalTitle"),
    tmodalPlay: $("#tmodalPlay"),
    tmodalAdd: $("#tmodalAdd"),
    tmodalYear: $("#tmodalYear"),
    tmodalType: $("#tmodalType"),
    tmodalHd: $("#tmodalHd"),
    tmodalSynopsis: $("#tmodalSynopsis"),
    tmodalSide: $("#tmodalSide"),
    tmodalEpisodes: $("#tmodalEpisodes"),
    tmodalEpCount: $("#tmodalEpCount"),
    tmodalEpList: $("#tmodalEpList")
  };

  const demoChannels = [
    {
      id: "demo-live-news",
      profileId: DEMO_ID,
      title: "ORKXTRA News",
      type: "live",
      group: "News",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      quality: "HD",
      language: "English"
    },
    {
      id: "demo-live-sports",
      profileId: DEMO_ID,
      title: "Matchday Arena",
      type: "live",
      group: "Sports",
      url: "https://test-streams.mux.dev/test_001/stream.m3u8",
      quality: "FHD",
      language: "English"
    },
    {
      id: "demo-movie-bbb",
      profileId: DEMO_ID,
      title: "Flower Showcase",
      type: "movie",
      group: "Movies",
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      quality: "HD",
      language: "English"
    },
    {
      id: "demo-series-sintel",
      profileId: DEMO_ID,
      title: "Sintel",
      type: "series",
      group: "Series",
      url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      quality: "HD",
      language: "English"
    }
  ];

  const state = normalizeState(loadState());
  state.aspect = state.aspect || "contain";
  state.resume = (state.resume && typeof state.resume === "object") ? state.resume : {};
  state.lockAdult = Boolean(state.lockAdult);
  state.parentalPin = state.parentalPin || "";
  let channels = [...demoChannels];
  let channelById = new Map(channels.map((channel) => [channel.id, channel]));
  let loadedProfileIds = new Set([DEMO_ID]);
  let activeRoute = "home";
  let activeGroup = "All";
  let loginType = "mac";
  let currentList = [];
  let currentCatalogTotal = 0;
  let currentCatalogStored = false;
  let catalogRenderKey = "";
  let catalogRenderLimit = CATALOG_BATCH_SIZE;
  let catalogQueryRequestId = 0;
  let catalogObserver = null;
  let seriesView = null;
  let seriesRequestId = 0;
  const seriesEpisodeCache = new Map();
  const catalogVirtual = {
    active: false,
    key: "",
    start: -1,
    end: -1,
    scrollFrame: 0
  };
  let idleRenderHandle = 0;
  let idleRenderTimer = 0;
  let favoriteSet = new Set(state.favorites);
  const catalogCache = {
    routes: new Map(),
    groups: new Map(),
    counts: new Map()
  };
  let dbPromise = null;
  let hls = null;
  let mpegtsPlayer = null;
  let loadingKey = "";
  let renderTimer = 0;
  let account = defaultAccount();
  let accountGateVisible = false;
  let guestMode = true;
  let upgradeAfterAuth = false;
  let authMode = "login";
  let blockedProfileIds = new Set();
  let profileGateVisible = state.currentProfileId === DEMO_ID;
  let playerVisible = false;
  let manageProfiles = false;
  let editingProfileId = "";
  let catalogHydrated = false;
  let playbackSessionId = 0;
  let controlsHideTimer = 0;
  let playbackHealthTimer = 0;
  let suppressRateChange = false;
  let waitStartedAt = null;
  let lastProgressAt = 0;
  let lastProgressTime = 0;
  let lastRecoveryAt = 0;
  let recoveryAttempts = 0;
  const MAX_RECOVERY_ATTEMPTS = 4;
  let currentSourceFormat = "";
  let pendingResumeId = "";
  let heroIndex = 0;
  let heroTimer = 0;
  let heroBuiltKey = "";
  let heroBuiltProfile = "";
  let heroPaused = false;
  let heroVodTriedFor = "";
  let currentModalItem = null;
  let epgRequestId = 0;
  const epgCache = new Map();
  const playbackDiagnostics = {
    sessionId: "",
    channelId: "",
    title: "",
    startedAt: 0,
    waitingCount: 0,
    totalRebufferMs: 0,
    rateClamps: 0,
    recoveries: 0,
    hlsErrors: [],
    streamErrors: [],
    samples: []
  };

  init().catch((error) => {
    document.body.classList.remove("is-booting");
    console.error(error);
    notify("Startup failed", error.message || "The app could not start.");
  });

  async function init() {
    bindEvents();
    startPlaybackDiagnostics();
    els.player.volume = state.volume;
    els.player.muted = state.muted;
    updatePlayerChrome();
    detectHealth();
    await refreshAccount({ quiet: true });
    render();
    document.body.classList.remove("is-booting");
    await hydrateChannels();
    catalogHydrated = true;
    render();
    handleBillingReturn();
  }

  function defaultAccount() {
    return {
      authenticated: false,
      plan: "free",
      entitlements: {
        plan: "free",
        maxProfiles: 1,
        multipleProfiles: false
      },
      profileSlots: {
        used: 0,
        limit: 1
      },
      billing: {
        stripeConfigured: false,
        canManage: false
      }
    };
  }

  function normalizeState(input) {
    const base = {
      profiles: [{
        id: DEMO_ID,
        name: "Demo",
        type: "demo",
        createdAt: Date.now(),
        lastSync: Date.now()
      }],
      currentProfileId: DEMO_ID,
      favorites: [],
      history: [],
      currentChannelId: "",
      volume: 0.8,
      muted: false,
      playbackRate: STABLE_LIVE_RATE
    };
    const merged = { ...base, ...input };
    if (!Array.isArray(merged.profiles) || !merged.profiles.length) merged.profiles = base.profiles;
    if (!merged.profiles.some((profile) => profile.id === DEMO_ID)) merged.profiles.unshift(base.profiles[0]);
    if (!merged.profiles.some((profile) => profile.id === merged.currentProfileId)) merged.currentProfileId = merged.profiles[0].id;
    if (!Array.isArray(merged.favorites)) merged.favorites = [];
    if (!Array.isArray(merged.history)) merged.history = [];
    merged.playbackRate = Number(merged.playbackRate) || STABLE_LIVE_RATE;
    return merged;
  }

  function loadState() {
    try {
      return migrateState(JSON.parse(localStorage.getItem(STATE_KEY) || "{}"));
    } catch {
      return {};
    }
  }

  // Versioned migration ladder so a future shape change never silently drops saved data.
  function migrateState(raw) {
    if (!raw || typeof raw !== "object") return {};
    const version = Number(raw.schemaVersion) || 1;
    if (version < 2) {
      raw.aspect = raw.aspect || "contain";
      raw.resume = (raw.resume && typeof raw.resume === "object") ? raw.resume : {};
      raw.lockAdult = Boolean(raw.lockAdult);
      raw.parentalPin = raw.parentalPin || "";
    }
    raw.schemaVersion = STATE_SCHEMA;
    return raw;
  }

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      schemaVersion: STATE_SCHEMA,
      profiles: state.profiles,
      currentProfileId: state.currentProfileId,
      favorites: state.favorites.slice(0, 800),
      history: state.history.slice(0, 120),
      currentChannelId: state.currentChannelId,
      volume: state.volume,
      muted: state.muted,
      playbackRate: Number(state.playbackRate) || STABLE_LIVE_RATE,
      aspect: state.aspect || "contain",
      resume: state.resume || {},
      lockAdult: Boolean(state.lockAdult),
      parentalPin: state.parentalPin || ""
    }));
  }

  function openDb() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable"));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.objectStoreNames.contains(STORE)
          ? request.transaction.objectStore(STORE)
          : db.createObjectStore(STORE, { keyPath: "id" });
        if (!store.indexNames.contains("profileId")) store.createIndex("profileId", "profileId", { unique: false });
        if (!store.indexNames.contains("profileType")) store.createIndex("profileType", ["profileId", "type"], { unique: false });
        if (!store.indexNames.contains("profileTypeGroup")) store.createIndex("profileTypeGroup", ["profileId", "type", "displayGroup"], { unique: false });
        if (!store.indexNames.contains("profileTypeCatalog")) store.createIndex("profileTypeCatalog", ["profileId", "type", "catalogOnly"], { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open catalog database"));
    });
    return dbPromise;
  }

  async function hydrateChannels() {
    setChannels([...demoChannels]);
    loadedProfileIds = new Set([DEMO_ID]);
  }

  async function loadProfileChannels(profileId, options = {}) {
    if (!profileId || profileId === DEMO_ID || loadedProfileIds.has(profileId)) return;
    let loaded = 0;
    let lastRenderAt = 0;
    beginProfileChannelsLoad(profileId);
    const total = await streamStoredChannelsForProfile(profileId, (chunk) => {
      appendProfileChannelsInMemory(profileId, chunk);
      loaded += chunk.length;
      if (!options.renderProgress) return;
      const now = Date.now();
      if (now - lastRenderAt < PROFILE_RENDER_THROTTLE_MS) return;
      lastRenderAt = now;
      setBusy(true, `Loading ${currentProfile()?.name || "profile"}`, `${formatCount(loaded)} saved items ready.`);
      render();
    });
    loadedProfileIds.add(profileId);
    updateCurrentProfileSummary();
    saveState();
    if (options.renderProgress) {
      setBusy(false);
      render();
    }
    return total;
  }

  async function getStoredChannelsForProfile(profileId) {
    const rows = [];
    await streamStoredChannelsForProfile(profileId, (chunk) => rows.push(...chunk));
    return rows;
  }

  async function streamStoredChannelsForProfile(profileId, onChunk) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      let count = 0;
      let chunk = [];
      const req = tx.objectStore(STORE).index("profileId").openCursor(IDBKeyRange.only(profileId));
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) {
          if (chunk.length) onChunk(chunk);
          resolve(count);
          return;
        }
        const channel = normalizeChannel(cursor.value);
        if (channel) {
          chunk.push(channel);
          count += 1;
          if (chunk.length >= PROFILE_LOAD_CHUNK_SIZE) {
            onChunk(chunk);
            chunk = [];
          }
        }
        cursor.continue();
      };
      req.onerror = () => reject(req.error || new Error("Could not read catalog"));
    });
  }

  function setChannels(nextChannels) {
    channels = nextChannels.filter(Boolean);
    channelById = new Map(channels.map((channel) => [channel.id, channel]));
    invalidateCatalogCache();
  }

  function setProfileChannelsInMemory(profileId, nextChannels) {
    setChannels([
      ...channels.filter((channel) => channel.profileId !== profileId),
      ...nextChannels
    ]);
    loadedProfileIds.add(profileId);
  }

  function beginProfileChannelsLoad(profileId) {
    setChannels(channels.filter((channel) => channel.profileId !== profileId));
    loadedProfileIds.add(profileId);
  }

  function appendProfileChannelsInMemory(profileId, nextChannels) {
    const fresh = nextChannels.filter((channel) => channel.profileId === profileId && !channelById.has(channel.id));
    if (!fresh.length) return;
    channels.push(...fresh);
    fresh.forEach((channel) => channelById.set(channel.id, channel));
    invalidateCatalogCache();
  }

  function removeProfileChannelsFromMemory(profileId) {
    setChannels(channels.filter((channel) => channel.profileId !== profileId));
    loadedProfileIds.delete(profileId);
  }

  function invalidateCatalogCache() {
    catalogCache.routes.clear();
    catalogCache.groups.clear();
    catalogCache.counts.clear();
    catalogRenderKey = "";
  }

  function invalidateFavoriteCache() {
    favoriteSet = new Set(state.favorites);
    catalogCache.routes.delete(`${currentProfileId()}|favorites`);
    catalogCache.groups.clear();
    catalogRenderKey = "";
  }

  async function replaceProfileChannels(profileId, nextChannels) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const index = store.index("profileId");
      const req = index.openCursor(IDBKeyRange.only(profileId));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
          return;
        }
        nextChannels.forEach((channel) => store.put(channel));
      };
      req.onerror = () => reject(req.error || new Error("Could not replace profile catalog"));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Could not save profile catalog"));
    });
  }

  async function putChannels(nextChannels) {
    if (!nextChannels.length) return;
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      nextChannels.forEach((channel) => store.put(channel));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Could not save catalog rows"));
    });
  }

  function bindEvents() {
    els.authModeButtons.forEach((button) => {
      button.addEventListener("click", () => setAuthMode(button.dataset.authMode || "login"));
    });
    els.authForm.addEventListener("submit", handleAuthSubmit);
    els.exploreDemoBtn.addEventListener("click", continueAsGuest);
    els.gateUpgradeBtn.addEventListener("click", () => openProDialog());
    els.gateAccountBtn.addEventListener("click", () => {
      if (account.authenticated) {
        logoutAccount();
        return;
      }
      showAccountGate("login");
    });
    els.accountBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleAccountMenu();
    });
    els.accountMenu.addEventListener("click", (event) => event.stopPropagation());
    els.accountMenuUpgrade.addEventListener("click", () => {
      closeAccountMenu();
      openProDialog();
    });
    els.accountMenuBilling.addEventListener("click", () => {
      closeAccountMenu();
      openBillingPortal();
    });
    els.accountMenuLogout.addEventListener("click", () => {
      closeAccountMenu();
      if (account.authenticated) logoutAccount();
      else showAccountGate("login");
    });
    els.startCheckoutBtn.addEventListener("click", startStripeCheckout);
    $$("[data-close-pro]").forEach((button) => {
      button.addEventListener("click", () => els.proDialog.close());
    });
    els.nav.forEach((button) => {
      button.addEventListener("click", () => {
        activeRoute = button.dataset.route || "home";
        activeGroup = "All";
        clearSeriesView();
        render();
      });
    });
    // Hero carousel controls (the slides themselves are re-wired on each build)
    els.heroPrev?.addEventListener("click", () => { prevHero(); restartHeroAutoplay(); });
    els.heroNext?.addEventListener("click", () => { nextHero(); restartHeroAutoplay(); });
    els.homeHero?.addEventListener("mouseenter", stopHeroAutoplay);
    els.homeHero?.addEventListener("mouseleave", startHeroAutoplay);
    els.homeHero?.addEventListener("focusin", stopHeroAutoplay);
    els.homeHero?.addEventListener("focusout", startHeroAutoplay);
    let heroTouchX = 0;
    els.homeHero?.addEventListener("touchstart", (e) => { heroTouchX = e.touches[0]?.clientX || 0; }, { passive: true });
    els.homeHero?.addEventListener("touchend", (e) => {
      const dx = (e.changedTouches[0]?.clientX || 0) - heroTouchX;
      if (Math.abs(dx) > 40) { if (dx < 0) nextHero(); else prevHero(); restartHeroAutoplay(); }
    }, { passive: true });
    els.heroPause?.addEventListener("click", toggleHeroPause);
    els.titleModal?.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) closeTitleModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.titleModal && !els.titleModal.classList.contains("is-hidden")) closeTitleModal();
    });
    window.addEventListener("scroll", () => {
      document.body.classList.toggle("is-scrolled", window.scrollY > 64);
    }, { passive: true });
    window.addEventListener("resize", syncHeaderHeight);
    syncHeaderHeight();
    els.searchInput.addEventListener("input", () => {
      clearSeriesView();
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(renderCatalog, 90);
    });
    // Netflix-style search: collapsed to an icon, expands on click.
    els.searchForm?.addEventListener("submit", (event) => event.preventDefault());
    els.searchToggle?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (els.searchForm.classList.contains("is-collapsed")) openSearchBox();
      else if (!els.searchInput.value.trim()) collapseSearchBox();
      else els.searchInput.focus();
    });
    els.searchInput.addEventListener("blur", () => window.setTimeout(collapseSearchBox, 130));
    els.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        els.searchInput.value = "";
        els.searchInput.dispatchEvent(new Event("input"));
        els.searchInput.blur();
      }
    });
    window.addEventListener("scroll", scheduleVirtualCatalogRender, { passive: true });
    window.addEventListener("resize", scheduleVirtualCatalogRender);
    els.homeView.addEventListener("click", handleCardAction);
    els.catalogGrid.addEventListener("click", handleCardAction);
    setupHoverPreview();
    els.groupList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-group]");
      if (!button || !els.groupList.contains(button)) return;
      activeGroup = button.dataset.group || "All";
      clearSeriesView();
      renderGroups();
      renderCatalog();
    });
    els.seriesBackBtn.addEventListener("click", () => {
      clearSeriesView();
      renderCatalog();
    });
    els.profileSelect.addEventListener("change", () => {
      selectProfile(els.profileSelect.value, false);
    });
    els.manageProfilesBtn.addEventListener("click", () => {
      manageProfiles = !manageProfiles;
      renderProfileGate();
    });
    els.activeProfileBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleProfileMenu();
    });
    els.profileMenu.addEventListener("click", (event) => event.stopPropagation());
    els.profileMenuEdit.addEventListener("click", () => {
      closeProfileMenu();
      openEditProfileDialog();
    });
    els.profileMenuAdd.addEventListener("click", () => {
      closeProfileMenu();
      openProfileDialog();
    });
    els.profileMenuRefresh.addEventListener("click", () => {
      closeProfileMenu();
      refreshCurrentProfile();
    });
    els.profileForm.addEventListener("submit", handleProfileSubmit);
    els.profileDialog.addEventListener("close", () => {
      if (!els.profileBusy.classList.contains("is-hidden")) return;
      editingProfileId = "";
      els.profileDialogTitle.textContent = "Add IPTV Login";
      els.saveProfileBtn.textContent = "Add Profile";
    });
    $$(".login-tabs button").forEach((button) => {
      button.addEventListener("click", () => setLoginType(button.dataset.loginType));
    });
    els.heroPlayBtn.addEventListener("click", () => {
      const channel = currentChannel();
      if (channel) playChannel(channel);
    });
    els.favoriteBtn.addEventListener("click", () => {
      const channel = currentChannel() || featuredChannel();
      if (channel) toggleFavorite(channel.id);
    });
    els.back10Btn.addEventListener("click", () => seekBy(-10));
    els.fwd10Btn.addEventListener("click", () => seekBy(10));
    els.nextBtn.addEventListener("click", () => stepChannel(1));
    els.playPauseBtn.addEventListener("click", togglePlay);
    els.muteBtn.addEventListener("click", () => {
      els.player.muted = !els.player.muted;
      state.muted = els.player.muted;
      updatePlayerChrome();
      saveState();
    });
    els.volumeRange.addEventListener("input", () => {
      state.volume = Number(els.volumeRange.value);
      els.player.volume = state.volume;
      saveState();
      updatePlayerChrome();
    });
    els.seekRange.addEventListener("input", () => {
      if (!Number.isFinite(els.player.duration) || els.player.duration <= 0) return;
      els.player.currentTime = (Number(els.seekRange.value) / 1000) * els.player.duration;
    });
    setupSpeedMenu();
    els.subsBtn?.addEventListener("click", toggleSubtitles);
    els.pipBtn.addEventListener("click", togglePip);
    els.fullscreenBtn.addEventListener("click", toggleFullscreen);
    els.closePlayerBtn.addEventListener("click", closePlayer);
    els.playerCloseX?.addEventListener("click", closePlayer);
    els.player.addEventListener("play", () => {
      els.playerEmpty.classList.add("is-hidden");
      setPlayerStatus(isLivePlayback() ? "Live" : "Playing");
      updatePlayerChrome();
      schedulePlayerChromeHide();
    });
    els.player.addEventListener("pause", () => {
      setPlayerStatus(currentChannel() ? "Paused" : "Ready");
      updatePlayerChrome();
      showPlayerChrome(false);
    });
    els.player.addEventListener("timeupdate", updatePlayerChrome);
    els.player.addEventListener("durationchange", updatePlayerChrome);
    els.player.addEventListener("progress", updatePlayerChrome);
    els.player.addEventListener("volumechange", updatePlayerChrome);
    els.player.addEventListener("loadedmetadata", () => {
      applyStablePlaybackRate("metadata");
      applyAspectRatio();
      maybeResume();
      updatePlayerChrome();
    });
    els.player.addEventListener("ratechange", () => {
      if (!suppressRateChange) applyStablePlaybackRate("ratechange");
      updatePlayerChrome();
    });
    els.player.addEventListener("waiting", recordWaiting);
    els.player.addEventListener("stalled", () => {
      setPlayerStatus("Buffering", true);
      samplePlaybackHealth();
    });
    els.player.addEventListener("loadstart", () => setPlayerStatus("Loading", true));
    els.player.addEventListener("canplay", () => {
      setPlayerStatus(isLivePlayback() ? "Live" : "Ready");
      schedulePlayerChromeHide();
    });
    els.player.addEventListener("playing", recordPlaying);
    els.player.addEventListener("error", () => {
      if (state.currentChannelId) {
        recoverStalledPlayback("The browser could not decode this stream.");
      } else {
        setPlayerStatus("Issue");
      }
    });
    els.player.addEventListener("ended", () => {
      const channel = currentChannel();
      if (channel) clearResume(channel.id);
      if (channel && (channel.type === "series" || channel.seriesEpisode) && !isLivePlayback()) {
        notify("Next episode", "Playing the next item.");
        stepChannel(1);
      }
    });
    els.player.addEventListener("click", () => {
      if (state.currentChannelId) togglePlay();
    });
    ["mousemove", "pointermove", "touchstart", "click"].forEach((eventName) => {
      els.playerCard.addEventListener(eventName, () => showPlayerChrome());
    });
    els.playerCard.addEventListener("mouseleave", schedulePlayerChromeHide);
    document.addEventListener("fullscreenchange", () => showPlayerChrome());
    document.addEventListener("click", () => {
      closeProfileMenu();
      closeAccountMenu();
      closeSpeedMenu();
    });
    els.accountMenuSettings?.addEventListener("click", () => { closeAccountMenu(); openSettings(); });
    els.settingsDialog?.addEventListener("close", () => {
      if (els.settingsDialog.returnValue === "save") applySettingsFromForm();
    });
    // Direct handler too, so the Save button always applies even if the close event is missed.
    els.saveSettingsBtn?.addEventListener("click", applySettingsFromForm);
    els.exportDataBtn?.addEventListener("click", exportBackup);
    els.importDataBtn?.addEventListener("click", () => els.importDataInput?.click());
    els.importDataInput?.addEventListener("change", importBackup);
    document.addEventListener("keydown", handlePlayerHotkeys);
  }

  function openSettings() {
    if (!els.settingsDialog) return;
    els.setLockAdult.checked = Boolean(state.lockAdult);
    els.setParentalPin.value = state.parentalPin || "";
    els.setAspect.value = state.aspect || "contain";
    els.settingsDialog.showModal();
  }

  function applySettingsFromForm() {
    const pin = String(els.setParentalPin.value || "").replace(/\D/g, "").slice(0, 8);
    const lock = Boolean(els.setLockAdult.checked);
    if (lock && pin.length < 4) notify("PIN too short", "Set a 4–8 digit PIN to enable the parental lock.");
    state.lockAdult = lock && pin.length >= 4;
    state.parentalPin = pin;
    state.aspect = els.setAspect.value || "contain";
    applyAspectRatio();
    saveState();
    notify("Settings saved", state.lockAdult ? "Parental lock is on." : "Preferences updated.");
  }

  function isAdultLocked(channel) {
    return Boolean(state.lockAdult && state.parentalPin && isAdultChannel(channel));
  }

  function requestPin() {
    return new Promise((resolve) => {
      if (!els.pinDialog) { resolve(false); return; }
      els.pinInput.value = "";
      els.pinError.classList.add("is-hidden");
      const onClose = () => {
        els.pinDialog.removeEventListener("close", onClose);
        resolve(els.pinDialog.returnValue === "ok" && els.pinInput.value === state.parentalPin);
      };
      els.pinDialog.addEventListener("close", onClose);
      els.pinDialog.showModal();
      els.pinInput.focus();
    });
  }

  function exportBackup() {
    try {
      const blob = new Blob([localStorage.getItem(STATE_KEY) || "{}"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orkxtra-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Backup exported", "Profiles and settings saved to a file.");
    } catch (error) {
      notify("Export failed", error.message || "Could not export backup.");
    }
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.profiles)) {
        throw new Error("That file is not a valid ORKXTRA backup.");
      }
      localStorage.setItem(STATE_KEY, JSON.stringify(migrateState(parsed)));
      notify("Backup imported", "Reloading with your restored profiles…");
      setTimeout(() => location.reload(), 800);
    } catch (error) {
      notify("Import failed", error.message || "That file could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  function setAuthMode(mode) {
    authMode = mode === "signup" ? "signup" : "login";
    const signingUp = authMode === "signup";
    els.authModeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.authMode === authMode));
    els.authNameField.classList.toggle("is-hidden", !signingUp);
    els.authName.required = signingUp;
    els.authPassword.autocomplete = signingUp ? "new-password" : "current-password";
    els.authTitle.textContent = signingUp ? "Create your account" : "Welcome back";
    els.authCopy.textContent = signingUp
      ? "Start free with one saved IPTV profile. Upgrade only when you need more."
      : "Log in to continue to your saved IPTV profiles.";
    els.authSubmitBtn.textContent = signingUp ? "Create free account" : "Log in";
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthBusy(true, authMode === "signup" ? "Creating your account" : "Logging you in");
    try {
      const body = {
        email: els.authEmail.value.trim(),
        password: els.authPassword.value
      };
      if (authMode === "signup") body.name = els.authName.value.trim();
      account = normalizeAccount(await apiJson(`/api/auth/${authMode}`, { method: "POST", body }));
      guestMode = false;
      accountGateVisible = false;
      profileGateVisible = true;
      await syncLocalProfileSlots();
      render();
      notify(authMode === "signup" ? "Account created" : "Logged in", "Your IPTV credentials remain saved only in this browser.");
      if (upgradeAfterAuth) {
        upgradeAfterAuth = false;
        openProDialog("Upgrade to Pro to add a second saved IPTV profile.");
      }
    } catch (error) {
      notify(authMode === "signup" ? "Signup failed" : "Login failed", error.message || "Could not access your account.");
    } finally {
      setAuthBusy(false);
    }
  }

  function setAuthBusy(active, message = "") {
    els.authBusy.classList.toggle("is-hidden", !active);
    els.authBusy.innerHTML = active ? `<span class="spinner"></span><span>${escapeHtml(message)}</span>` : "";
    els.authSubmitBtn.disabled = active;
    els.authModeButtons.forEach((button) => {
      button.disabled = active;
    });
  }

  function continueAsGuest() {
    guestMode = true;
    accountGateVisible = false;
    profileGateVisible = true;
    upgradeAfterAuth = false;
    render();
  }

  function showAccountGate(mode = "login") {
    closeAccountMenu();
    closeProfileMenu();
    setAuthMode(mode);
    accountGateVisible = true;
    guestMode = false;
    profileGateVisible = false;
    renderAccessVisibility();
  }

  async function logoutAccount() {
    try {
      await apiJson("/api/auth/logout", { method: "POST" });
    } catch {
      // Clearing the local account view is still correct if the server session already expired.
    }
    closePlayer();
    account = defaultAccount();
    blockedProfileIds = new Set();
    guestMode = true;
    accountGateVisible = false;
    profileGateVisible = true;
    render();
  }

  function toggleAccountMenu() {
    const closed = els.accountMenu.classList.toggle("is-hidden");
    els.accountBtn.setAttribute("aria-expanded", String(!closed));
    closeProfileMenu();
  }

  function closeAccountMenu() {
    els.accountMenu.classList.add("is-hidden");
    els.accountBtn.setAttribute("aria-expanded", "false");
  }

  async function refreshAccount({ quiet = false } = {}) {
    try {
      account = normalizeAccount(await apiJson("/api/account/me"));
      accountGateVisible = !account.authenticated && !guestMode;
      if (account.authenticated) await syncLocalProfileSlots();
      renderAccountChrome();
      renderAccessVisibility();
      return account;
    } catch (error) {
      account = defaultAccount();
      accountGateVisible = !guestMode;
      renderAccountChrome();
      renderAccessVisibility();
      if (!quiet) notify("Account unavailable", error.message || "Could not load your account.");
      return account;
    }
  }

  async function syncLocalProfileSlots() {
    if (!account.authenticated) return account;
    const profileIds = state.profiles.filter((profile) => profile.id !== DEMO_ID).map((profile) => profile.id);
    const response = await apiJson("/api/account/profile-slots/sync", {
      method: "POST",
      body: { profileIds }
    });
    account = normalizeAccount(response);
    blockedProfileIds = new Set(response.blockedProfileIds || []);
    if (state.currentProfileId !== DEMO_ID && blockedProfileIds.has(state.currentProfileId)) {
      state.currentProfileId = availableProfiles()[0]?.id || DEMO_ID;
      state.currentChannelId = "";
      playerVisible = false;
      destroyPlayers();
      saveState();
    }
    renderAccountChrome();
    return account;
  }

  async function registerProfileSlot(profileId) {
    account = normalizeAccount(await apiJson("/api/account/profile-slots/register", {
      method: "POST",
      body: { profileId }
    }));
    blockedProfileIds.delete(profileId);
    renderAccountChrome();
  }

  async function releaseProfileSlot(profileId) {
    if (!account.authenticated || !profileId) return;
    account = normalizeAccount(await apiJson("/api/account/profile-slots/remove", {
      method: "POST",
      body: { profileId }
    }));
    blockedProfileIds.delete(profileId);
    renderAccountChrome();
  }

  function normalizeAccount(input = {}) {
    const base = defaultAccount();
    return {
      ...base,
      ...input,
      entitlements: { ...base.entitlements, ...(input.entitlements || {}) },
      profileSlots: { ...base.profileSlots, ...(input.profileSlots || {}) },
      billing: { ...base.billing, ...(input.billing || {}) }
    };
  }

  async function apiJson(pathname, { method = "GET", body } = {}) {
    const response = await fetch(`${location.origin}${pathname}`, {
      method,
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `HTTP ${response.status}`);
      error.code = data.code || "";
      error.account = data.account || null;
      throw error;
    }
    return data;
  }

  function renderAccountChrome() {
    const pro = account.plan === "pro";
    const authenticated = Boolean(account.authenticated);
    const slotLimit = account.profileSlots?.limit || account.entitlements?.maxProfiles || 1;
    const slotUsed = account.profileSlots?.used || 0;
    els.accountPlanLabel.textContent = pro ? "Pro" : (authenticated ? "Free" : "Demo");
    els.accountBtn.classList.toggle("is-pro", pro);
    els.accountMenuKicker.textContent = pro ? "ORKXTRA Pro" : "ORKXTRA account";
    els.accountMenuName.textContent = account.user?.name || "Demo access";
    els.accountMenuEmail.textContent = account.user?.email || "Sign up to save IPTV profiles";
    els.accountMenuPlan.textContent = pro ? "Pro plan" : (authenticated ? "Free plan" : "Demo mode");
    els.accountMenuSlots.textContent = authenticated
      ? `${slotUsed} of ${slotLimit} saved ${slotLimit === 1 ? "profile" : "profiles"}`
      : "One demo profile";
    els.accountMenuUpgrade.classList.toggle("is-hidden", pro);
    els.accountMenuBilling.classList.toggle("is-hidden", !account.billing?.canManage);
    els.accountMenuLogout.textContent = authenticated ? "Log out" : "Log in";
    els.gateUpgradeBtn.classList.toggle("is-hidden", pro);
    els.gateAccountBtn.textContent = authenticated ? "Log out" : "Log in";
  }

  function openProDialog(message = "Upgrade when one IPTV login is not enough.") {
    if (account.plan === "pro") {
      notify("Pro is active", "Your account already supports multiple saved IPTV profiles.");
      return;
    }
    els.proDialogCopy.textContent = message;
    els.proBillingNote.textContent = account.billing?.stripeConfigured
      ? "Secure subscription checkout powered by Stripe."
      : "Add your Stripe secret key in .env to enable checkout.";
    els.startCheckoutBtn.textContent = account.authenticated ? "Continue with Stripe" : "Create an account to upgrade";
    els.proDialog.showModal();
  }

  async function startStripeCheckout() {
    if (!account.authenticated) {
      els.proDialog.close();
      showAccountGate("signup");
      notify("Create an account", "Sign up before starting a Pro subscription.");
      return;
    }
    els.startCheckoutBtn.disabled = true;
    els.startCheckoutBtn.textContent = "Opening Stripe...";
    try {
      const data = await apiJson("/api/billing/checkout", { method: "POST" });
      location.assign(data.url);
    } catch (error) {
      notify("Checkout unavailable", error.message || "Could not start Stripe checkout.");
    } finally {
      els.startCheckoutBtn.disabled = false;
      els.startCheckoutBtn.textContent = "Continue with Stripe";
    }
  }

  async function openBillingPortal() {
    try {
      const data = await apiJson("/api/billing/portal", { method: "POST" });
      location.assign(data.url);
    } catch (error) {
      notify("Billing unavailable", error.message || "Could not open Stripe billing.");
    }
  }

  function handleBillingReturn() {
    const params = new URLSearchParams(location.search);
    const result = params.get("billing");
    if (!result) return;
    history.replaceState(null, "", `${location.pathname}${location.hash || ""}`);
    if (result === "success") {
      notify("Payment received", "Confirming your Pro access from Stripe.");
      window.setTimeout(() => refreshAccount().then(render), 1200);
    } else {
      notify("Checkout cancelled", "Your current plan has not changed.");
    }
  }

  async function selectProfile(profileId, enterPlayer = true) {
    const profile = state.profiles.find((item) => item.id === profileId);
    if (!profile) return;
    const changed = state.currentProfileId !== profileId;
    state.currentProfileId = profileId;
    activeRoute = "home";
    activeGroup = "All";
    clearSeriesView();
    els.searchInput.value = "";
    if (changed) {
      playbackSessionId += 1;
      state.currentChannelId = "";
      playerVisible = false;
      destroyPlayers();
      setPlayerStatus("Ready");
    }
    if (enterPlayer) profileGateVisible = false;
    closeProfileMenu();
    saveState();
    render();
    if (profile.id !== DEMO_ID && !loadedProfileIds.has(profile.id) && !hasStoredCatalogMeta(profile)) {
      setBusy(true, `Loading ${profile.name}`, "Reading this profile catalog from local storage.");
      try {
        await loadProfileChannels(profile.id, { renderProgress: true });
      } catch (error) {
        notify("Catalog load failed", error.message || "Could not load saved channels.");
        removeProfileChannelsFromMemory(profile.id);
      } finally {
        setBusy(false);
        render();
      }
    }
  }

  function showProfileGate() {
    profileGateVisible = true;
    manageProfiles = false;
    closeProfileMenu();
    playbackSessionId += 1;
    els.player.pause();
    render();
  }

  function toggleProfileMenu() {
    const open = els.profileMenu.classList.toggle("is-hidden");
    els.activeProfileBtn.setAttribute("aria-expanded", String(!open));
  }

  function closeProfileMenu() {
    els.profileMenu.classList.add("is-hidden");
    els.activeProfileBtn.setAttribute("aria-expanded", "false");
  }

  function setLoginType(type) {
    loginType = type;
    $$(".login-tabs button").forEach((button) => button.classList.toggle("is-active", button.dataset.loginType === type));
    $$(".login-fields").forEach((fields) => fields.classList.toggle("is-hidden", fields.dataset.fields !== type));
  }

  function openProfileDialog() {
    const saved = savedProfileCount();
    const limit = Number(account.entitlements?.maxProfiles || 1);
    if (saved >= limit) {
      if (!account.authenticated) {
        upgradeAfterAuth = true;
        showAccountGate("signup");
        notify("Pro feature", "Create an account or log in to add a second IPTV profile.");
      } else if (account.plan !== "pro") {
        openProDialog("Free includes one saved IPTV profile. Upgrade to Pro to add another login.");
      } else {
        notify("Profile limit reached", `Your Pro account supports up to ${limit} saved IPTV profiles.`);
      }
      return;
    }
    editingProfileId = "";
    els.profileDialogTitle.textContent = "Add IPTV Login";
    els.saveProfileBtn.textContent = "Add Profile";
    setLoginType("mac");
    els.profileName.value = "";
    els.macPortal.value = "http://me.mdmfista.com:80/c/";
    els.macValue.value = "A0:BB:3E:DC:5E:99";
    els.m3uUrl.value = "";
    els.xtreamServer.value = "";
    els.xtreamUser.value = "";
    els.xtreamPass.value = "";
    els.profileDialog.showModal();
  }

  function openEditProfileDialog() {
    const profile = currentProfile();
    if (!profile || profile.type === "demo") {
      notify("Demo profile", "Demo credentials cannot be edited.");
      return;
    }
    editingProfileId = profile.id;
    els.profileDialogTitle.textContent = "Edit IPTV Login";
    els.saveProfileBtn.textContent = "Save Changes";
    setLoginType(profile.type || "mac");
    els.profileName.value = profile.name || "";
    els.macPortal.value = profile.portal || "";
    els.macValue.value = profile.mac || "";
    els.m3uUrl.value = profile.url || "";
    els.xtreamServer.value = profile.server || "";
    els.xtreamUser.value = profile.username || "";
    els.xtreamPass.value = profile.password || "";
    els.profileDialog.showModal();
  }

  async function handleProfileSubmit(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const editing = Boolean(editingProfileId);
    setProfileBusy(true, editing ? "Updating profile" : "Loading profile", "Connecting and building the catalog.");
    let profile = null;
    let slotClaimed = false;
    try {
      profile = profileFromForm();
      if (!editing && account.authenticated) {
        await registerProfileSlot(profile.id);
        slotClaimed = true;
      }
      const imported = await importProfile(profile);
      await saveImportedProfile(profile, imported);
      els.profileDialog.close();
      editingProfileId = "";
      notify(editing ? "Profile updated" : "Profile added", summaryForProfile(profile.id));
    } catch (error) {
      if (slotClaimed && profile?.id) await releaseProfileSlot(profile.id).catch(() => {});
      if (error.account) account = normalizeAccount(error.account);
      if (error.code === "PRO_REQUIRED") openProDialog(error.message);
      notify(editing ? "Update failed" : "Profile failed", error.message || "The provider did not load.");
    } finally {
      setProfileBusy(false);
    }
  }

  function profileFromForm() {
    const existing = editingProfileId ? state.profiles.find((profile) => profile.id === editingProfileId) : null;
    const id = existing?.id || `profile-${hash(`${loginType}|${Date.now()}|${Math.random()}`)}`;
    const name = els.profileName.value.trim() || (loginType === "mac" ? "MAC Profile" : "IPTV Profile");
    const profile = { id, name, type: loginType, createdAt: existing?.createdAt || Date.now(), lastSync: Date.now() };
    if (loginType === "mac") {
      profile.portal = els.macPortal.value.trim();
      profile.mac = normalizeMac(els.macValue.value.trim());
      if (!profile.portal || !profile.mac) throw new Error("Enter portal URL and MAC address.");
    } else if (loginType === "m3u") {
      profile.url = els.m3uUrl.value.trim();
      if (!profile.url) throw new Error("Enter an M3U URL.");
    } else {
      const server = trimSlash(els.xtreamServer.value.trim());
      const username = els.xtreamUser.value.trim();
      const password = els.xtreamPass.value.trim();
      if (!server || !username || !password) throw new Error("Enter server, username, and password.");
      profile.server = server;
      profile.username = username;
      profile.password = password;
      profile.url = `${server}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=mpegts`;
    }
    return profile;
  }

  async function importProfile(profile) {
    if (profile.type === "mac") return fetchMacChannels(profile);
    const text = await fetchText(profile.url);
    return parseM3U(text, profile);
  }

  async function saveImportedProfile(profile, imported) {
    profile.catalogMeta = buildCatalogMeta(imported, profile.id);
    profile.summary = profile.catalogMeta.counts;
    state.profiles = state.profiles.filter((item) => item.id !== profile.id);
    state.profiles.push(profile);
    state.currentProfileId = profile.id;
    setProfileChannelsInMemory(profile.id, imported);
    clearProfileEpgCache(profile.id);
    await replaceProfileChannels(profile.id, imported);
    saveState();
    activeRoute = "home";
    activeGroup = "All";
    profileGateVisible = false;
    manageProfiles = false;
    render();
  }

  async function refreshCurrentProfile() {
    const profile = currentProfile();
    if (!profile || profile.type === "demo") {
      notify("Demo profile", "Add a real profile before refreshing.");
      return;
    }
    setBusy(true, `Refreshing ${profile.name}`, "Updating live channels and catalog groups.");
    try {
      const imported = await importProfile(profile);
      profile.lastSync = Date.now();
      profile.catalogMeta = buildCatalogMeta(imported, profile.id);
      profile.summary = profile.catalogMeta.counts;
      setProfileChannelsInMemory(profile.id, imported);
      clearProfileEpgCache(profile.id);
      await replaceProfileChannels(profile.id, imported);
      saveState();
      render();
      notify("Profile refreshed", summaryForProfile(profile.id));
    } catch (error) {
      notify("Refresh failed", error.message || "Could not refresh this profile.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProfile(profileId) {
    const profile = state.profiles.find((item) => item.id === profileId);
    if (!profile || profile.id === DEMO_ID) return;
    if (!window.confirm(`Remove ${profile.name}? This clears its saved channels from this browser.`)) return;
    setBusy(true, "Removing profile", `Clearing ${profile.name} and its catalog.`);
    try {
      const stored = loadedProfileIds.has(profile.id) ? [] : await getStoredChannelsForProfile(profile.id).catch(() => []);
      const removedIds = new Set([
        ...channels.filter((channel) => channel.profileId === profile.id).map((channel) => channel.id),
        ...stored.map((channel) => channel.id)
      ]);
      removeProfileChannelsFromMemory(profile.id);
      clearProfileEpgCache(profile.id);
      state.profiles = state.profiles.filter((item) => item.id !== profile.id);
      state.favorites = state.favorites.filter((id) => !removedIds.has(id));
      state.history = state.history.filter((entry) => !removedIds.has(entry.id));
      invalidateFavoriteCache();
      if (state.currentProfileId === profile.id) {
        state.currentProfileId = availableProfiles()[0]?.id || DEMO_ID;
        state.currentChannelId = "";
        playerVisible = false;
        destroyPlayers();
      }
      await replaceProfileChannels(profile.id, []);
      await releaseProfileSlot(profile.id).catch(() => {});
      saveState();
      render();
      notify("Profile removed", `${profile.name} was removed.`);
    } catch (error) {
      notify("Remove failed", error.message || "Could not remove this profile.");
    } finally {
      setBusy(false);
    }
  }

  async function fetchMacChannels(profile) {
    const response = await fetch(`${location.origin}/api/mac/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "MAC portal failed");
    return (data.channels || []).map((item) => normalizeChannel({
      id: stableChannelId(profile, item),
      profileId: profile.id,
      title: item.title || "Portal Item",
      type: item.type || "live",
      mediaType: item.mediaType || "",
      catalogOnly: Boolean(item.catalogOnly),
      group: item.group || profile.name,
      url: item.url || "",
      logo: item.logo || "",
      description: item.description || "",
      providerId: item.providerId || item.id || "",
      epgId: item.epgId || item.providerId || item.id || "",
      macCommand: item.command || "",
      macEndpoint: item.endpoint || data.endpoint || "",
      streamFormat: item.format || "",
      categoryId: item.categoryId || "",
      adult: Boolean(item.adult),
      quality: item.quality || inferQuality(`${item.title || ""} ${item.group || ""}`),
      language: "Portal"
    })).filter((channel) => channel && (channel.catalogOnly || channel.url || channel.macCommand));
  }

  async function fetchMacCategory(profile, placeholder) {
    const response = await fetch(`${location.origin}/api/mac/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portal: profile.portal,
        mac: profile.mac,
        endpoint: placeholder.macEndpoint,
        mediaType: placeholder.mediaType || placeholder.type,
        type: placeholder.type,
        categoryId: placeholder.categoryId,
        categoryTitle: placeholder.group || placeholder.title
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Catalog group failed");
    return (data.channels || []).map((item) => normalizeChannel({
      id: stableChannelId(profile, item),
      profileId: profile.id,
      title: item.title || "Portal Item",
      type: item.type || placeholder.type || "movie",
      mediaType: item.mediaType || placeholder.mediaType || "",
      group: item.group || placeholder.group || profile.name,
      url: item.url || "",
      logo: item.logo || "",
      description: item.description || "",
      providerId: item.providerId || item.id || "",
      epgId: item.epgId || item.providerId || item.id || "",
      macCommand: item.command || "",
      macEndpoint: item.endpoint || placeholder.macEndpoint || "",
      streamFormat: item.format || "",
      categoryId: item.categoryId || placeholder.categoryId || "",
      adult: Boolean(item.adult || placeholder.adult),
      quality: item.quality || inferQuality(`${item.title || ""} ${item.group || ""}`),
      language: "Portal"
    })).filter((channel) => channel && (channel.url || channel.macCommand || channel.type === "series"));
  }

  async function fetchMacSeries(profile, series) {
    const response = await fetch(`${location.origin}/api/mac/series`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portal: profile.portal,
        mac: profile.mac,
        endpoint: series.macEndpoint,
        providerId: series.providerId,
        title: series.title
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Series episodes failed");
    return (data.episodes || []).map((item) => normalizeChannel({
      id: stableChannelId(profile, item),
      profileId: profile.id,
      title: item.title || "Episode",
      type: "series",
      mediaType: "series",
      group: item.group || series.title,
      url: item.url || "",
      logo: item.logo || series.logo || "",
      description: item.description || series.description || "",
      providerId: item.providerId || item.id || "",
      macCommand: item.command || "",
      macEndpoint: item.endpoint || series.macEndpoint || data.endpoint || "",
      streamFormat: item.format || "",
      seriesEpisode: item.seriesEpisode || "",
      seriesTitle: series.title,
      seasonTitle: item.group || "",
      isEpisode: true,
      adult: Boolean(item.adult || series.adult),
      quality: item.quality || series.quality || "HD",
      language: "Portal"
    })).filter((episode) => episode && (episode.url || episode.macCommand));
  }

  function parseM3U(text, profile) {
    const rows = [];
    let info = null;
    String(text || "").split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      if (line.startsWith("#EXTINF")) {
        const attrs = {};
        line.replace(/([\w-]+)="([^"]*)"/g, (_, key, value) => {
          attrs[key] = value;
          return "";
        });
        const title = line.includes(",") ? line.slice(line.lastIndexOf(",") + 1).trim() : attrs["tvg-name"];
        info = { attrs, title };
        return;
      }
      if (line.startsWith("#")) return;
      const title = info?.title || line.split("/").pop() || "Untitled Stream";
      const group = info?.attrs?.["group-title"] || "Other";
      rows.push(normalizeChannel({
        id: stableChannelId(profile, { id: info?.attrs?.["tvg-id"] || title, url: line, title }),
        profileId: profile.id,
        title,
        type: inferType(group, line),
        group,
        url: line,
        logo: info?.attrs?.["tvg-logo"] || "",
        epgId: info?.attrs?.["tvg-id"] || "",
        quality: inferQuality(`${title} ${group}`),
        language: info?.attrs?.["tvg-language"] || "Unknown"
      }));
      info = null;
    });
    return rows.filter(Boolean);
  }

  async function fetchText(url) {
    const proxied = await fetch(`${location.origin}/api/fetch?url=${encodeURIComponent(url)}`);
    if (proxied.ok) return proxied.text();
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  }

  function render() {
    renderAccountChrome();
    renderProfileGate();
    renderProfiles();
    renderNav();
    renderStats();
    renderPlayerVisibility();
    renderHero();
    renderHomeRows();
    renderGroups();
    renderCatalog();
    updatePlayerChrome();
  }

  function scheduleIdleRender(timeout = 700) {
    cancelIdleRender();
    const run = () => {
      idleRenderHandle = 0;
      idleRenderTimer = 0;
      render();
    };
    if ("requestIdleCallback" in window) {
      idleRenderHandle = window.requestIdleCallback(run, { timeout });
    } else {
      idleRenderTimer = window.setTimeout(run, Math.min(timeout, 160));
    }
  }

  function cancelIdleRender() {
    if (idleRenderHandle && "cancelIdleCallback" in window) window.cancelIdleCallback(idleRenderHandle);
    if (idleRenderTimer) window.clearTimeout(idleRenderTimer);
    idleRenderHandle = 0;
    idleRenderTimer = 0;
  }

  function renderProfileGate() {
    const profiles = availableProfiles();
    renderAccessVisibility();
    els.profileGateSubtitle.textContent = manageProfiles
      ? "Remove saved logins you no longer use. Removing a profile also clears its saved catalog."
      : "Choose a saved IPTV login or add a new MAC, M3U, or Xtream profile.";
    els.manageProfilesBtn.textContent = manageProfiles ? "Done" : "Manage profiles";
    els.profileCards.innerHTML = [
      ...profiles.map((profile, index) => profileGateCard(profile, index)),
      addProfileCard()
    ].join("");
    els.profileCards.classList.toggle("is-managing", manageProfiles);
    $$("[data-pick-profile]", els.profileCards).forEach((button) => {
      button.addEventListener("click", () => selectProfile(button.dataset.pickProfile, true));
    });
    $$("[data-remove-profile]", els.profileCards).forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteProfile(button.dataset.removeProfile);
      });
    });
    $$("[data-add-profile]", els.profileCards).forEach((button) => {
      button.addEventListener("click", openProfileDialog);
    });
  }

  function renderAccessVisibility() {
    els.accountGate.classList.toggle("is-hidden", !accountGateVisible);
    els.profileGate.classList.toggle("is-hidden", accountGateVisible || !profileGateVisible);
    els.app.classList.toggle("is-hidden", accountGateVisible || profileGateVisible);
  }

  function profileGateCard(profile, index) {
    const current = profile.id === state.currentProfileId;
    return `
      <article class="viewer-card ${current ? "is-current" : ""}" style="${avatarVars(profile, index)}">
        <button class="viewer-pick" type="button" data-pick-profile="${escapeHtml(profile.id)}">
          ${avatarMarkup(profile, "viewer-avatar")}
          <strong>${escapeHtml(profile.name)}</strong>
          <span>${escapeHtml(profileTypeLabel(profile))} - ${escapeHtml(summaryForProfile(profile.id))}</span>
        </button>
        ${manageProfiles && profile.id !== DEMO_ID ? `<button class="viewer-remove" type="button" data-remove-profile="${escapeHtml(profile.id)}" aria-label="Remove ${escapeAttr(profile.name)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12"></path></svg>Remove</button>` : ""}
      </article>
    `;
  }

  function addProfileCard() {
    return `
      <article class="viewer-card add-viewer">
        <button class="viewer-pick" type="button" data-add-profile>
          <span class="viewer-avatar add-avatar">+</span>
          <strong>Add profile</strong>
          <span>MAC, M3U, or Xtream login</span>
        </button>
      </article>
    `;
  }

  function renderProfiles() {
    const profiles = availableProfiles();
    if (!profiles.some((profile) => profile.id === state.currentProfileId)) {
      state.currentProfileId = profiles[0]?.id || DEMO_ID;
    }
    const activeChannel = findChannel(state.currentChannelId);
    if (activeChannel && activeChannel.profileId !== state.currentProfileId) {
      state.currentChannelId = "";
      playerVisible = false;
    }
    const current = currentProfile();
    els.profileSelect.innerHTML = profiles.map((profile) => (
      `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`
    )).join("");
    els.profileSelect.value = state.currentProfileId;
    els.activeProfileName.textContent = current?.name || "Profile";
    els.activeProfileAvatar.style.cssText = avatarVars(current || profiles[0] || { name: "OTT" }, 0);
    els.activeProfileAvatar.textContent = initials(current?.name || "OTT");
    renderProfileMenu(profiles);
  }

  function renderProfileMenu(profiles) {
    const current = currentProfile() || profiles[0];
    els.profileMenuList.innerHTML = current ? `
      <div class="profile-menu-item is-active" style="${avatarVars(current, 0)}">
        ${avatarMarkup(current, "menu-avatar")}
        <span>
          <strong>${escapeHtml(current.name)}</strong>
          <small>${escapeHtml(profileTypeLabel(current))}</small>
        </span>
        <button id="profileMenuSwitch" class="profile-menu-switch" type="button">Switch</button>
      </div>
    ` : "";
    els.profileMenuSwitch = $("#profileMenuSwitch");
    els.profileMenuSwitch?.addEventListener("click", showProfileGate);
  }

  function renderNav() {
    els.nav.forEach((button) => {
      const active = button.dataset.route === activeRoute;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function renderStats() {
    const counts = mediaCounts(currentProfileId());
    els.statLive.textContent = formatCount(counts.live);
    els.statMovies.textContent = formatCount(counts.movie || counts.movieGroups);
    els.statSeries.textContent = formatCount(counts.series || counts.seriesGroups);
  }

  function renderHero() {
    const item = playerVisible ? currentChannel() : null;
    const counts = mediaCounts(currentProfileId());
    els.detailType.textContent = item ? mediaLabel(item.type) : "Home";
    els.detailTitle.textContent = item?.title || "Add a profile and start watching";
    els.detailDesc.textContent = item
      ? `${item.group || "Catalog"} - ${item.quality || "Stream"} - ${item.language || "Portal"}`
      : `${formatCount(counts.live)} live - ${formatCount(counts.movie || counts.movieGroups)} movies - ${formatCount(counts.series || counts.seriesGroups)} series`;
    els.heroPlayBtn.disabled = !item || (!item.url && !item.macCommand);
    els.favoriteBtn.disabled = !item;
    const saved = Boolean(item && isFavorite(item.id));
    els.favoriteBtn.classList.toggle("is-saved", saved);
    els.favoriteBtn.setAttribute("aria-label", saved ? "Saved" : "Save");
    els.favoriteBtn.title = saved ? "Saved" : "Save";
    renderEpgPanel(item);
  }

  function renderPlayerVisibility() {
    els.watchStage.classList.toggle("is-hidden", !playerVisible);
    // The hero is a sibling of the player — hide it the instant playback starts on Home,
    // and bring it back when the player closes. (Previously it lingered until the next render.)
    if (playerVisible) hideHomeHero();
    else if (activeRoute === "home") renderHomeHero();
  }

  function renderEpgPanel(channel) {
    if (!els.epgPanel) return;
    if (!channel || channel.type !== "live") {
      hideEpgPanel();
      return;
    }
    els.epgPanel.classList.remove("is-hidden");
    const profile = state.profiles.find((item) => item.id === channel.profileId);
    if (!profile || profile.type !== "mac" || !profile.portal || !profile.mac || !channel.macEndpoint) {
      setEpgMessage("No provider EPG", "This source does not expose portal guide data", "empty");
      return;
    }
    const key = epgCacheKey(channel);
    const cached = epgCache.get(key);
    if (cached?.programs) {
      displayEpgPrograms(cached.programs);
      return;
    }
    if (cached?.loading) {
      setEpgMessage("Loading guide...", "Fetching provider EPG", "loading");
      return;
    }
    epgCache.set(key, { loading: true });
    setEpgMessage("Loading guide...", "Fetching provider EPG", "loading");
    fetchChannelEpg(channel, key, ++epgRequestId);
  }

  async function fetchChannelEpg(channel, key, requestId) {
    const profile = state.profiles.find((item) => item.id === channel.profileId);
    try {
      const response = await fetch(`${location.origin}/api/mac/epg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portal: profile.portal,
          mac: profile.mac,
          endpoint: channel.macEndpoint,
          channelId: channel.providerId || channel.epgId,
          providerId: channel.providerId,
          epgId: channel.epgId,
          id: channel.id,
          title: channel.title
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Guide request failed");
      const programs = Array.isArray(data.programs) ? data.programs : [];
      epgCache.set(key, { programs, fetchedAt: Date.now(), error: data.error || "" });
      if (requestId === epgRequestId && (currentChannel() || featuredChannel())?.id === channel.id) displayEpgPrograms(programs);
    } catch (error) {
      epgCache.set(key, { programs: [], fetchedAt: Date.now(), error: error.message || "Provider did not return EPG" });
      if (requestId === epgRequestId && (currentChannel() || featuredChannel())?.id === channel.id) {
        setEpgMessage("Guide unavailable", error.message || "Provider did not return EPG", "empty");
      }
    }
  }

  function displayEpgPrograms(programs) {
    els.epgPanel.classList.remove("is-hidden");
    const now = Date.now();
    const sorted = programs
      .map((program) => ({
        ...program,
        start: Number(program.start) || 0,
        end: Number(program.end) || 0
      }))
      .filter((program) => program.start)
      .sort((a, b) => a.start - b.start);
    const current = sorted.find((program) => program.start <= now && program.end > now)
      || sorted.find((program) => program.start > now)
      || null;
    if (!current) {
      setEpgMessage("No guide data", "The provider returned no schedule for this channel", "empty");
      return;
    }
    const progress = current.end > current.start
      ? Math.min(100, Math.max(0, ((now - current.start) / (current.end - current.start)) * 100))
      : 0;
    els.epgPanel.dataset.state = "ready";
    els.epgNowTitle.textContent = current.title || "Program";
    els.epgNowMeta.textContent = `${formatEpgTime(current.start)} - ${formatEpgTime(current.end)}`;
    els.epgProgress.style.width = `${Math.round(progress)}%`;
    const next = sorted.filter((program) => program.start > now).slice(0, 3);
    els.epgNextList.innerHTML = next.length
      ? next.map((program) => `
        <div class="epg-next-item">
          <time>${escapeHtml(formatEpgTime(program.start))}</time>
          <span>${escapeHtml(program.title || "Program")}</span>
        </div>
      `).join("")
      : `<div class="epg-next-item"><time>Next</time><span>No upcoming guide items</span></div>`;
  }

  function setEpgMessage(title, meta, stateName = "empty") {
    if (!els.epgPanel) return;
    els.epgPanel.classList.remove("is-hidden");
    els.epgPanel.dataset.state = stateName;
    els.epgNowTitle.textContent = title;
    els.epgNowMeta.textContent = meta;
    els.epgProgress.style.width = stateName === "loading" ? "42%" : "0";
    els.epgNextList.innerHTML = "";
  }

  function hideEpgPanel() {
    if (!els.epgPanel) return;
    epgRequestId += 1;
    els.epgPanel.classList.add("is-hidden");
    els.epgPanel.dataset.state = "hidden";
    els.epgNowTitle.textContent = "";
    els.epgNowMeta.textContent = "";
    els.epgProgress.style.width = "0";
    els.epgNextList.innerHTML = "";
  }

  function epgCacheKey(channel) {
    return `${channel.profileId}|${channel.providerId || channel.epgId || channel.id}`;
  }

  function clearProfileEpgCache(profileId) {
    const prefix = `${profileId}|`;
    Array.from(epgCache.keys()).forEach((key) => {
      if (key.startsWith(prefix)) epgCache.delete(key);
    });
  }

  function formatEpgTime(value) {
    const date = new Date(Number(value) || 0);
    if (!Number.isFinite(date.getTime())) return "--:--";
    return new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function renderHomeRows() {
    closeHoverPreview();
    const profileId = currentProfileId();
    const rows = [];
    const recent = state.history.map((entry) => findChannel(entry.id)).filter(Boolean).filter((ch) => ch.profileId === profileId).slice(0, 14);
    if (recent.length) rows.push({ title: "Continue Watching", subtitle: "Resume from your history", items: recent, kind: "channel", history: true });
    rows.push({ title: "Live TV", subtitle: "Featured live channel groups", items: topGroups("live", 14), kind: "group", route: "live" });
    // Movies & Series now render as per-category rows of real titles (appended async below).
    const favorites = state.favorites.map(findChannel).filter(Boolean).filter((ch) => ch.profileId === profileId).slice(0, 14);
    if (favorites.length) rows.push({ title: "My List", subtitle: "Saved channels and titles", items: favorites, kind: "channel" });
    els.homeView.innerHTML = activeRoute === "home"
      ? rows.filter((row) => row.items.length).map(rowMarkup).join("")
      : "";
    attachCardEvents(els.homeView);
    renderHomeHero();
    renderTop10();
    renderHomeCategoryRows();
  }

  // ---- Netflix-style per-category rows (real titles + their thumbnails) ----
  let categoryRowsCache = { profileId: "", html: "" };

  async function renderHomeCategoryRows() {
    if (!els.homeView || activeRoute !== "home" || playerVisible) return;
    const profileId = currentProfileId();
    if (categoryRowsCache.profileId === profileId && categoryRowsCache.html) {
      insertCategoryRows(categoryRowsCache.html);
      return;
    }
    if (profileId === DEMO_ID) {
      const rows = [];
      const mm = channels.filter((c) => c.profileId === profileId && c.type === "movie" && !c.catalogOnly);
      const ss = channels.filter((c) => c.profileId === profileId && c.type === "series" && !c.catalogOnly);
      if (mm.length) rows.push({ title: "Movies", items: mm, route: "movie", kind: "channel", category: true });
      if (ss.length) rows.push({ title: "Series", items: ss, route: "series", kind: "channel", category: true });
      if (rows.length) { const html = rows.map(rowMarkup).join(""); categoryRowsCache = { profileId, html }; insertCategoryRows(html); }
      return;
    }
    const [movieRows, seriesRows] = await Promise.all([
      buildCategoryRows(profileId, "movie", 5, 14),
      buildCategoryRows(profileId, "series", 4, 14)
    ]);
    if (activeRoute !== "home" || profileId !== currentProfileId()) return;
    const rows = [...movieRows, ...seriesRows];
    if (!rows.length) return;
    const html = rows.map(rowMarkup).join("");
    categoryRowsCache = { profileId, html };
    insertCategoryRows(html);
  }

  function insertCategoryRows(html) {
    els.homeView.querySelectorAll(".ott-row.category-row").forEach((r) => r.remove());
    const myStuff = [...els.homeView.querySelectorAll(".ott-row")].find((s) => (s.getAttribute("aria-label") || "") === "My List");
    if (myStuff) myStuff.insertAdjacentHTML("beforebegin", html);
    else els.homeView.insertAdjacentHTML("beforeend", html);
  }

  // One cursor scan over a VOD type, bucketed by category, returns the fullest rows.
  async function buildCategoryRows(profileId, type, maxRows, perRow) {
    const db = await openDb();
    const buckets = new Map();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).index("profileType").openCursor(IDBKeyRange.only([profileId, type]));
      let scanned = 0;
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor || scanned > 5000) { resolve(); return; }
        scanned += 1;
        const v = cursor.value;
        if (v && v.logo && !v.catalogOnly && !isAdultChannel(v)) {
          const g = displayGroupName(v.group || "Other");
          let arr = buckets.get(g);
          if (!arr) { arr = []; buckets.set(g, arr); }
          if (arr.length < perRow) arr.push(normalizeChannel(v) || v);
        }
        const full = [...buckets.values()].filter((a) => a.length >= perRow).length;
        if (full >= maxRows + 2) { resolve(); return; }
        cursor.continue();
      };
      req.onerror = () => resolve();
    });
    // Register these items in memory so findChannel() resolves them when a card is
    // clicked (Play / More info / Add) — otherwise the category cards are inert.
    appendProfileChannelsInMemory(profileId, [...buckets.values()].flat());
    return [...buckets.entries()]
      .filter(([, items]) => items.length >= 4)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, maxRows)
      .map(([title, items]) => ({ title, items, route: type, kind: "channel", category: true }));
  }

  // ---- "Top 10" row with big outlined rank numbers ----
  async function renderTop10() {
    if (!els.homeView || activeRoute !== "home" || playerVisible) return;
    const pid = currentProfileId();
    let pool = channels.filter((c) => c.profileId === pid && c.type === "movie" && !c.catalogOnly && c.logo);
    if (pool.length < 10 && pid !== DEMO_ID) {
      try {
        const res = await queryStoredCatalog(pid, "movie", "All", "", 30);
        pool = pool.concat((res.items || []).filter((c) => c.logo));
      } catch (_) { /* use in-memory */ }
    }
    if (activeRoute !== "home" || pid !== currentProfileId()) return;
    const seen = new Set();
    const top = [];
    for (const c of pool) {
      if (c && !seen.has(c.id) && !isAdultChannel(c)) { seen.add(c.id); top.push(c); }
      if (top.length >= 10) break;
    }
    if (pid !== DEMO_ID) appendProfileChannelsInMemory(pid, top);
    const existing = els.homeView.querySelector(".top10-row");
    if (top.length < 5) { if (existing) existing.remove(); return; }
    const html = `
      <section class="ott-row top10-row" aria-label="Top 10 Movies Today">
        <div class="row-head"><div><h2>Top 10 Movies Today</h2></div></div>
        <div class="rail-wrap">
          ${railArrow("prev")}
          <div class="rail top10-rail">${top.map((c, i) => top10Card(c, i + 1)).join("")}</div>
          ${railArrow("next")}
        </div>
      </section>`;
    if (existing) existing.outerHTML = html;
    else els.homeView.insertAdjacentHTML("afterbegin", html);
  }

  function top10Card(channel, rank) {
    const logo = channel.logo ? `<img src="${escapeAttr(channel.logo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : "";
    return `
      <div class="top10-card">
        <span class="top10-num">${rank}</span>
        <button class="top10-poster" data-open-title="${escapeAttr(channel.id)}" type="button" aria-label="${escapeAttr(cleanTitle(channel.title))}" style="${thumbnailVars(channel)}">${logo}</button>
      </div>`;
  }

  // ---- Cinematic sliding hero (movies & series spotlight) ----
  async function renderHomeHero() {
    if (!els.homeHero) return;
    if (activeRoute !== "home" || playerVisible) { hideHomeHero(); return; }
    const profileId = currentProfileId();
    // Skip the IndexedDB scans entirely if the hero is already built for this profile and shown
    // (render() fires often — favorite toggles, idle re-renders — and shouldn't re-scan each time).
    if (heroBuiltProfile === profileId && !els.homeHero.classList.contains("is-hidden")) {
      document.body.classList.add("hero-mode");
      return;
    }
    const items = await buildHeroSpotlight(profileId);
    if (profileId !== currentProfileId() || activeRoute !== "home" || playerVisible) return; // stale
    if (!items.length) {
      hideHomeHero();
      maybeLoadHeroVod(profileId);
      return;
    }
    heroBuiltKey = `${profileId}|${items.map((i) => i.id).join(",")}`;
    heroBuiltProfile = profileId;
    buildHeroSlides(items);
    els.homeHero.classList.remove("is-hidden");
    document.body.classList.add("hero-mode");
    syncHeaderHeight();
  }

  // Fast hero query: stops the cursor as soon as `limit` artwork items are found, instead of
  // scanning the entire (16K–27K row) live store the way queryStoredCatalog does for its total count.
  function queryHeroItems(profileId, type, limit) {
    return openDb().then((db) => new Promise((resolve) => {
      const out = [];
      let scanned = 0;
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).index("profileType").openCursor(IDBKeyRange.only([profileId, type]));
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor || out.length >= limit || scanned > 600) { resolve(out); return; }
        scanned += 1;
        const v = cursor.value;
        if (v && v.logo && !v.catalogOnly) out.push(normalizeChannel(v) || v);
        cursor.continue();
      };
      req.onerror = () => resolve(out);
    })).catch(() => []);
  }

  async function buildHeroSpotlight(profileId) {
    const mem = channels.filter((c) => c.profileId === profileId && !c.catalogOnly
      && (c.type === "movie" || c.type === "series" || c.type === "live"));
    let vod = [];
    let storedLive = [];
    if (profileId !== DEMO_ID) {
      try {
        const [movies, series, live] = await Promise.all([
          queryHeroItems(profileId, "movie", 10),
          queryHeroItems(profileId, "series", 10),
          queryHeroItems(profileId, "live", 10)
        ]);
        vod = [].concat(movies, series);
        storedLive = live;
      } catch (_) { /* IndexedDB query failed — use in-memory only */ }
    }
    const dedupe = (arr) => {
      const seen = new Set();
      const out = [];
      for (const c of arr) {
        if (c && !seen.has(c.id) && !isAdultChannel(c) && (c.url || c.macCommand || c.type === "series")) {
          seen.add(c.id);
          out.push(c);
        }
      }
      return out;
    };
    const movies = dedupe([...vod.filter((c) => c.type === "movie"), ...mem.filter((c) => c.type === "movie")]).filter((c) => c.logo);
    const series = dedupe([...vod.filter((c) => c.type === "series"), ...mem.filter((c) => c.type === "series")]);
    const live = dedupe([...storedLive, ...mem.filter((c) => c.type === "live")]).filter((c) => c.logo);
    // Interleave a balanced movie / live / series mix so the carousel varies.
    const pools = [movies, live, series];
    const mix = [];
    for (let i = 0; mix.length < 6 && pools.some((p) => p.length); i += 1) {
      const p = pools[i % pools.length];
      if (p.length) mix.push(p.shift());
    }
    if (mix.length) return mix.slice(0, 6);
    return dedupe([...vod, ...mem]).slice(0, 6);
  }

  function heroSlideMarkup(item, index) {
    const isSeries = item.type === "series";
    const isLive = item.type === "live";
    // Movie/series cover art fills the backdrop; live channel logos are small, so use a
    // generated backdrop + show the logo as a chip instead.
    const useBackdrop = item.logo && !isLive;
    const bg = useBackdrop
      ? `<div class="hero-bg" style="background-image:url('${escapeAttr(item.logo)}')"></div>`
      : `<div class="hero-bg generated" style="${thumbnailVars(item)}"></div>`;
    const logoChip = (isLive && item.logo)
      ? `<img class="hero-logo" src="${escapeAttr(item.logo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`
      : "";
    const kicker = isLive ? "Live TV" : isSeries ? "Series" : "Movie";
    const group = escapeHtml(displayGroupName(item.group || "Catalog"));
    const desc = clean(item.description || "");
    const synopsis = desc ? `<p class="hero-synopsis">${escapeHtml(item.description)}</p>` : "";
    const rating = item.quality ? `<span class="hero-rating">${escapeHtml(item.quality)}</span>` : "";
    const playLabel = isSeries ? "Episodes" : isLive ? "Watch live" : "Play";
    const saved = isFavorite(item.id);
    return `
      <article class="hero-slide ${index === 0 ? "is-active" : ""}" data-hero-index="${index}" role="group" aria-roledescription="slide" aria-label="${escapeAttr(item.title)}">
        ${bg}
        <div class="hero-scrim"></div>
        ${rating}
        <div class="hero-content">
          ${logoChip}
          <p class="hero-kicker ${isLive ? "is-live" : ""}">${kicker} &middot; ${group}</p>
          <h2 class="hero-title">${escapeHtml(cleanTitle(item.title))}</h2>
          ${synopsis}
          <div class="hero-actions">
            <button class="hero-play" type="button" data-hero-play="${escapeAttr(item.id)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"></path></svg>
              <span>${playLabel}</span>
            </button>
            <button class="hero-info" type="button" data-hero-info="${escapeAttr(item.id)}">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01" stroke-linecap="round"></path></svg>
              <span>More Info</span>
            </button>
            <button class="hero-add ${saved ? "is-saved" : ""}" type="button" data-hero-add="${escapeAttr(item.id)}" aria-label="${saved ? "Saved to My List" : "Add to My List"}" title="My List">
              <svg viewBox="0 0 24 24" aria-hidden="true">${saved ? `<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor"></path>` : `<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor"></path>`}</svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function buildHeroSlides(items) {
    stopHeroAutoplay();
    heroIndex = 0;
    els.heroTrack.innerHTML = items.map(heroSlideMarkup).join("");
    els.heroDots.innerHTML = items.map((_, i) =>
      `<button class="hero-dot ${i === 0 ? "is-active" : ""}" type="button" aria-label="Go to slide ${i + 1}"${i === 0 ? ' aria-current="true"' : ''} data-hero-dot="${i}"></button>`
    ).join("");
    $$("[data-hero-play]", els.homeHero).forEach((b) => b.addEventListener("click", () => {
      const item = findChannel(b.dataset.heroPlay);
      if (!item) return;
      if (item.type === "series") openSeries(item);
      else playChannel(item);
    }));
    $$("[data-hero-info]", els.homeHero).forEach((b) => b.addEventListener("click", () => {
      const item = findChannel(b.dataset.heroInfo);
      if (item) openTitleModal(item);
    }));
    $$("[data-hero-add]", els.homeHero).forEach((b) => b.addEventListener("click", () => {
      toggleFavorite(b.dataset.heroAdd);
      const saved = isFavorite(b.dataset.heroAdd);
      b.classList.toggle("is-saved", saved);
      b.setAttribute("aria-label", saved ? "Saved to My List" : "Add to My List");
    }));
    $$("[data-hero-dot]", els.heroDots).forEach((d) => d.addEventListener("click", () => { goHero(Number(d.dataset.heroDot)); restartHeroAutoplay(); }));
    startHeroAutoplay();
  }

  function goHero(index) {
    const slides = $$(".hero-slide", els.heroTrack);
    const dots = $$(".hero-dot", els.heroDots);
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === heroIndex));
    dots.forEach((d, i) => {
      const active = i === heroIndex;
      d.classList.toggle("is-active", active);
      if (active) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function nextHero() { goHero(heroIndex + 1); }
  function prevHero() { goHero(heroIndex - 1); }

  function startHeroAutoplay() {
    stopHeroAutoplay();
    if (heroPaused || playerVisible || activeRoute !== "home") return;
    if (els.homeHero.classList.contains("is-hidden")) return;
    if ($$(".hero-slide", els.heroTrack).length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = window.setInterval(nextHero, 6500);
  }
  function stopHeroAutoplay() { if (heroTimer) { window.clearInterval(heroTimer); heroTimer = 0; } }
  function restartHeroAutoplay() { stopHeroAutoplay(); startHeroAutoplay(); }
  function toggleHeroPause() {
    heroPaused = !heroPaused;
    if (els.heroPause) {
      els.heroPause.setAttribute("aria-pressed", heroPaused ? "true" : "false");
      els.heroPause.setAttribute("aria-label", heroPaused ? "Resume auto-rotation" : "Pause auto-rotation");
      els.heroPause.dataset.paused = heroPaused ? "true" : "false";
    }
    if (heroPaused) stopHeroAutoplay();
    else startHeroAutoplay();
  }
  function hideHomeHero() {
    if (!els.homeHero) return;
    els.homeHero.classList.add("is-hidden");
    stopHeroAutoplay();
    heroBuiltKey = "";
    document.body.classList.remove("hero-mode");
  }

  function syncHeaderHeight() {
    const header = document.querySelector(".shell-header");
    if (header) document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
  }

  // First home visit with no VOD loaded yet: lazily pull one movie/series category so the hero has content.
  async function maybeLoadHeroVod(profileId) {
    if (heroVodTriedFor === profileId) return;
    heroVodTriedFor = profileId;
    const profile = currentProfile();
    if (!profile || profile.id === DEMO_ID || !profile.portal) return;
    for (const route of ["movie", "series"]) {
      try {
        const group = groupEntries(route).find((g) => g.count > 0)?.name;
        if (!group) continue;
        const placeholder = await findStoredCategoryPlaceholder(profile.id, route, group);
        if (!placeholder) continue;
        const loaded = await fetchMacCategory(profile, placeholder);
        const fresh = (loaded || []).filter((c) => c && !channelById.has(c.id));
        if (fresh.length) {
          appendProfileChannelsInMemory(profile.id, fresh);
          await putChannels(fresh);
          if (activeRoute === "home") { heroBuiltKey = ""; renderHomeHero(); }
          return;
        }
      } catch (_) { /* try next route */ }
    }
  }

  function rowMarkup(row) {
    return `
      <section class="ott-row${row.category ? " category-row" : ""}" aria-label="${escapeHtml(row.title)}">
        <div class="row-head">
          <div>
            <h2>${escapeHtml(row.title)}</h2>
            ${row.subtitle ? `<span>${escapeHtml(row.subtitle)}</span>` : ""}
          </div>
        </div>
        <div class="rail-wrap">
          ${railArrow("prev")}
          <div class="rail">
            ${row.items.map((item) => row.kind === "group" ? groupCard(item, row.route) : channelCard(item, true, row.history)).join("")}
          </div>
          ${railArrow("next")}
        </div>
      </section>
    `;
  }

  // Netflix-style edge paddle that pages the rail horizontally (wired in handleCardAction).
  function railArrow(dir) {
    const path = dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
    return `<button class="rail-arrow ${dir}" type="button" data-rail-dir="${dir}" tabindex="-1" aria-label="${dir === "prev" ? "Scroll left" : "Scroll right"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>`;
  }

  function renderGroups() {
    const route = routeType();
    const groups = groupEntries(route);
    const profileId = currentProfileId();
    const routeTotal = countForRoute(route, profileId);
    const system = [
      { name: "All", count: routeTotal },
      { name: "Favorites", count: knownFavoriteCount(route, profileId) },
      { name: "Recently Watched", count: knownHistoryCount(route, profileId) }
    ];
    const allGroups = [...system, ...groups];
    if (!allGroups.some((group) => group.name === activeGroup)) activeGroup = "All";
    els.browseTitle.textContent = route === "all" ? "Home" : mediaLabel(route);
    els.groupList.innerHTML = limitGroupsKeepingAdult(allGroups, 72).map((group) => `
      <button class="group-chip ${group.name === activeGroup ? "is-active" : ""}" data-group="${escapeHtml(group.name)}">
        ${escapeHtml(group.name)} <span>${formatCount(group.count)}</span>
      </button>
    `).join("");
  }

  function renderCatalog() {
    const route = routeType();
    // Drive poster shape off the grid's route: portrait only when it's a single VOD type.
    els.catalogGrid.dataset.gridRoute = route;
    const query = clean(els.searchInput.value);
    const group = activeGroup;
    if (seriesView && route === "series") {
      renderSeriesEpisodes();
      return;
    }
    els.seriesBackBtn.classList.add("is-hidden");
    if (shouldUseStoredCatalog(route)) {
      renderStoredCatalog(route, group, query);
      return;
    }
    const list = filteredChannels(route, group, query);
    currentList = list;
    currentCatalogTotal = list.length;
    currentCatalogStored = false;
    const nextKey = `${currentProfileId()}|${route}|${group}|${query}|${list.length}`;
    if (nextKey !== catalogRenderKey) {
      catalogRenderKey = nextKey;
      catalogRenderLimit = CATALOG_BATCH_SIZE;
      disconnectCatalogObserver();
    }
    els.catalogKicker.textContent = route === "all" ? "All Media" : mediaLabel(route);
    els.catalogTitle.textContent = query ? `Search: ${els.searchInput.value.trim()}` : group === "All" ? routeTitle(route) : group;
    els.catalogMeta.textContent = `${formatCount(list.length)} shown`;
    const maybeLoading = ensureCategoryLoaded(route, group, list);
    if (maybeLoading && !list.length) {
      disconnectCatalogObserver();
      els.catalogGrid.innerHTML = loadingState("Loading this category", "The portal is returning this movie or series group.");
      return;
    }
    if (!list.length) {
      disconnectCatalogObserver();
      catalogVirtual.active = false;
      els.catalogGrid.innerHTML = emptyState("No titles found", "Try another group, route, or search term.");
      return;
    }
    if (list.length > CATALOG_BATCH_SIZE) {
      disconnectCatalogObserver();
      const virtualKey = `${currentProfileId()}|${route}|${group}|${query}|${list.length}`;
      if (virtualKey !== catalogVirtual.key) {
        catalogVirtual.key = virtualKey;
        catalogVirtual.start = -1;
        catalogVirtual.end = -1;
      }
      catalogVirtual.active = true;
      renderVirtualCatalogWindow(list);
      return;
    }
    catalogVirtual.active = false;
    const visible = list.slice(0, Math.min(catalogRenderLimit, list.length));
    const hasMore = visible.length < list.length;
    els.catalogGrid.innerHTML = [
      ...visible.map((channel) => channelCard(channel)),
      hasMore ? loadMoreCard(visible.length, list.length) : ""
    ].join("");
    attachCardEvents(els.catalogGrid);
    observeCatalogMore();
  }

  async function openSeries(series) {
    const profile = state.profiles.find((item) => item.id === series.profileId);
    if (!profile || profile.type !== "mac") {
      notify("Episodes unavailable", "This series source does not expose a portal episode catalog.");
      return;
    }
    activeRoute = "series";
    const key = `${series.profileId}|${series.providerId}`;
    const cached = seriesEpisodeCache.get(key);
    if (cached?.length) {
      showSeriesEpisodes(series, cached);
      return;
    }
    const requestId = ++seriesRequestId;
    setLoadPill(true, `Loading ${series.title}`);
    els.catalogKicker.textContent = "Series";
    els.catalogTitle.textContent = series.title;
    els.catalogMeta.textContent = "Loading episodes";
    els.seriesBackBtn.classList.remove("is-hidden");
    els.catalogGrid.innerHTML = loadingState("Loading episodes", "Fetching this series only. The result is cached for fast reopening.");
    try {
      const episodes = await fetchMacSeries(profile, series);
      if (requestId !== seriesRequestId) return;
      if (!episodes.length) throw new Error("The provider returned no playable episodes.");
      seriesEpisodeCache.set(key, episodes);
      showSeriesEpisodes(series, episodes);
    } catch (error) {
      if (requestId !== seriesRequestId) return;
      clearSeriesView();
      notify("Series unavailable", error.message || "Could not load episodes.");
      renderCatalog();
    } finally {
      if (requestId === seriesRequestId) setLoadPill(false);
    }
  }

  function showSeriesEpisodes(series, episodes) {
    episodes.forEach((episode) => channelById.set(episode.id, episode));
    seriesView = { series, episodes };
    currentList = episodes;
    currentCatalogStored = false;
    currentCatalogTotal = episodes.length;
    catalogVirtual.active = false;
    renderSeriesEpisodes();
  }

  function renderSeriesEpisodes() {
    if (!seriesView) return;
    disconnectCatalogObserver();
    els.seriesBackBtn.classList.remove("is-hidden");
    els.catalogKicker.textContent = "Episodes";
    els.catalogTitle.textContent = seriesView.series.title;
    els.catalogMeta.textContent = `${formatCount(seriesView.episodes.length)} episodes`;
    if (seriesView.episodes.length > CATALOG_BATCH_SIZE) {
      catalogVirtual.key = `episodes|${seriesView.series.id}|${seriesView.episodes.length}`;
      catalogVirtual.start = -1;
      catalogVirtual.end = -1;
      catalogVirtual.active = true;
      renderVirtualCatalogWindow(seriesView.episodes);
      return;
    }
    catalogVirtual.active = false;
    els.catalogGrid.innerHTML = seriesView.episodes.map((episode) => channelCard(episode)).join("");
    attachCardEvents(els.catalogGrid);
  }

  function clearSeriesView() {
    seriesRequestId += 1;
    seriesView = null;
    if (els.seriesBackBtn) els.seriesBackBtn.classList.add("is-hidden");
    setLoadPill(false);
  }

  // ---- Title-detail modal ----
  function openTitleModal(channel) {
    if (!channel || !els.titleModal) return;
    currentModalItem = channel;
    const adult = isAdultChannel(channel);
    const art = els.tmodalArt;
    art.className = "tmodal-art";
    art.style.cssText = "";
    if (channel.logo && channel.type !== "live") {
      art.style.backgroundImage = `url('${channel.logo}')`;
    } else {
      art.classList.add("generated");
      art.style.cssText = thumbnailVars(channel);
    }
    els.tmodalTitle.textContent = cleanTitle(channel.title);
    els.tmodalSynopsis.textContent = (channel.description || "").trim()
      || "No description is provided for this title by the IPTV provider.";
    const year = (String(channel.title).match(/\b(19|20)\d{2}\b/) || [])[0] || "";
    els.tmodalYear.textContent = year;
    els.tmodalYear.classList.toggle("is-hidden", !year);
    els.tmodalType.textContent = mediaLabel(channel.type);
    els.tmodalHd.textContent = channel.quality || "HD";
    els.tmodalSide.innerHTML = `
      <p><span class="tmodal-dim">Genre:</span> ${escapeHtml(displayGroupName(channel.group || "Catalog"))}</p>
      <p><span class="tmodal-dim">Quality:</span> ${escapeHtml(channel.quality || "Standard")}</p>
      <p><span class="tmodal-dim">This title is:</span> ${escapeHtml(moodTags(channel))}</p>`;
    syncModalAddBtn(channel.id);
    els.tmodalPlay.querySelector("span").textContent = channel.type === "series" ? "Play E1" : "Play";
    els.tmodalPlay.onclick = () => {
      closeTitleModal();
      if (channel.type === "series") playFirstEpisode(channel);
      else playChannel(channel);
    };
    els.tmodalAdd.onclick = () => { toggleFavorite(channel.id); syncModalAddBtn(channel.id); };
    els.tmodalEpisodes.classList.add("is-hidden");
    els.tmodalEpList.innerHTML = "";
    if (channel.type === "series") loadModalEpisodes(channel);
    els.titleModal.classList.remove("is-hidden");
    document.body.classList.add("modal-open");
    const card = els.titleModal.querySelector(".tmodal-card");
    if (card) card.scrollTop = 0;
    els.tmodalPlay.focus();
  }

  function syncModalAddBtn(id) {
    const saved = isFavorite(id);
    els.tmodalAdd.classList.toggle("is-saved", saved);
    els.tmodalAdd.setAttribute("aria-label", saved ? "Saved to My List" : "Add to My List");
  }

  function moodTags(channel) {
    const g = clean(`${channel.group} ${channel.title}`);
    const tags = [];
    if (/sport|football|soccer|nba|f1|ufc|wwe|cricket/.test(g)) tags.push("Exciting");
    if (/drama/.test(g)) tags.push("Emotional");
    if (/comedy/.test(g)) tags.push("Witty");
    if (/horror|thriller|crime|mystery|suspense/.test(g)) tags.push("Suspenseful");
    if (/kids|cartoon|family|disney/.test(g)) tags.push("Feel-Good");
    if (/news/.test(g)) tags.push("Informative");
    if (/action/.test(g)) tags.push("Adrenaline Rush");
    if (!tags.length) tags.push(channel.type === "series" ? "Bingeable" : "Cinematic");
    return tags.slice(0, 3).join(", ");
  }

  async function loadModalEpisodes(series) {
    const profile = state.profiles.find((p) => p.id === series.profileId);
    if (!profile || profile.type !== "mac") return;
    els.tmodalEpisodes.classList.remove("is-hidden");
    els.tmodalEpCount.textContent = "";
    els.tmodalEpList.innerHTML = `<div class="tmodal-eploading"><span class="spinner"></span><span>Loading episodes…</span></div>`;
    const key = `${series.profileId}|${series.providerId}`;
    try {
      let episodes = seriesEpisodeCache.get(key);
      if (!episodes?.length) { episodes = await fetchMacSeries(profile, series); seriesEpisodeCache.set(key, episodes); }
      if (currentModalItem?.id !== series.id) return;
      episodes.forEach((ep) => channelById.set(ep.id, ep));
      els.tmodalEpCount.textContent = `${formatCount(episodes.length)} episodes`;
      els.tmodalEpList.innerHTML = episodes.map((ep, i) => modalEpisodeRow(ep, i)).join("");
      $$("[data-ep-play]", els.tmodalEpList).forEach((b) => b.addEventListener("click", () => {
        const ep = findChannel(b.dataset.epPlay);
        if (ep) { closeTitleModal(); playChannel(ep); }
      }));
    } catch (error) {
      els.tmodalEpList.innerHTML = `<div class="tmodal-eploading">Episodes unavailable: ${escapeHtml(error.message || "")}</div>`;
    }
  }

  function modalEpisodeRow(ep, index) {
    const num = index + 1;
    const thumb = ep.logo
      ? `<img src="${escapeAttr(ep.logo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`
      : `<span class="tmodal-epgen" style="${thumbnailVars(ep)}"></span>`;
    return `
      <button class="tmodal-eprow" type="button" data-ep-play="${escapeAttr(ep.id)}">
        <span class="tmodal-epnum">${num}</span>
        <span class="tmodal-epthumb">${thumb}<span class="tmodal-epplay"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="icon-fill" d="M8 5.5v13l10-6.5z"></path></svg></span></span>
        <span class="tmodal-epmeta">
          <span class="tmodal-eprowtitle">${escapeHtml(ep.title || `Episode ${num}`)}</span>
          <span class="tmodal-epdesc">${escapeHtml((ep.description || "").trim())}</span>
        </span>
      </button>`;
  }

  function playFirstEpisode(series) {
    const profile = state.profiles.find((p) => p.id === series.profileId);
    if (!profile) return;
    const key = `${series.profileId}|${series.providerId}`;
    const cached = seriesEpisodeCache.get(key);
    if (cached?.length) { playChannel(cached[0]); return; }
    fetchMacSeries(profile, series).then((eps) => {
      if (eps?.length) { seriesEpisodeCache.set(key, eps); eps.forEach((e) => channelById.set(e.id, e)); playChannel(eps[0]); }
      else notify("No episodes", "This series has no playable episodes.");
    }).catch((error) => notify("Series unavailable", error.message || ""));
  }

  function closeTitleModal() {
    if (!els.titleModal) return;
    els.titleModal.classList.add("is-hidden");
    document.body.classList.remove("modal-open");
    currentModalItem = null;
  }

  async function renderStoredCatalog(route, group, query) {
    const profile = currentProfile();
    if (!profile) return;
    catalogVirtual.active = false;
    const nextKey = `${profile.id}|stored|${route}|${group}|${query}`;
    if (nextKey !== catalogRenderKey) {
      catalogRenderKey = nextKey;
      catalogRenderLimit = CATALOG_BATCH_SIZE;
      currentList = [];
      currentCatalogTotal = 0;
      currentCatalogStored = true;
      disconnectCatalogObserver();
    }
    const requestId = ++catalogQueryRequestId;
    els.catalogKicker.textContent = route === "all" ? "All Media" : mediaLabel(route);
    els.catalogTitle.textContent = query ? `Search: ${els.searchInput.value.trim()}` : group === "All" ? routeTitle(route) : group;
    els.catalogMeta.textContent = "Loading saved catalog";
    els.catalogGrid.innerHTML = loadingState("Loading titles", "Only this section is being read from the browser database.");

    try {
      const result = await queryStoredCatalog(profile.id, route, group, query, catalogRenderLimit);
      if (requestId !== catalogQueryRequestId || profile.id !== currentProfileId()) return;
      result.items.forEach((channel) => channelById.set(channel.id, channel));
      currentList = result.items;
      currentCatalogTotal = result.total;
      currentCatalogStored = true;
      els.catalogMeta.textContent = `${formatCount(result.total)} shown`;

      if (await ensureStoredCategoryLoaded(route, group, result.items)) return;

      if (!result.total) {
        disconnectCatalogObserver();
        els.catalogGrid.innerHTML = emptyState("No titles found", "Try another group, route, or search term.");
        return;
      }
      const hasMore = result.items.length < result.total;
      els.catalogGrid.innerHTML = [
        ...result.items.map((channel) => channelCard(channel)),
        hasMore ? loadMoreCard(result.items.length, result.total) : ""
      ].join("");
      attachCardEvents(els.catalogGrid);
      observeCatalogMore();
    } catch (error) {
      if (requestId !== catalogQueryRequestId) return;
      disconnectCatalogObserver();
      els.catalogGrid.innerHTML = emptyState("Catalog unavailable", error.message || "Could not read saved titles.", "error");
    }
  }

  function renderVirtualCatalogWindow(list) {
    if (!list.length) return;
    const gap = 14;
    const minCardWidth = 210;
    const rowHeight = 222;
    const width = Math.max(els.catalogGrid.clientWidth || minCardWidth, minCardWidth);
    const columns = Math.max(1, Math.floor((width + gap) / (minCardWidth + gap)));
    const gridTop = els.catalogGrid.getBoundingClientRect().top + window.scrollY;
    const viewportTop = Math.max(0, window.scrollY - gridTop);
    const buffer = Math.max(window.innerHeight || 720, 700);
    const startRow = Math.max(0, Math.floor((viewportTop - buffer) / rowHeight));
    const visibleRows = Math.max(4, Math.ceil(((window.innerHeight || 720) + buffer * 2) / rowHeight));
    const start = Math.min(list.length, startRow * columns);
    const end = Math.min(list.length, (startRow + visibleRows) * columns);
    if (start === catalogVirtual.start && end === catalogVirtual.end && els.catalogGrid.children.length) return;
    catalogVirtual.start = start;
    catalogVirtual.end = end;
    const topRows = Math.floor(start / columns);
    const endRows = Math.ceil(end / columns);
    const totalRows = Math.ceil(list.length / columns);
    const topHeight = topRows * rowHeight;
    const bottomHeight = Math.max(0, (totalRows - endRows) * rowHeight);
    const visible = list.slice(start, end);
    els.catalogGrid.innerHTML = [
      topHeight ? `<span class="virtual-spacer" style="height:${topHeight}px"></span>` : "",
      ...visible.map((channel) => channelCard(channel)),
      bottomHeight ? `<span class="virtual-spacer" style="height:${bottomHeight}px"></span>` : ""
    ].join("");
    attachCardEvents(els.catalogGrid);
  }

  function scheduleVirtualCatalogRender() {
    if (!catalogVirtual.active || currentCatalogStored || currentList.length <= CATALOG_BATCH_SIZE) return;
    if (catalogVirtual.scrollFrame) return;
    catalogVirtual.scrollFrame = window.requestAnimationFrame(() => {
      catalogVirtual.scrollFrame = 0;
      renderVirtualCatalogWindow(currentList);
    });
  }

  function loadMoreCatalog() {
    const total = currentCatalogStored ? currentCatalogTotal : currentList.length;
    if (!total || catalogRenderLimit >= total) return;
    catalogRenderLimit = Math.min(total, catalogRenderLimit + CATALOG_BATCH_STEP);
    renderCatalog();
  }

  function loadMoreCard(shown, total) {
    return `
      <button class="catalog-more" type="button" data-load-more>
        <span class="spinner"></span>
        <strong>Loading more</strong>
        <small>${formatCount(shown)} of ${formatCount(total)} shown</small>
      </button>
    `;
  }

  function observeCatalogMore() {
    disconnectCatalogObserver();
    const target = $("[data-load-more]", els.catalogGrid);
    if (!target) return;
    if (!("IntersectionObserver" in window)) return;
    catalogObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMoreCatalog();
    }, { rootMargin: "500px 0px" });
    catalogObserver.observe(target);
  }

  function disconnectCatalogObserver() {
    if (!catalogObserver) return;
    catalogObserver.disconnect();
    catalogObserver = null;
  }

  function attachCardEvents(root) {
    root.dataset.delegated = "true";
  }

  function handleCardAction(event) {
    const root = event.currentTarget;

    const railArrowBtn = event.target.closest("[data-rail-dir]");
    if (railArrowBtn && root.contains(railArrowBtn)) {
      event.stopPropagation();
      const rail = railArrowBtn.parentElement.querySelector(".rail");
      if (rail) {
        const dir = railArrowBtn.dataset.railDir === "prev" ? -1 : 1;
        rail.scrollBy({ left: dir * Math.max(rail.clientWidth * 0.86, 320), behavior: "smooth" });
      }
      return;
    }

    const loadMore = event.target.closest("[data-load-more]");
    if (loadMore && root.contains(loadMore)) {
      event.stopPropagation();
      loadMoreCatalog();
      return;
    }

    const removeHistory = event.target.closest("[data-remove-history]");
    if (removeHistory && root.contains(removeHistory)) {
      event.stopPropagation();
      removeHistoryItem(removeHistory.dataset.removeHistory);
      return;
    }

    const favorite = event.target.closest("[data-favorite]");
    if (favorite && root.contains(favorite)) {
      event.stopPropagation();
      toggleFavorite(favorite.dataset.favorite);
      return;
    }

    const openTitle = event.target.closest("[data-open-title]");
    if (openTitle && root.contains(openTitle)) {
      event.stopPropagation();
      const channel = findChannel(openTitle.dataset.openTitle);
      if (channel) openTitleModal(channel);
      return;
    }

    const play = event.target.closest("[data-play]");
    if (play && root.contains(play)) {
      event.stopPropagation();
      const channel = findChannel(play.dataset.play);
      if (channel) playChannel(channel);
      return;
    }

    const series = event.target.closest("[data-open-series]");
    if (series && root.contains(series)) {
      event.stopPropagation();
      const channel = findChannel(series.dataset.openSeries);
      if (channel) openSeries(channel);
      return;
    }

    const group = event.target.closest("[data-open-group]");
    if (group && root.contains(group)) {
      activeRoute = group.dataset.route || activeRoute;
      activeGroup = group.dataset.openGroup || "All";
      clearSeriesView();
      render();
      document.querySelector(".catalog-shell")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ===== Netflix-style hover preview that floats above neighbouring cards =====
  let hoverOpenTimer = null;
  let hoverCloseTimer = null;
  let hoverActiveCard = null;
  let hoverPreviewEl = null;
  const HOVER_OPEN_DELAY = 420;

  function hoverSupported() {
    return typeof window.matchMedia !== "function" || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function setupHoverPreview() {
    if (!hoverSupported()) return;
    // Works on the Home rails AND the Browse / Live TV / Movies / Series grid.
    [els.homeView, els.catalogGrid].forEach((root) => {
      if (!root) return;
      root.addEventListener("mouseover", onHoverOver);
      root.addEventListener("mouseout", onHoverOut);
    });
    window.addEventListener("scroll", closeHoverPreview, true);
  }

  function onHoverOver(event) {
    const card = event.target.closest("article.poster-card");
    if (!card) return;
    clearTimeout(hoverCloseTimer);
    if (card === hoverActiveCard) return;
    clearTimeout(hoverOpenTimer);
    hoverOpenTimer = setTimeout(() => openHoverPreview(card), HOVER_OPEN_DELAY);
  }

  function onHoverOut(event) {
    const card = event.target.closest("article.poster-card");
    if (!card) return;
    const to = event.relatedTarget;
    if (to && (card.contains(to) || (hoverPreviewEl && hoverPreviewEl.contains(to)))) return;
    clearTimeout(hoverOpenTimer);
    scheduleHoverClose();
  }

  function scheduleHoverClose() {
    clearTimeout(hoverCloseTimer);
    hoverCloseTimer = setTimeout(closeHoverPreview, 150);
  }

  function ensureHoverPreviewEl() {
    if (hoverPreviewEl) return hoverPreviewEl;
    hoverPreviewEl = document.createElement("div");
    hoverPreviewEl.className = "hover-preview";
    hoverPreviewEl.addEventListener("mouseenter", () => clearTimeout(hoverCloseTimer));
    hoverPreviewEl.addEventListener("mouseleave", scheduleHoverClose);
    hoverPreviewEl.addEventListener("click", (event) => {
      handleCardAction({ currentTarget: hoverPreviewEl, target: event.target, stopPropagation() {} });
      if (event.target.closest("[data-play],[data-open-title],[data-open-series],[data-open-group],[data-remove-history]")) closeHoverPreview();
    });
    return hoverPreviewEl;
  }

  function openHoverPreview(card) {
    if (!document.body.contains(card)) return;
    const channel = findChannel(card.dataset.cardId);
    if (!channel) return;
    const el = ensureHoverPreviewEl();
    el.innerHTML = hoverPreviewMarkup(channel);
    if (el.parentElement !== document.body) document.body.appendChild(el);
    // Match the preview artwork to the card's own aspect (portrait poster -> portrait
    // preview, landscape thumb -> landscape preview) so the image is never cropped ugly.
    const artEl = card.querySelector(".poster-art");
    const aRect = (artEl || card).getBoundingClientRect();
    const artAspect = aRect.height ? Math.max(0.62, Math.min(1.78, aRect.width / aRect.height)) : 1.6;
    // Fixed positioning over the viewport: the preview grows centred on the card
    // and floats above everything, so it works in rails and the grid alike.
    const cardRect = card.getBoundingClientRect();
    const w = Math.round(cardRect.width * 1.34);
    el.style.width = w + "px";
    const artNode = el.querySelector(".hp-art");
    if (artNode) artNode.style.height = Math.round(w / artAspect) + "px";
    const ph = el.offsetHeight || Math.round(w / artAspect + 120);
    let left = Math.round(cardRect.left + cardRect.width / 2 - w / 2);
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = Math.round(cardRect.top + cardRect.height / 2 - ph / 2);
    top = Math.max(64, Math.min(top, window.innerHeight - ph - 12));
    el.style.left = left + "px";
    el.style.top = top + "px";
    hoverActiveCard = card;
    el.style.opacity = "0";
    setTimeout(() => { if (hoverActiveCard === card) { el.style.opacity = ""; el.classList.add("is-open"); } }, 30);
  }

  function closeHoverPreview() {
    clearTimeout(hoverOpenTimer);
    hoverActiveCard = null;
    if (hoverPreviewEl) hoverPreviewEl.classList.remove("is-open");
  }

  function hoverPreviewMarkup(channel) {
    const canPlay = channel.url || channel.macCommand;
    const canOpenSeries = channel.type === "series" && !channel.isEpisode && Boolean(channel.providerId);
    const playAttr = canPlay
      ? `data-play="${escapeAttr(channel.id)}"`
      : canOpenSeries ? `data-open-series="${escapeAttr(channel.id)}"` : "";
    const titleAttr = channel.type === "series"
      ? `data-open-title="${escapeAttr(channel.id)}"`
      : canPlay
        ? `data-play="${escapeAttr(channel.id)}"`
        : `data-open-title="${escapeAttr(channel.id)}"`;
    const img = channel.logo ? `<img src="${escapeAttr(channel.logo)}" alt="" decoding="async" onerror="this.remove()">` : "";
    const infoBtn = (channel.type === "movie" || channel.type === "series")
      ? `<button class="hp-round hp-info" data-open-title="${escapeAttr(channel.id)}" type="button" aria-label="More info"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>`
      : "";
    // Netflix-style circular "remove from Continue Watching" button in the action row.
    const inHistory = Array.isArray(state.history) && state.history.some((e) => e && e.id === channel.id);
    const removeBtn = inHistory
      ? `<button class="hp-round hp-remove" data-remove-history="${escapeAttr(channel.id)}" type="button" aria-label="Remove from Continue Watching" title="Remove from Continue Watching"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></button>`
      : "";
    return `
      <button class="hp-art ${channel.logo ? "has-logo" : ""}" ${titleAttr} type="button" style="${thumbnailVars(channel)}" aria-label="${escapeAttr(cleanTitle(channel.title))}">
        ${img}
        <span class="hp-art-grad"></span>
        <span class="hp-art-title">${escapeHtml(cleanTitle(channel.title))}</span>
      </button>
      <div class="hp-body">
        <div class="hp-actions">
          <button class="hp-play" ${playAttr} ${canPlay || canOpenSeries ? "" : "disabled"} type="button" aria-label="${canPlay ? "Play" : canOpenSeries ? "Episodes" : "Unavailable"}">${playActionIcon()}</button>
          <button class="hp-round save-action ${isFavorite(channel.id) ? "is-saved" : ""}" data-favorite="${escapeAttr(channel.id)}" type="button" aria-label="${isFavorite(channel.id) ? "Saved" : "Add to list"}">${saveActionIcon()}</button>
          ${removeBtn}
          ${infoBtn}
        </div>
        <div class="hp-meta">
          <span class="hp-quality">${escapeHtml(channel.quality || mediaLabel(channel.type))}</span>
          <span class="hp-tags">${escapeHtml(moodTags(channel))}</span>
        </div>
      </div>`;
  }

  function channelCard(channel, compact = false, removableHistory = false) {
    const canPlay = channel.url || channel.macCommand;
    const canOpenSeries = channel.type === "series" && !channel.isEpisode && Boolean(channel.providerId);
    const actionAttribute = canPlay
      ? `data-play="${escapeHtml(channel.id)}"`
      : canOpenSeries
        ? `data-open-series="${escapeHtml(channel.id)}"`
        : "";
    // Clicking the artwork plays movies & live channels immediately; series open the
    // detail modal (episode list). Items with no stream fall back to the detail modal.
    const artAttribute = channel.type === "series"
      ? `data-open-title="${escapeHtml(channel.id)}"`
      : canPlay
        ? `data-play="${escapeHtml(channel.id)}"`
        : `data-open-title="${escapeHtml(channel.id)}"`;
    const hasLogo = Boolean(channel.logo);
    const artClass = ` generated-thumb ${channel.type === "live" ? "live-thumb" : ""} ${hasLogo ? "has-logo" : ""}`;
    const art = ` style="${thumbnailVars(channel)}"`;
    const logoImg = hasLogo
      ? `<img class="thumb-image ${channel.type === "live" ? "live-logo" : "poster-logo"}" src="${escapeAttr(channel.logo)}" alt="" loading="lazy" decoding="async" fetchpriority="low" onerror="this.remove()">`
      : "";
    return `
      <article class="poster-card${compact ? " is-compact" : ""}" data-card-id="${escapeHtml(channel.id)}" data-kind="${escapeHtml(channel.type)}">
        ${removableHistory ? `<button class="history-remove" type="button" data-remove-history="${escapeHtml(channel.id)}" aria-label="Remove ${escapeHtml(cleanTitle(channel.title))} from Continue Watching">&times;</button>` : ""}
        <span class="poster-media">
          <button class="poster-art${artClass}" ${artAttribute} type="button" aria-label="${escapeHtml(cleanTitle(channel.title))}"${art}>
            ${generatedThumbContent(channel)}
            ${logoImg}
          </button>
          <span class="card-actions">
            <button class="primary-btn watch-action" ${actionAttribute} ${canPlay || canOpenSeries ? "" : "disabled"}>
              ${playActionIcon()}
              <span>${canPlay ? "Play" : canOpenSeries ? "Episodes" : "Unavailable"}</span>
            </button>
            <button class="ghost-btn save-action ${isFavorite(channel.id) ? "is-saved" : ""}" data-favorite="${escapeHtml(channel.id)}" aria-label="${isFavorite(channel.id) ? "Saved" : "Add to list"}" title="${isFavorite(channel.id) ? "Saved" : "Add to list"}">
              ${saveActionIcon()}
            </button>
            ${(channel.type === "movie" || channel.type === "series") ? `<button class="ghost-btn info-action" data-open-title="${escapeHtml(channel.id)}" aria-label="More info" title="More info"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>` : ""}
          </span>
        </span>
        <span class="poster-info">
          <strong>${escapeHtml(cleanTitle(channel.title))}</strong>
          <span>${escapeHtml(channel.group || mediaLabel(channel.type))}</span>
          <em>${escapeHtml(channel.quality || mediaLabel(channel.type))}</em>
          <span class="poster-tags">${escapeHtml(moodTags(channel))}</span>
        </span>
      </article>
    `;
  }

  function playActionIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path class="icon-fill" d="M8 5.5v13l10-6.5z"></path>
      </svg>
    `;
  }

  function saveActionIcon() {
    return `
      <svg class="icon-plus" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14"></path>
      </svg>
      <svg class="icon-check" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.2 4.2L19 7"></path>
      </svg>
    `;
  }

  function generatedThumbContent(channel) {
    const badge = channel.type === "live" ? "LIVE" : mediaLabel(channel.type).toUpperCase();
    return `
      <span class="thumb-badge">${escapeHtml(badge)}</span>
      <span class="thumb-mark">${escapeHtml(initials(channel.title))}</span>
      <span class="thumb-title">${escapeHtml(cleanTitle(channel.title))}</span>
    `;
  }

  function thumbnailVars(channel) {
    const palettes = [
      ["#0f8bff", "#0b1b34", "#66e6ff"],
      ["#11a874", "#06291f", "#a8ffdc"],
      ["#ef476f", "#35101d", "#ffd1dc"],
      ["#f59f00", "#321b00", "#ffe29a"],
      ["#7c3aed", "#1d1035", "#dec7ff"],
      ["#14b8a6", "#082f33", "#bffcf4"],
      ["#64748b", "#111827", "#f8fafc"]
    ];
    const seed = parseInt(hash(`${channel.id}|${channel.title}|${channel.group}`), 36) || 0;
    const pair = palettes[Math.abs(seed) % palettes.length];
    return `--thumb-a:${pair[0]};--thumb-b:${pair[1]};--thumb-c:${pair[2]};`;
  }

  function groupCard(group, route) {
    const category = {
      id: `group-${route}-${group.name}`,
      title: group.name,
      group: route,
      type: route
    };
    return `
      <button class="poster-card" data-open-group="${escapeHtml(group.name)}" data-route="${escapeHtml(route)}" data-kind="${escapeHtml(route)}" type="button">
        <span class="poster-art generated-thumb category-thumb ${route === "live" ? "live-thumb" : ""}" style="${thumbnailVars(category)}">
          ${generatedThumbContent(category)}
        </span>
        <span class="poster-info">
          <strong>${escapeHtml(group.name)}</strong>
          <span>${formatCount(group.count)} ${escapeHtml(itemLabel(route))}</span>
          <em>${escapeHtml(mediaLabel(route))}</em>
        </span>
      </button>
    `;
  }

  function ensureCategoryLoaded(route, group, list) {
    if (route !== "movie" && route !== "series") return false;
    if (group === "All" || group === "Favorites" || group === "Recently Watched") return false;
    const profile = currentProfile();
    if (!profile?.portal) return false;
    const placeholders = channelsForRoute(route).filter((channel) => (
      channel.catalogOnly
      && displayGroupName(channel.group) === group
      && !hasLoadedCategory(channel)
    ));
    if (!placeholders.length) return false;
    const placeholder = placeholders[0];
    const key = `${profile.id}:${route}:${placeholder.categoryId}`;
    if (loadingKey === key) return true;
    loadingKey = key;
    setLoadPill(true, `Loading ${group}`);
    fetchMacCategory(profile, placeholder)
      .then(async (loaded) => {
        const existing = new Set(channels.map((channel) => channel.id));
        const fresh = loaded.filter((channel) => !existing.has(channel.id));
        setChannels([...channels, ...fresh]);
        await putChannels(fresh);
        updateCurrentProfileSummary();
        saveState();
        notify("Category loaded", `${fresh.length} ${itemLabel(route)} added.`);
      })
      .catch((error) => notify("Category failed", error.message || "Could not load this group."))
      .finally(() => {
        loadingKey = "";
        setLoadPill(false);
        render();
      });
    return true;
  }

  function shouldUseStoredCatalog(route) {
    const profile = currentProfile();
    return Boolean(profile && profile.id !== DEMO_ID && !loadedProfileIds.has(profile.id) && hasStoredCatalogMeta(profile) && route !== "home");
  }

  async function queryStoredCatalog(profileId, route, group, query, limit) {
    const db = await openDb();
    const favorites = group === "Favorites" || route === "favorites" ? favoriteSet : null;
    const recentIds = group === "Recently Watched" ? new Set(state.history.map((entry) => entry.id)) : null;
    const rows = [];
    const adultRows = [];
    let total = 0;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const useTypeIndex = route !== "all" && route !== "favorites";
      const source = useTypeIndex ? store.index("profileType") : store.index("profileId");
      const range = useTypeIndex
        ? IDBKeyRange.only([profileId, route])
        : IDBKeyRange.only(profileId);
      const req = source.openCursor(range);
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) {
          resolve();
          return;
        }
        const channel = normalizeChannel(cursor.value);
        if (channel && storedCatalogMatch(channel, route, group, query, favorites, recentIds)) {
          total += 1;
          const deferAdult = !isAdultGroupName(group) && (channel.adultNormalized ?? isAdultChannel(channel));
          if (deferAdult) {
            if (adultRows.length < limit) adultRows.push(channel);
          } else if (rows.length < limit) rows.push(channel);
        }
        cursor.continue();
      };
      req.onerror = () => reject(req.error || new Error("Could not query saved catalog"));
    });
    const items = rows.length < limit ? rows.concat(adultRows.slice(0, limit - rows.length)) : rows;
    items.sort((a, b) => compareCatalogChannels(a, b, group));
    return { items: items.slice(0, limit), total };
  }

  function storedCatalogMatch(channel, route, group, query, favorites, recentIds) {
    if (channel.catalogOnly) return false;
    if (!typeMatches(channel, route)) return false;
    if (favorites && !favorites.has(channel.id)) return false;
    if (recentIds && !recentIds.has(channel.id)) return false;
    if (group !== "All" && group !== "Favorites" && group !== "Recently Watched" && !groupMatches(channel, group)) return false;
    if (query && !(channel.searchText || clean(`${channel.title} ${channel.group} ${channel.description || ""}`)).includes(query)) return false;
    return true;
  }

  async function ensureStoredCategoryLoaded(route, group, list) {
    if (route !== "movie" && route !== "series") return false;
    if (group === "All" || group === "Favorites" || group === "Recently Watched") return false;
    if (list.length) return false;
    const profile = currentProfile();
    if (!profile?.portal) return false;
    const placeholder = await findStoredCategoryPlaceholder(profile.id, route, group);
    if (!placeholder) return false;
    const key = `${profile.id}:${route}:${placeholder.categoryId}`;
    if (loadingKey === key) return true;
    loadingKey = key;
    setLoadPill(true, `Loading ${group}`);
    els.catalogGrid.innerHTML = loadingState("Loading this category", "The portal is returning this movie or series group.");
    fetchMacCategory(profile, placeholder)
      .then(async (loaded) => {
        const fresh = loaded.filter((channel) => channel && !channelById.has(channel.id));
        appendProfileChannelsInMemory(profile.id, fresh);
        await putChannels(fresh);
        mergeCatalogMetaLoadedCategory(profile, route, group, fresh);
        saveState();
        notify("Category loaded", `${fresh.length} ${itemLabel(route)} added.`);
      })
      .catch((error) => notify("Category failed", error.message || "Could not load this group."))
      .finally(() => {
        loadingKey = "";
        setLoadPill(false);
        render();
      });
    return true;
  }

  async function findStoredCategoryPlaceholder(profileId, route, group) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).index("profileType").openCursor(IDBKeyRange.only([profileId, route]));
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) {
          resolve(null);
          return;
        }
        const channel = normalizeChannel(cursor.value);
        if (channel?.catalogOnly && groupMatches(channel, group)) {
          resolve(channel);
          return;
        }
        cursor.continue();
      };
      req.onerror = () => reject(req.error || new Error("Could not read category"));
    });
  }

  function filteredChannels(route, group, query) {
    let base = channelsForRoute(route).filter((channel) => !channel.catalogOnly);
    if (group === "Favorites") base = base.filter((channel) => isFavorite(channel.id));
    else if (group === "Recently Watched") {
      const ids = new Set(state.history.map((entry) => entry.id));
      base = base.filter((channel) => ids.has(channel.id));
    } else if (group !== "All") base = base.filter((channel) => groupMatches(channel, group));
    if (query) base = base.filter((channel) => (channel.searchText || clean(`${channel.title} ${channel.group} ${channel.description || ""}`)).includes(query));
    return base.sort((a, b) => compareCatalogChannels(a, b, group));
  }

  function groupEntries(route) {
    const profile = currentProfile();
    if (profile && !loadedProfileIds.has(profile.id) && hasStoredCatalogMeta(profile)) {
      const groups = profile.catalogMeta.groups?.[route] || [];
      if (groups.length) return groups.slice().sort(compareCategoryGroups);
    }
    const cacheKey = `${currentProfileId()}|${route}`;
    if (catalogCache.groups.has(cacheKey)) return catalogCache.groups.get(cacheKey);
    const map = new Map();
    channelsForRoute(route).forEach((channel) => {
      const names = route === "live" ? smartGroups(channel) : [displayGroupName(channel.group || "Other")];
      names.forEach((name) => {
        if (!name) return;
        const displayName = displayGroupName(name);
        const entry = map.get(displayName) || { name: displayName, count: 0 };
        entry.count += channel.catalogOnly && hasLoadedCategory(channel) ? 0 : 1;
        map.set(displayName, entry);
      });
    });
    const groups = Array.from(map.values())
      .filter((group) => group.count > 0)
      .sort(compareCategoryGroups);
    catalogCache.groups.set(cacheKey, groups);
    return groups;
  }

  function topGroups(route, limit) {
    return groupEntries(route)
      .filter((group) => group.name !== "Other" && !isAdultGroupName(group.name))
      .slice(0, limit);
  }

  function compareCategoryGroups(a, b) {
    const adultA = isAdultGroupName(a.name);
    const adultB = isAdultGroupName(b.name);
    if (adultA !== adultB) return adultA ? 1 : -1;
    return b.count - a.count || a.name.localeCompare(b.name);
  }

  function isAdultGroupName(name = "") {
    return /adult|for adults|xxx|18\s*\+|erotic|porn|brazzers|hustler|playboy/i.test(String(name));
  }

  function isAdultChannel(channel) {
    return Boolean(channel?.adult)
      || isAdultGroupName(`${channel?.group || ""} ${channel?.title || ""} ${channel?.description || ""}`);
  }

  function compareCatalogChannels(a, b, group = "") {
    if (!isAdultGroupName(group)) {
      const adultSort = Number(a.adultNormalized ?? isAdultChannel(a)) - Number(b.adultNormalized ?? isAdultChannel(b));
      if (adultSort) return adultSort;
    }
    const qualitySort = (b.qualityRank || 0) - (a.qualityRank || 0);
    if (qualitySort && group !== "All") return qualitySort;
    return (isFavorite(b.id) - isFavorite(a.id)) || (a.sortTitle || a.title).localeCompare(b.sortTitle || b.title);
  }

  function limitGroupsKeepingAdult(groups, limit) {
    if (groups.length <= limit) return groups;
    const adultGroups = groups.filter((group) => isAdultGroupName(group.name));
    if (!adultGroups.length) return groups.slice(0, limit);
    const adultCount = Math.min(adultGroups.length, limit);
    const regularGroups = groups.filter((group) => !isAdultGroupName(group.name));
    return [...regularGroups.slice(0, Math.max(0, limit - adultCount)), ...adultGroups.slice(0, adultCount)];
  }

  function channelsForRoute(route) {
    const profileId = currentProfileId();
    const cacheKey = `${profileId}|${route}`;
    if (catalogCache.routes.has(cacheKey)) return catalogCache.routes.get(cacheKey);
    const list = channels.filter((channel) => channel.profileId === profileId && typeMatches(channel, route));
    catalogCache.routes.set(cacheKey, list);
    return list;
  }

  function typeMatches(channel, route) {
    if (route === "home" || route === "all") return true;
    if (route === "favorites") return isFavorite(channel.id);
    return channel.type === route;
  }

  function routeType() {
    if (activeRoute === "home") return "all";
    if (activeRoute === "favorites") return "favorites";
    return activeRoute;
  }

  async function playChannel(channel, options = {}) {
    if (!channel.url && !channel.macCommand) {
      notify("No stream yet", channel.type === "series" ? "This series title does not expose an episode stream yet." : "This item has no playable stream.");
      return;
    }

    if (!options.recovering && !options.pinCleared && isAdultLocked(channel)) {
      const unlocked = await requestPin();
      if (!unlocked) { notify("Locked", "Enter the parental PIN to play this channel."); return; }
    }

    const sessionId = ++playbackSessionId;
    if (options.recovering) {
      lastProgressAt = Date.now();
      waitStartedAt = null;
    } else {
      startPlaybackSession(channel);
    }

    // Open the player the instant you click — show it with a loading state immediately,
    // instead of waiting for the stream link to resolve first.
    if (!options.recovering) {
      state.currentChannelId = channel.id;
      playerVisible = true;
      renderPlayerVisibility();
      renderPlaybackSelection(channel);
      els.watchStage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setPlayerStatus("Loading", true);

    let source;
    try {
      source = await playableSource(channel, { forceRelink: options.forceRelink });
    } catch (error) {
      if (sessionId !== playbackSessionId) return;
      notify("Stream unavailable", friendlyClientError(error));
      setPlayerStatus("Issue");
      return;
    }
    if (sessionId !== playbackSessionId) return;

    destroyPlayers();
    state.currentChannelId = channel.id;
    playerVisible = true;
    renderPlayerVisibility();
    els.player.volume = state.volume;
    els.player.muted = state.muted;
    renderPlaybackSelection(channel);
    currentSourceFormat = options.formatOverride || source.format;
    setupSource(source.url, currentSourceFormat);
    applyAspectRatio();
    applyStablePlaybackRate("play");
    rememberHistory(channel);
    pendingResumeId = (!isLivePlayback() && !options.recovering) ? channel.id : "";
    saveState();
    setPlayerStatus("Loading", true);
    els.watchStage.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      await els.player.play();
      scheduleIdleRender(900);
    } catch (error) {
      if (sessionId !== playbackSessionId || isInterruptedPlay(error)) return;
      if (error?.name === "NotAllowedError") {
        notify("Autoplay blocked", "Press play in the player controls.");
      } else {
        notify("Playback issue", "The browser could not start this stream.");
      }
      setPlayerStatus("Issue");
    }
  }

  function renderPlaybackSelection(channel) {
    els.playerEmpty.classList.add("is-hidden");
    els.nowKind.textContent = mediaLabel(channel.type);
    els.nowTitle.textContent = cleanTitle(channel.title);
    els.nowMeta.textContent = `${channel.group || "Catalog"} - ${channel.quality || "Stream"}`;
    if (els.playerBarTitle) els.playerBarTitle.textContent = cleanTitle(channel.title);
    renderHero();
    updatePlayerChrome();
    showPlayerChrome(false);
  }

  async function playableSource(channel, { forceRelink = false } = {}) {
    if (!channel.macCommand) {
      return { url: channel.url, format: channel.streamFormat || inferStreamFormat(channel.url) };
    }
    // For MAC channels, only replay the cached URL when NOT forcing a relink — Stalker
    // create_link tokens expire within seconds, so recovery must request a fresh link.
    if (channel.url && !forceRelink) {
      return { url: channel.url, format: channel.streamFormat || inferStreamFormat(channel.url) };
    }
    const profile = state.profiles.find((item) => item.id === channel.profileId);
    if (!profile) throw new Error("Profile missing for this item.");
    const response = await fetch(`${location.origin}/api/mac/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portal: profile.portal,
        mac: profile.mac,
        endpoint: channel.macEndpoint,
        mediaType: channel.mediaType || channel.type,
        type: channel.type,
        command: channel.macCommand,
        seriesEpisode: channel.seriesEpisode,
        url: forceRelink ? "" : channel.url,
        forceRelink,
        providerId: channel.providerId,
        title: channel.title
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Stream failed");
    channel.url = data.url || channel.url;
    channel.streamFormat = data.format || channel.streamFormat || inferStreamFormat(channel.url);
    return { url: data.url, format: channel.streamFormat };
  }

  function setupSource(url, format = "") {
    const mediaFormat = format || inferStreamFormat(url);
    if (mediaFormat === "hls" && window.Hls && Hls.isSupported()) {
      hls = new Hls(stableHlsConfig());
      hls.loadSource(url);
      hls.attachMedia(els.player);
      hls.on(Hls.Events.ERROR, (_, data) => {
        playbackDiagnostics.hlsErrors.push({
          at: Date.now(),
          type: data?.type || "",
          details: data?.details || "",
          fatal: Boolean(data?.fatal)
        });
        playbackDiagnostics.hlsErrors = playbackDiagnostics.hlsErrors.slice(-12);
        if (!data?.fatal) return;
        if (!hls) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          notify("Stream recovery", "A media stall was repaired automatically.");
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          setPlayerStatus("Buffering", true);
        } else {
          notify("HLS issue", data.details || "The stream stopped.");
        }
      });
      return;
    }
    const supportsMpegTs = window.mpegts?.getFeatureList?.().mseLivePlayback || window.mpegts?.isSupported?.();
    if ((mediaFormat === "mpegts" || mediaFormat === "flv") && supportsMpegTs) {
      mpegtsPlayer = mpegts.createPlayer({ type: mediaFormat === "flv" ? "flv" : "mpegts", url, isLive: true }, stableMpegTsConfig());
      mpegtsPlayer.attachMediaElement(els.player);
      mpegtsPlayer.on(window.mpegts.Events.ERROR, (_, detail) => {
        playbackDiagnostics.streamErrors.push({ at: Date.now(), detail: String(detail || "MPEG-TS error") });
        playbackDiagnostics.streamErrors = playbackDiagnostics.streamErrors.slice(-12);
        recoverStalledPlayback(String(detail || "MPEG-TS media error"));
      });
      mpegtsPlayer.load();
      return;
    }
    els.player.src = url;
    els.player.load();
  }

  function stableHlsConfig() {
    return {
      lowLatencyMode: false,
      maxLiveSyncPlaybackRate: STABLE_LIVE_RATE,
      liveSyncDurationCount: 4,
      maxBufferLength: 24,
      maxMaxBufferLength: 60,
      backBufferLength: 30,
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 3,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 3,
      abrBandWidthFactor: 0.8,
      abrBandWidthUpFactor: 0.6,
      abrEwmaFastLive: 5,
      abrEwmaSlowLive: 15,
      capLevelToPlayerSize: true,
      testBandwidth: true,
      enableWorker: true,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 4,
      fragLoadingRetryDelay: 800,
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 15000
    };
  }

  function stableMpegTsConfig() {
    return {
      enableWorker: true,
      enableStashBuffer: true,
      stashInitialSize: 384 * 1024,
      liveBufferLatencyChasing: false,
      lazyLoad: false
    };
  }

  function destroyPlayers() {
    window.clearTimeout(controlsHideTimer);
    els.playerCard.classList.remove("is-chrome-hidden");
    els.playerCard.dataset.buffering = "false";
    try {
      els.player.pause();
    } catch {
      // Media may already be detached while switching streams.
    }
    if (hls) {
      hls.destroy();
      hls = null;
    }
    if (mpegtsPlayer) {
      mpegtsPlayer.destroy();
      mpegtsPlayer = null;
    }
    els.player.removeAttribute("src");
    els.player.load();
  }

  async function closePlayer() {
    playbackSessionId += 1;
    playerVisible = false;
    waitStartedAt = null;
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // PiP may already be closing.
      }
    }
    if (document.fullscreenElement === els.playerCard) {
      try {
        await document.exitFullscreen();
      } catch {
        // Fullscreen may already be closing.
      }
    }
    destroyPlayers();
    state.currentChannelId = "";
    setPlayerStatus("Ready");
    hideEpgPanel();
    saveState();
    renderPlayerVisibility();
    renderHero();
    updatePlayerChrome();
  }

  function togglePlay() {
    if (els.player.paused) {
      els.player.play().catch((error) => {
        if (!isInterruptedPlay(error)) notify("Playback blocked", "Press play again in the player.");
      });
    }
    else els.player.pause();
  }

  function isInterruptedPlay(error) {
    const message = String(error?.message || "");
    return error?.name === "AbortError"
      || /interrupted by a call to pause/i.test(message)
      || /interrupted by a new load request/i.test(message);
  }

  function stepChannel(direction) {
    if (!currentList.length) currentList = filteredChannels(routeType(), activeGroup, clean(els.searchInput.value));
    const currentId = state.currentChannelId;
    const index = Math.max(0, currentList.findIndex((channel) => channel.id === currentId));
    const next = currentList[(index + direction + currentList.length) % currentList.length];
    if (next) playChannel(next);
  }

  function updatePlayerChrome() {
    const channel = currentChannel();
    const live = isLivePlayback();
    els.volumeRange.value = String(els.player.volume || state.volume);
    if (els.speedBtn) { els.speedBtn.disabled = live; els.speedBtn.style.opacity = live ? ".45" : ""; }
    if (live) closeSpeedMenu();
    updateSpeedMenuActive();
    els.playerEmpty.classList.toggle("is-hidden", Boolean(channel));
    els.nowKind.textContent = channel ? mediaLabel(channel.type) : "Ready";
    els.nowTitle.textContent = cleanTitle(channel?.title) || "ORKXTRA";
    if (els.playerBarTitle) els.playerBarTitle.textContent = cleanTitle(channel?.title || "");
    els.nowMeta.textContent = channel ? `${channel.group || "Catalog"} - ${channel.quality || "Stream"}` : "No stream selected";
    const paused = els.player.paused;
    const muted = els.player.muted || els.player.volume === 0;
    els.playPauseBtn.classList.toggle("is-playing", !paused);
    els.playPauseBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
    els.playPauseBtn.title = paused ? "Play" : "Pause";
    els.muteBtn.classList.toggle("is-muted", muted);
    els.muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    els.muteBtn.title = muted ? "Unmute" : "Mute";
    if (live) {
      els.seekRange.disabled = true;
      els.seekRange.value = "1000";
      els.seekRange.style.setProperty("--seek-pct", "100%");
      els.seekRange.style.setProperty("--buffered-pct", "100%");
      if (els.playerTime) els.playerTime.textContent = "● LIVE";
    } else if (Number.isFinite(els.player.duration) && els.player.duration > 0) {
      els.seekRange.disabled = false;
      const pct = (els.player.currentTime / els.player.duration) * 100;
      els.seekRange.value = String(Math.round(pct * 10));
      els.seekRange.style.setProperty("--seek-pct", `${pct.toFixed(2)}%`);
      els.seekRange.style.setProperty("--buffered-pct", `${Math.min(100, (bufferedEnd() / els.player.duration) * 100).toFixed(2)}%`);
      if (els.playerTime) els.playerTime.textContent = `${formatClock(els.player.currentTime)} / ${formatClock(els.player.duration)}`;
    } else {
      els.seekRange.disabled = false;
      els.seekRange.value = "0";
      els.seekRange.style.setProperty("--seek-pct", "0%");
      els.seekRange.style.setProperty("--buffered-pct", "0%");
      if (els.playerTime) els.playerTime.textContent = `${formatClock(els.player.currentTime)} / 0:00`;
    }
  }

  function setPlayerStatus(value, buffering = false) {
    els.playerStatus.textContent = value;
    els.playerCard.dataset.buffering = buffering ? "true" : "false";
    const v = String(value).toLowerCase();
    els.playerStatus.dataset.state = (buffering || v.includes("buffering") || v.includes("reconnect") || v === "loading")
      ? "buffering"
      : v === "live" ? "live"
      : v === "issue" ? "issue"
      : "ready";
    if (buffering || value === "Loading" || value === "Issue" || /reconnect/i.test(value)) showPlayerChrome(false);
  }

  function showPlayerChrome(autoHide = true) {
    els.playerCard.classList.remove("is-chrome-hidden");
    window.clearTimeout(controlsHideTimer);
    if (autoHide) schedulePlayerChromeHide();
  }

  function schedulePlayerChromeHide() {
    window.clearTimeout(controlsHideTimer);
    if (els.player.paused || els.playerCard.dataset.buffering === "true") return;
    controlsHideTimer = window.setTimeout(() => {
      if (!els.player.paused && els.playerCard.dataset.buffering !== "true") {
        els.playerCard.classList.add("is-chrome-hidden");
      }
    }, document.fullscreenElement === els.playerCard ? 2400 : 3200);
  }

  function isLivePlayback() {
    const channel = currentChannel();
    if (!channel) return false;
    const duration = els.player.duration;
    return channel.type === "live" || !Number.isFinite(duration) || duration <= 0 || duration === Infinity;
  }

  function applyStablePlaybackRate(reason) {
    const requested = Number(state.playbackRate || STABLE_LIVE_RATE);
    const target = isLivePlayback() ? STABLE_LIVE_RATE : Math.min(Math.max(requested, 0.5), 2);
    if (Math.abs((els.player.playbackRate || STABLE_LIVE_RATE) - target) < 0.01) return;
    suppressRateChange = true;
    els.player.playbackRate = target;
    window.setTimeout(() => {
      suppressRateChange = false;
    }, 0);
    if (reason === "ratechange" && isLivePlayback()) playbackDiagnostics.rateClamps += 1;
  }

  function startPlaybackDiagnostics() {
    window.clearInterval(playbackHealthTimer);
    playbackHealthTimer = window.setInterval(samplePlaybackHealth, QOE_HEARTBEAT_MS);
  }

  function startPlaybackSession(channel) {
    Object.assign(playbackDiagnostics, {
      sessionId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      channelId: channel.id,
      title: channel.title,
      startedAt: Date.now(),
      waitingCount: 0,
      totalRebufferMs: 0,
      rateClamps: 0,
      recoveries: 0,
      hlsErrors: [],
      streamErrors: [],
      samples: []
    });
    waitStartedAt = null;
    lastProgressAt = Date.now();
    lastProgressTime = 0;
    lastRecoveryAt = 0;
    recoveryAttempts = 0;
  }

  function recordWaiting() {
    if (waitStartedAt == null) {
      waitStartedAt = performance.now();
      playbackDiagnostics.waitingCount += 1;
    }
    setPlayerStatus("Buffering", true);
    samplePlaybackHealth();
  }

  function recordPlaying() {
    if (waitStartedAt != null) {
      playbackDiagnostics.totalRebufferMs += performance.now() - waitStartedAt;
      waitStartedAt = null;
    }
    applyStablePlaybackRate("playing");
    setPlayerStatus(isLivePlayback() ? "Live" : "Playing");
    samplePlaybackHealth();
    schedulePlayerChromeHide();
  }

  function samplePlaybackHealth() {
    if (!state.currentChannelId || !els.player) return;
    const quality = els.player.getVideoPlaybackQuality?.();
    const sample = {
      at: Date.now(),
      channelId: state.currentChannelId,
      currentTime: Number((els.player.currentTime || 0).toFixed(2)),
      playbackRate: els.player.playbackRate,
      paused: els.player.paused,
      readyState: els.player.readyState,
      bufferAhead: Number(bufferAhead().toFixed(2)),
      droppedFrames: quality?.droppedVideoFrames ?? null,
      totalFrames: quality?.totalVideoFrames ?? null
    };
    playbackDiagnostics.samples.push(sample);
    playbackDiagnostics.samples = playbackDiagnostics.samples.slice(-24);
    window.orkxtraPlaybackDiagnostics = playbackDiagnostics;
    updateProgressWatchdog(sample);
    recordResume();
  }

  function updateProgressWatchdog(sample) {
    if (els.player.paused || !state.currentChannelId) return;
    if (sample.currentTime > lastProgressTime + 0.25) {
      lastProgressTime = sample.currentTime;
      lastProgressAt = Date.now();
      if (recoveryAttempts) recoveryAttempts = 0; // sustained progress = healthy; re-arm recovery budget
      return;
    }
    const stalledMs = Date.now() - Math.max(lastProgressAt, playbackDiagnostics.startedAt || 0);
    if (stalledMs > 12000 && sample.readyState < 3 && sample.bufferAhead < 0.5) {
      recoverStalledPlayback(`No media progress for ${Math.round(stalledMs / 1000)}s`);
    }
  }

  function recoverStalledPlayback(reason) {
    const channel = currentChannel();
    const now = Date.now();
    if (!channel) return;
    if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
      setPlayerStatus("Issue");
      notify("Stream stopped", "Could not recover this stream after several tries. Pick another channel or refresh the profile.");
      return;
    }
    if (now - lastRecoveryAt < 8000) return;
    recoveryAttempts += 1;
    lastRecoveryAt = now;
    playbackDiagnostics.recoveries = recoveryAttempts;
    setPlayerStatus(`Reconnecting ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}`, true);
    // 1st try: same transport with a fresh link. 2nd: alternate transport (mislabelled stream).
    // 3rd+: native fallback. MAC channels always force a fresh create_link (tokens expire).
    const formatOverride = recoveryAttempts >= 3
      ? "native"
      : (recoveryAttempts === 2 ? alternateFormat(currentSourceFormat) : "");
    playChannel(channel, {
      recovering: true,
      forceRelink: Boolean(channel.macCommand),
      formatOverride
    });
  }

  function alternateFormat(format) {
    if (format === "hls") return "mpegts";
    if (format === "mpegts") return "hls";
    return "mpegts";
  }

  // ---- ORKXTRA improved-build client helpers ----
  function friendlyClientError(error) {
    const msg = String(error?.message || "").trim();
    if (!msg) return "The provider did not return a playable stream.";
    if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Network problem reaching the server. Check your connection and try again.";
    if (/401|blocked|unauthorized|expired|not authorized|rejected/i.test(msg)) return "This profile was rejected by the portal (account blocked, expired, or not authorized).";
    if (/429|too many/i.test(msg)) return "Too many requests right now — wait a moment and try again.";
    if (/5\d\d|server problem/i.test(msg)) return "The portal is having problems. Please try again shortly.";
    if (/missing stream|no playable|did not return|playable stream/i.test(msg)) return "The provider did not return a playable stream for this item.";
    return msg;
  }

  function applyAspectRatio() {
    if (els.player) els.player.style.objectFit = state.aspect || "contain";
  }

  function cycleAspectRatio() {
    const modes = ["contain", "cover", "fill"];
    const next = modes[(modes.indexOf(state.aspect || "contain") + 1) % modes.length];
    state.aspect = next;
    applyAspectRatio();
    saveState();
    notify("Aspect ratio", next === "contain" ? "Fit — no crop" : next === "cover" ? "Fill — crop edges" : "Stretch to frame");
  }

  function toggleMute() {
    els.player.muted = !els.player.muted;
    state.muted = els.player.muted;
    saveState();
    updatePlayerChrome();
  }

  function seekBy(seconds) {
    if (!Number.isFinite(els.player.duration) || els.player.duration <= 0) return;
    els.player.currentTime = Math.min(els.player.duration, Math.max(0, (els.player.currentTime || 0) + seconds));
    showPlayerChrome();
  }

  function nudgeVolume(delta) {
    const v = Math.min(1, Math.max(0, (els.player.volume || 0) + delta));
    els.player.volume = v;
    state.volume = v;
    if (v > 0 && els.player.muted) { els.player.muted = false; state.muted = false; }
    saveState();
    updatePlayerChrome();
  }

  function formatClock(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  }

  function setupSpeedMenu() {
    if (!els.speedBtn || !els.speedMenu) return;
    els.speedBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (els.speedBtn.disabled) return;
      const willOpen = els.speedMenu.classList.contains("is-hidden");
      els.speedMenu.classList.toggle("is-hidden", !willOpen);
      els.speedBtn.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) updateSpeedMenuActive();
    });
    els.speedMenu.addEventListener("click", (event) => {
      event.stopPropagation();
      const opt = event.target.closest(".speed-opt");
      if (!opt) return;
      state.playbackRate = Number(opt.dataset.rate) || STABLE_LIVE_RATE;
      applyStablePlaybackRate("speed-control");
      saveState();
      updateSpeedMenuActive();
      closeSpeedMenu();
    });
    updateSpeedMenuActive();
  }

  function updateSpeedMenuActive() {
    if (!els.speedMenu) return;
    const rate = isLivePlayback() ? STABLE_LIVE_RATE : (Number(state.playbackRate) || STABLE_LIVE_RATE);
    els.speedMenu.querySelectorAll(".speed-opt").forEach((opt) => {
      const active = Number(opt.dataset.rate) === rate;
      opt.classList.toggle("is-active", active);
      opt.setAttribute("aria-checked", String(active));
    });
  }

  function closeSpeedMenu() {
    if (els.speedMenu && !els.speedMenu.classList.contains("is-hidden")) {
      els.speedMenu.classList.add("is-hidden");
      els.speedBtn?.setAttribute("aria-expanded", "false");
    }
  }

  function toggleSubtitles() {
    const tracks = els.player.textTracks;
    if (!tracks || tracks.length === 0) {
      notify("Subtitles", "No subtitles are available for this title.");
      return;
    }
    const showing = [...tracks].some((t) => t.mode === "showing");
    for (let i = 0; i < tracks.length; i += 1) tracks[i].mode = "disabled";
    if (!showing) tracks[0].mode = "showing";
    els.subsBtn?.classList.toggle("is-active", !showing);
  }

  function openSearchBox() {
    if (!els.searchForm) return;
    els.searchForm.classList.remove("is-collapsed");
    els.searchForm.classList.add("is-open");
    els.searchInput.focus();
  }

  function collapseSearchBox() {
    if (!els.searchForm || els.searchInput.value.trim()) return;
    els.searchForm.classList.add("is-collapsed");
    els.searchForm.classList.remove("is-open");
  }

  function maybeResume() {
    if (!pendingResumeId) return;
    const id = pendingResumeId;
    pendingResumeId = "";
    if (isLivePlayback()) return;
    const saved = state.resume?.[id];
    const duration = els.player.duration;
    if (!saved || !Number.isFinite(duration) || duration <= 0) return;
    if (saved.t > 30 && saved.t < duration * 0.95) {
      try {
        els.player.currentTime = saved.t;
        notify("Resumed", `Continuing from ${formatClock(saved.t)}.`);
      } catch (_) { /* seek may fail before buffered */ }
    }
  }

  function recordResume() {
    const channel = currentChannel();
    if (!channel || isLivePlayback() || els.player.paused) return;
    const t = els.player.currentTime || 0;
    const d = els.player.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    if (t < 15 || t > d * 0.97) { clearResume(channel.id); return; }
    state.resume = state.resume || {};
    state.resume[channel.id] = { t: Number(t.toFixed(1)), d: Number(d.toFixed(1)), at: Date.now() };
    const ids = Object.keys(state.resume);
    if (ids.length > 200) {
      ids.sort((a, b) => (state.resume[a].at || 0) - (state.resume[b].at || 0))
        .slice(0, ids.length - 200)
        .forEach((k) => delete state.resume[k]);
    }
    saveState();
  }

  function clearResume(id) {
    if (id && state.resume && state.resume[id]) {
      delete state.resume[id];
      saveState();
    }
  }

  function handlePlayerHotkeys(event) {
    const target = event.target;
    const tag = (target?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if ([els.profileDialog, els.proDialog].some((dialog) => dialog?.open)) return;
    if (event.key === "/") { event.preventDefault(); openSearchBox(); return; }
    if (!state.currentChannelId) return;
    switch (event.key) {
      case " ":
      case "k": event.preventDefault(); togglePlay(); break;
      case "f": event.preventDefault(); toggleFullscreen(); break;
      case "m": event.preventDefault(); toggleMute(); break;
      case "p": event.preventDefault(); togglePip(); break;
      case "z": event.preventDefault(); cycleAspectRatio(); break;
      case "ArrowRight": if (!isLivePlayback()) { event.preventDefault(); seekBy(10); } break;
      case "ArrowLeft": if (!isLivePlayback()) { event.preventDefault(); seekBy(-10); } break;
      case "ArrowUp": event.preventDefault(); nudgeVolume(0.05); break;
      case "ArrowDown": event.preventDefault(); nudgeVolume(-0.05); break;
      case "n": event.preventDefault(); stepChannel(1); break;
      case "b": event.preventDefault(); stepChannel(-1); break;
      default: break;
    }
  }

  function bufferAhead() {
    if (!els.player?.buffered?.length) return 0;
    const current = els.player.currentTime || 0;
    for (let index = 0; index < els.player.buffered.length; index += 1) {
      const start = els.player.buffered.start(index);
      const end = els.player.buffered.end(index);
      if (current >= start && current <= end) return Math.max(0, end - current);
    }
    return Math.max(0, bufferedEnd() - current);
  }

  function bufferedEnd() {
    const ranges = els.player?.buffered;
    if (!ranges?.length) return 0;
    try {
      return ranges.end(ranges.length - 1);
    } catch {
      return 0;
    }
  }

  async function togglePip() {
    if (!document.pictureInPictureEnabled || !els.player.requestPictureInPicture) {
      notify("PiP unavailable", "This browser does not expose picture in picture.");
      return;
    }
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await els.player.requestPictureInPicture();
    } catch (error) {
      notify("PiP blocked", error.message || "The browser could not open picture in picture.");
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await els.playerCard.requestFullscreen();
      showPlayerChrome();
    } catch (error) {
      notify("Fullscreen blocked", error.message || "The browser could not enter fullscreen.");
    }
  }

  function rememberHistory(channel) {
    state.history = state.history.filter((entry) => entry.id !== channel.id);
    state.history.unshift({ id: channel.id, title: channel.title, at: Date.now() });
    state.history = state.history.slice(0, 120);
  }

  function removeHistoryItem(id) {
    if (!id) return;
    state.history = state.history.filter((entry) => entry.id !== id);
    saveState();
    renderHomeRows();
    renderGroups();
    renderCatalog();
  }

  function toggleFavorite(id) {
    if (!id) return;
    if (isFavorite(id)) state.favorites = state.favorites.filter((item) => item !== id);
    else state.favorites.unshift(id);
    invalidateFavoriteCache();
    saveState();
    renderStats();
    renderHero();
    renderHomeRows();
    renderGroups();
    renderCatalog();
  }

  function featuredChannel() {
    const profileId = currentProfileId();
    return state.history.map((entry) => findChannel(entry.id)).find((channel) => channel?.profileId === profileId && (channel.url || channel.macCommand))
      || channels.find((channel) => channel.profileId === profileId && channel.type === "live" && (channel.url || channel.macCommand))
      || channels.find((channel) => channel.profileId === profileId && !channel.catalogOnly && (channel.url || channel.macCommand));
  }

  function currentChannel() {
    return findChannel(state.currentChannelId);
  }

  function findChannel(id) {
    return channelById.get(id);
  }

  function currentProfile() {
    return state.profiles.find((profile) => profile.id === state.currentProfileId);
  }

  function currentProfileId() {
    return currentProfile()?.id || DEMO_ID;
  }

  function availableProfiles() {
    const real = state.profiles.filter((profile) => profile.id !== DEMO_ID);
    if (!account.authenticated && real.length) return real.slice(0, 1);
    const allowed = real.filter((profile) => !blockedProfileIds.has(profile.id));
    return allowed.length ? allowed : state.profiles.filter((profile) => profile.id === DEMO_ID);
  }

  function savedProfileCount() {
    return state.profiles.filter((profile) => profile.id !== DEMO_ID && !blockedProfileIds.has(profile.id)).length;
  }

  function isFavorite(id) {
    return favoriteSet.has(id);
  }

  function hasLoadedCategory(placeholder) {
    return channels.some((channel) => (
      channel.profileId === placeholder.profileId
      && channel.type === placeholder.type
      && channel.categoryId
      && channel.categoryId === placeholder.categoryId
      && !channel.catalogOnly
    ));
  }

  function hasStoredCatalogMeta(profile) {
    return Boolean(profile?.catalogMeta?.groups && profile.catalogMeta.counts);
  }

  function mediaCounts(profileId) {
    const profile = state.profiles.find((item) => item.id === profileId);
    if (!loadedProfileIds.has(profileId) && hasStoredCatalogMeta(profile)) return profile.catalogMeta.counts;
    if (!loadedProfileIds.has(profileId) && profile?.summary) return profile.summary;
    if (catalogCache.counts.has(profileId)) return catalogCache.counts.get(profileId);
    const counts = summarizeChannels(channels, profileId);
    catalogCache.counts.set(profileId, counts);
    return counts;
  }

  function summaryForProfile(profileId) {
    if (!catalogHydrated && profileId !== DEMO_ID) return "Loading saved catalog";
    const profile = state.profiles.find((item) => item.id === profileId);
    if (!loadedProfileIds.has(profileId) && profileId !== DEMO_ID && hasStoredCatalogMeta(profile)) {
      return summaryText(profile.catalogMeta.counts);
    }
    if (!loadedProfileIds.has(profileId) && profileId !== DEMO_ID && profile?.summary) {
      return summaryText(profile.summary);
    }
    if (!loadedProfileIds.has(profileId) && profileId !== DEMO_ID) return "Open to load catalog";
    const counts = mediaCounts(profileId);
    return summaryText(counts);
  }

  function summarizeChannels(items, profileId = "") {
    const counts = { live: 0, movie: 0, series: 0, movieGroups: 0, seriesGroups: 0 };
    items.forEach((channel) => {
      if (profileId && channel.profileId !== profileId) return;
      if (channel.catalogOnly) {
        if (channel.type === "movie") counts.movieGroups += 1;
        if (channel.type === "series") counts.seriesGroups += 1;
      } else if (counts[channel.type] !== undefined) counts[channel.type] += 1;
    });
    return counts;
  }

  function summaryText(counts) {
    return `${formatCount(counts.live)} live - ${formatCount(counts.movie || counts.movieGroups)} movies - ${formatCount(counts.series || counts.seriesGroups)} series`;
  }

  function updateCurrentProfileSummary() {
    const profile = currentProfile();
    if (!profile) return;
    profile.catalogMeta = buildCatalogMeta(channels, profile.id);
    profile.summary = profile.catalogMeta.counts;
    catalogCache.counts.set(profile.id, profile.summary);
  }

  function buildCatalogMeta(items, profileId = "") {
    const scoped = items.filter((channel) => channel && (!profileId || channel.profileId === profileId));
    return {
      version: 1,
      updatedAt: Date.now(),
      counts: summarizeChannels(scoped),
      groups: {
        all: buildGroupEntriesForItems(scoped, "all"),
        live: buildGroupEntriesForItems(scoped, "live"),
        movie: buildGroupEntriesForItems(scoped, "movie"),
        series: buildGroupEntriesForItems(scoped, "series")
      }
    };
  }

  function buildGroupEntriesForItems(items, route) {
    const map = new Map();
    items.forEach((channel) => {
      if (!typeMatches(channel, route)) return;
      const names = route === "live" ? smartGroups(channel) : [displayGroupName(channel.group || "Other")];
      names.forEach((name) => {
        const displayName = displayGroupName(name);
        const entry = map.get(displayName) || { name: displayName, count: 0 };
        entry.count += 1;
        map.set(displayName, entry);
      });
    });
    return Array.from(map.values()).filter((group) => group.count > 0).sort(compareCategoryGroups);
  }

  function mergeCatalogMetaLoadedCategory(profile, route, group, fresh) {
    if (!hasStoredCatalogMeta(profile)) profile.catalogMeta = buildCatalogMeta(channels, profile.id);
    const count = fresh.filter((channel) => channel.profileId === profile.id && channel.type === route && !channel.catalogOnly).length;
    const counts = profile.catalogMeta.counts || summarizeChannels([], profile.id);
    counts[route] = Math.max(counts[route] || 0, count ? (counts[route] || 0) + count : counts[route] || 0);
    profile.summary = counts;
    const groups = profile.catalogMeta.groups?.[route] || [];
    const displayName = displayGroupName(group);
    const existing = groups.find((item) => item.name === displayName);
    if (existing) existing.count = Math.max(existing.count, count || existing.count);
    else if (count) groups.push({ name: displayName, count });
    profile.catalogMeta.groups[route] = groups.sort(compareCategoryGroups);
    profile.catalogMeta.updatedAt = Date.now();
    catalogCache.counts.set(profile.id, counts);
  }

  function countForRoute(route, profileId = currentProfileId()) {
    const counts = mediaCounts(profileId);
    if (route === "live") return counts.live || 0;
    if (route === "movie") return counts.movie || counts.movieGroups || 0;
    if (route === "series") return counts.series || counts.seriesGroups || 0;
    if (route === "favorites") return knownFavoriteCount(route, profileId);
    return (counts.live || 0) + (counts.movie || counts.movieGroups || 0) + (counts.series || counts.seriesGroups || 0);
  }

  function knownFavoriteCount(route, profileId = currentProfileId()) {
    return state.favorites
      .map((id) => findChannel(id))
      .filter((channel) => channel && channel.profileId === profileId && typeMatches(channel, route) && !channel.catalogOnly)
      .length;
  }

  function knownHistoryCount(route, profileId = currentProfileId()) {
    return state.history
      .map((entry) => findChannel(entry.id))
      .filter((channel) => channel && channel.profileId === profileId && typeMatches(channel, route) && !channel.catalogOnly)
      .length;
  }

  function profileTypeLabel(profile) {
    if (!profile) return "IPTV";
    if (profile.type === "mac") return "MAC login";
    if (profile.type === "m3u") return "M3U playlist";
    if (profile.type === "xtream") return "Xtream login";
    return "Demo profile";
  }

  function avatarMarkup(profile, className) {
    return `<span class="${escapeHtml(className)}" aria-hidden="true">${faceSvg(profile)}</span>`;
  }

  // Friendly generated face avatar (own artwork: eyes + smile), varied a little per profile.
  function faceSvg(profile) {
    const seed = Math.abs(parseInt(hash(profile?.id || profile?.name || "ork"), 36) || 0);
    const v = seed % 3;
    const smile = v === 0 ? "M30 56 Q50 77 70 56" : v === 1 ? "M30 58 Q50 70 70 58" : "M28 59 Q50 82 72 59";
    const eyeY = v === 2 ? 42 : 44;
    return `<svg class="avatar-face" viewBox="0 0 100 100" aria-hidden="true"><circle cx="34" cy="${eyeY}" r="6.5"></circle><circle cx="66" cy="${eyeY}" r="6.5"></circle><path d="${smile}" fill="none" stroke-width="7" stroke-linecap="round"></path></svg>`;
  }

  function avatarVars(profile, index = 0) {
    const palettes = [
      ["#1aa0d8", "#0e5577"],
      ["#f0466f", "#7b1934"],
      ["#13a56b", "#064b32"],
      ["#8b2be2", "#3f1269"],
      ["#ff8b19", "#7a3200"],
      ["#e2d76a", "#167a72"],
      ["#5b8cff", "#16295e"]
    ];
    const seed = parseInt(hash(profile?.id || profile?.name || String(index)), 36) || index;
    const pair = palettes[Math.abs(seed + index) % palettes.length];
    return `--avatar-a:${pair[0]};--avatar-b:${pair[1]};`;
  }

  function smartGroups(channel) {
    const text = clean(`${channel.group} ${channel.title}`);
    const groups = [];
    if (/\b(adult|xxx|18\s*\+|erotic|porn|brazzers|hustler|playboy)\b/.test(text)) groups.push("Adult");
    if (/\b(news|cnn|bbc|sky news|fox news)\b/.test(text)) groups.push("News");
    if (/\b(sport|football|soccer|tennis|cricket|nba|f1|ufc|wwe)\b/.test(text)) groups.push("Sports");
    if (/\b(kids|cartoon|disney|nick|baby)\b/.test(text)) groups.push("Kids");
    if (/\b(movie|cinema|film|vod)\b/.test(text)) groups.push("Movies");
    if (/\b(series|season|episode|24\/7)\b/.test(text)) groups.push("Series");
    if (/\b(music|radio|fm)\b/.test(text)) groups.push("Music");
    const cleaned = displayGroupName(channel.group || "");
    if (cleaned && !groups.includes(cleaned)) groups.push(cleaned);
    return groups.length ? unique(groups.map(displayGroupName)).slice(0, 4) : ["Other"];
  }

  function groupMatches(channel, group) {
    if ((channel.displayGroup || displayGroupName(channel.group)) === group) return true;
    return smartGroups(channel).some((name) => displayGroupName(name) === group);
  }

  function displayGroupName(name = "") {
    const cleaned = titleCase(name || "Other");
    if (isAdultGroupName(cleaned)) return "Adult";
    return cleaned || "Other";
  }

  // Strip the provider's leading region/language tags from a title for display,
  // e.g. "| AL | Mysteries of the Southern Wild" -> "Mysteries of the Southern Wild",
  // "EN - Ernest Saves Christmas (1988)" -> "Ernest Saves Christmas (1988)".
  function cleanTitle(title) {
    const raw = String(title == null ? "" : title);
    const stripped = raw
      .replace(/^(?:\s*\|\s*[^|]{1,16}\s*\|\s*)+/, "")
      .replace(/^\s*[A-Z]{2,4}\s*\|\s*/, "")
      .replace(/^\s*[A-Za-z]{2,3}\s*[-–—]\s+/, "")
      .trim();
    return stripped || raw.trim();
  }

  function normalizeChannel(channel) {
    if (!channel?.id || !channel.profileId || !channel.title) return null;
    const normalized = {
      id: String(channel.id),
      profileId: channel.profileId,
      title: channel.title || "Untitled",
      type: channel.type || "live",
      mediaType: channel.mediaType || "",
      catalogOnly: Boolean(channel.catalogOnly),
      group: channel.group || "Other",
      url: channel.url || "",
      logo: channel.logo || "",
      description: channel.description || "",
      providerId: channel.providerId || "",
      epgId: channel.epgId || channel.providerId || "",
      macCommand: channel.macCommand || "",
      macEndpoint: channel.macEndpoint || "",
      streamFormat: channel.streamFormat || inferStreamFormat(channel.url || channel.macCommand || ""),
      categoryId: channel.categoryId || "",
      seriesEpisode: channel.seriesEpisode || "",
      seriesTitle: channel.seriesTitle || "",
      seasonTitle: channel.seasonTitle || "",
      isEpisode: Boolean(channel.isEpisode),
      adult: Boolean(channel.adult),
      quality: channel.quality || inferQuality(`${channel.title || ""} ${channel.group || ""}`),
      language: channel.language || "Unknown"
    };
    normalized.displayGroup = displayGroupName(normalized.group);
    normalized.adultNormalized = Boolean(channel.adultNormalized ?? isAdultChannel(normalized));
    normalized.qualityRank = Number(channel.qualityRank) || qualityRank(normalized.quality);
    normalized.searchText = clean(`${normalized.title} ${normalized.group} ${normalized.displayGroup} ${normalized.description || ""}`);
    normalized.sortTitle = clean(normalized.title);
    return normalized;
  }

  function inferType(group = "", url = "") {
    const value = clean(`${group} ${url}`);
    if (/(movie|vod|film|cinema)/.test(value)) return "movie";
    if (/(series|season|episode|show)/.test(value)) return "series";
    if (/(music|radio|audio|song)/.test(value)) return "music";
    return "live";
  }

  function inferQuality(value = "") {
    if (/4k|uhd/i.test(value)) return "4K";
    if (/fhd|1080/i.test(value)) return "FHD";
    if (/hd|720/i.test(value)) return "HD";
    if (/aac|mp3|audio/i.test(value)) return "AAC";
    return "SD";
  }

  function qualityRank(value = "") {
    const text = String(value).toUpperCase();
    if (text.includes("4K") || text.includes("UHD")) return 5;
    if (text.includes("FHD") || text.includes("1080")) return 4;
    if (text.includes("HD") || text.includes("720")) return 3;
    if (text.includes("SD")) return 2;
    if (text.includes("AAC") || text.includes("MP3")) return 1;
    return 0;
  }

  function inferStreamFormat(url = "") {
    const value = String(url || "").toLowerCase();
    if (/\.m3u8(?:$|[?#])|mpegurl/.test(value)) return "hls";
    if (/\.flv(?:$|[?#])/.test(value)) return "flv";
    if (/\.ts(?:$|[?#])|\.m2ts(?:$|[?#])|extension=ts|\/live\/play\//.test(value)) return "mpegts";
    if (/\.(mp4|m4v|webm|ogg|ogv|mov)(?:$|[?#])/.test(value)) return "native";
    if (/\.(mkv|avi)(?:$|[?#])/.test(value)) return "native"; // browser support varies; native is best effort
    return "";
  }

  function stableChannelId(profile, channel) {
    return `item-${hash(`${profile.id}|${channel.id || ""}|${channel.command || channel.macCommand || channel.url || ""}|${channel.title || ""}|${channel.type || ""}`)}`;
  }

  function normalizeMac(value = "") {
    const hex = value.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
    if (hex.length !== 12) return "";
    return hex.match(/.{1,2}/g).join(":");
  }

  function trimSlash(value = "") {
    return value.replace(/\/+$/, "");
  }

  function clean(value = "") {
    return String(value).toLowerCase().replace(/[^a-z0-9+]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function titleCase(value = "") {
    return String(value || "")
      .replace(/[|_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function initials(value = "") {
    const parts = String(value || "OTT").replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || "O").toUpperCase() + (parts[1]?.[0] || parts[0]?.[1] || "T").toUpperCase();
  }

  function mediaLabel(type) {
    return ({ live: "Live TV", movie: "Movie", series: "Series", music: "Audio", favorites: "My List", all: "Home" })[type] || "Stream";
  }

  function routeTitle(route) {
    return ({ live: "Live TV", movie: "Movies", series: "Series", favorites: "My List", all: "Recommended" })[route] || "Catalog";
  }

  function itemLabel(route) {
    return ({ live: "channels", movie: "movies", series: "series", favorites: "saved", all: "items" })[route] || "items";
  }

  function formatCount(value = 0) {
    return new Intl.NumberFormat([], { notation: Number(value) >= 10000 ? "compact" : "standard" }).format(Number(value) || 0);
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function hash(value = "") {
    let h = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value = "") {
    return escapeHtml(String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n]/g, ""));
  }

  function emptyState(title, message, variant = "empty") {
    const icon = variant === "error"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16h.01"></path></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 9h18M9 19v-7"></path></svg>`;
    return `<div class="empty-state ${variant === "error" ? "is-error" : ""}">
      <span class="empty-icon">${icon}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>`;
  }

  function loadingState(title, message) {
    const cards = Array.from({ length: 12 }, () => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>`).join("");
    return `${cards}<span class="sr-only" role="status">${escapeHtml(title)}. ${escapeHtml(message)}</span>`;
  }

  function setLoadPill(active, text = "") {
    els.loadPill.classList.toggle("is-hidden", !active);
    els.loadPill.innerHTML = active ? `<span class="spinner"></span>${escapeHtml(text)}` : "";
  }

  function setBusy(active, title = "", message = "") {
    els.busyOverlay.classList.toggle("is-hidden", !active);
    els.busyOverlay.innerHTML = active ? `<span class="spinner"></span><span><strong>${escapeHtml(title)}</strong><br>${escapeHtml(message)}</span>` : "";
  }

  function setProfileBusy(active, title = "", message = "") {
    els.profileBusy.classList.toggle("is-hidden", !active);
    els.profileBusy.innerHTML = active ? `<span class="spinner"></span><span>${escapeHtml(title)}<br><small>${escapeHtml(message)}</small></span>` : "";
    els.saveProfileBtn.disabled = active;
    els.saveProfileBtn.textContent = active ? "Loading..." : (editingProfileId ? "Save Changes" : "Add Profile");
    $$("input, .login-tabs button", els.profileForm).forEach((control) => {
      control.disabled = active;
    });
  }

  function notify(title, message = "") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    els.toastStack.append(toast);
    window.setTimeout(() => toast.remove(), 4400);
  }

  async function detectHealth() {
    try {
      await fetch(`${location.origin}/api/health`, { cache: "no-store" });
    } catch {
      notify("Server offline", "Run the local server before adding MAC profiles.");
    }
  }
})();
