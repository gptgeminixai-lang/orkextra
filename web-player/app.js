(() => {
  "use strict";

  const STORAGE_KEY = "sfvip-web-player-v1";
  const CHAT_STORAGE_KEY = "sfvip-web-player-chat-v1";
  const CHANNEL_DB_NAME = "sfvip-web-player-catalog-v1";
  const CHANNEL_DB_VERSION = 1;
  const CHANNEL_STORE = "channels";
  const CHANNEL_ROW_HEIGHT = 88;
  const CHANNEL_OVERSCAN = 10;
  const GROUP_ROW_HEIGHT = 150;
  const GROUP_CARD_MIN_WIDTH = 220;
  const ADULT_GROUP = "Adult";
  const UNGROUPED_GROUP = "Ungrouped";
  const TAXONOMY_MODES = [
    { id: "smart", label: "Smart" },
    { id: "country", label: "Country" },
    { id: "genre", label: "Genre" },
    { id: "language", label: "Language" },
    { id: "raw", label: "Raw" }
  ];
  const MEDIA_TYPES = [
    { id: "live", label: "Live", title: "Live TV", itemLabel: "channels" },
    { id: "movie", label: "Movies", title: "Movies", itemLabel: "movies" },
    { id: "series", label: "Series", title: "Series", itemLabel: "series" },
    { id: "music", label: "Audio", title: "Audio", itemLabel: "audio streams" },
    { id: "all", label: "All", title: "All Media", itemLabel: "items" }
  ];
  const DAY = 24 * 60 * 60 * 1000;
  const STABLE_LIVE_RATE = 1;
  const QOE_HEARTBEAT_MS = 5000;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    app: $("#app"),
    player: $("#player"),
    playerEmpty: $("#playerEmpty"),
    videoShell: $(".video-shell"),
    playerStatus: $("#playerStatus"),
    nowType: $("#nowType"),
    nowTitle: $("#nowTitle"),
    nowQuality: $("#nowQuality"),
    detailTitle: $("#detailTitle"),
    detailGroup: $("#detailGroup"),
    detailProgram: $("#detailProgram"),
    detailRating: $("#detailRating"),
    detailHistory: $("#detailHistory"),
    upNextList: $("#upNextList"),
    globalSearch: $("#globalSearch"),
    profileSelect: $("#profileSelect"),
    profileSummary: $("#profileSummary"),
    sourceHealth: $("#sourceHealth"),
    syncStatus: $("#syncStatus"),
    catalogTitle: $("#catalogTitle"),
    typeRail: $("#typeRail"),
    taxonomyRail: $("#taxonomyRail"),
    groupRail: $("#groupRail"),
    activeGroupTitle: $("#activeGroupTitle"),
    activeGroupMeta: $("#activeGroupMeta"),
    catalogLoadStatus: $("#catalogLoadStatus"),
    streamingHome: $("#streamingHome"),
    heroFeature: $("#heroFeature"),
    contentRows: $("#contentRows"),
    channelGrid: $("#channelGrid"),
    accountsList: $("#accountsList"),
    favoritesList: $("#favoritesList"),
    favoriteCount: $("#favoriteCount"),
    historyList: $("#historyList"),
    guideGrid: $("#guideGrid"),
    guideDate: $("#guideDate"),
    smartGrid: $("#smartGrid"),
    scheduleList: $("#scheduleList"),
    scheduleCount: $("#scheduleCount"),
    recordingList: $("#recordingList"),
    recordingCount: $("#recordingCount"),
    subtitleList: $("#subtitleList"),
    clock: $("#clock"),
    connectionBadge: $("#connectionBadge"),
    toastStack: $("#toastStack"),
    busyOverlay: $("#busyOverlay"),
    busyTitle: $("#busyTitle"),
    busyMessage: $("#busyMessage"),
    accountDialog: $("#accountDialog"),
    accountForm: $("#accountForm"),
    accountBusy: $("#accountBusy"),
    saveAccountBtn: $("#saveAccountBtn"),
    smartDialog: $("#smartDialog"),
    smartForm: $("#smartForm"),
    scheduleDialog: $("#scheduleDialog"),
    scheduleForm: $("#scheduleForm"),
    pinDialog: $("#pinDialog"),
    pinForm: $("#pinForm"),
    subtitleDialog: $("#subtitleDialog"),
    subtitleForm: $("#subtitleForm"),
    m3uFileInput: $("#m3uFileInput"),
    epgFileInput: $("#epgFileInput"),
    mediaFileInput: $("#mediaFileInput"),
    subtitleFileInput: $("#subtitleFileInput"),
    volumeRange: $("#volumeRange"),
    seekRange: $("#seekRange"),
    bufferBar: $("#bufferBar"),
    currentTimeLabel: $("#currentTimeLabel"),
    durationLabel: $("#durationLabel"),
    playPauseBtn: $("#playPauseBtn"),
    muteBtn: $("#muteBtn"),
    prevBtn: $("#prevBtn"),
    nextBtn: $("#nextBtn"),
    pipBtn: $("#pipBtn"),
    fullscreenBtn: $("#fullscreenBtn"),
    speedSelect: $("#speedSelect"),
    playerSubtitleBtn: $("#playerSubtitleBtn"),
    favoriteBtn: $("#favoriteBtn"),
    continueBtn: $("#continueBtn"),
    deleteProfileBtn: $("#deleteProfileBtn"),
    hideChannelBtn: $("#hideChannelBtn"),
    lockChannelBtn: $("#lockChannelBtn"),
    scheduleBtn: $("#scheduleBtn"),
    subtitleBtn: $("#subtitleBtn"),
    recordNowBtn: $("#recordNowBtn"),
    themeSelect: $("#themeSelect"),
    accentSelect: $("#accentSelect"),
    uiScaleRange: $("#uiScaleRange"),
    videoFitSelect: $("#videoFitSelect"),
    brightnessRange: $("#brightnessRange"),
    contrastRange: $("#contrastRange"),
    saturationRange: $("#saturationRange"),
    audioOutputSelect: $("#audioOutputSelect"),
    equalizerSelect: $("#equalizerSelect"),
    parentalEnabled: $("#parentalEnabled"),
    pinInput: $("#pinInput"),
    savePinBtn: $("#savePinBtn"),
    chatToggleBtn: $("#chatToggleBtn"),
    chatPanel: $("#chatPanel"),
    chatCloseBtn: $("#chatCloseBtn"),
    chatResetBtn: $("#chatResetBtn"),
    chatForm: $("#chatForm"),
    chatInput: $("#chatInput"),
    chatMessages: $("#chatMessages"),
    chatSendBtn: $("#chatSendBtn")
  };

  const eqPresets = {
    flat: [0, 0, 0, 0, 0],
    cinema: [4, 2, -1, 2, 4],
    voice: [-2, 1, 5, 3, -1],
    music: [3, 2, 0, 3, 5]
  };

  const sampleChannels = [
    {
      id: "demo-live-news",
      accountId: "demo",
      title: "SFVIP News",
      type: "live",
      group: "News",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      quality: "HD",
      rating: 4.6,
      language: "English",
      epgId: "sfvip.news"
    },
    {
      id: "demo-live-sports",
      accountId: "demo",
      title: "Matchday Arena",
      type: "live",
      group: "Sports",
      url: "https://test-streams.mux.dev/test_001/stream.m3u8",
      quality: "FHD",
      rating: 4.4,
      language: "English",
      epgId: "sfvip.sports"
    },
    {
      id: "demo-movie-bbb",
      accountId: "demo",
      title: "Big Buck Bunny",
      type: "movie",
      group: "Movies",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      quality: "HD",
      rating: 4.2,
      language: "English",
      epgId: "sfvip.bbb"
    },
    {
      id: "demo-movie-elephant",
      accountId: "demo",
      title: "Elephants Dream",
      type: "movie",
      group: "Movies",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      quality: "HD",
      rating: 4.1,
      language: "English",
      epgId: "sfvip.elephants"
    },
    {
      id: "demo-series",
      accountId: "demo",
      title: "Open Stream Series S01E01",
      type: "series",
      group: "Series",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      quality: "HD",
      rating: 4.5,
      language: "English",
      epgId: "sfvip.series"
    },
    {
      id: "demo-music",
      accountId: "demo",
      title: "Studio Audio Channel",
      type: "music",
      group: "Music",
      url: "https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a",
      quality: "AAC",
      rating: 3.9,
      language: "Instrumental",
      epgId: "sfvip.music"
    }
  ];

  const loadedState = loadState();
  const shouldMigrateLocalChannels = hasPersistedRealChannels(loadedState);
  const state = normalizeState(loadedState);
  const chatState = loadChatState();
  let activeView = "live";
  let activeType = "live";
  let activeTaxonomy = "smart";
  let activeGroup = "All";
  let accountType = "m3u";
  let currentList = [];
  let currentGroupList = [];
  let pendingLockedChannel = null;
  let pendingSmartId = null;
  let hls = null;
  let mpegtsPlayer = null;
  let audioContext = null;
  let audioSource = null;
  let eqFilters = [];
  let mediaRecorder = null;
  let recordChunks = [];
  let scheduleTimer = null;
  let transientUrls = new Set();
  let proxyAvailable = false;
  let chatPollTimer = null;
  let playbackChromeFrame = 0;
  let playbackHealthTimer = null;
  let waitStartedAt = null;
  let suppressRateChange = false;
  let longTaskObserver = null;
  let lastProgressAt = 0;
  let lastProgressTime = 0;
  let lastRecoveryAt = 0;
  let recoveryAttempts = 0;
  let controlsHideTimer = null;
  let channelDbPromise = null;
  let channelRenderFrame = 0;
  let searchRenderTimer = null;
  const pendingCategoryLoads = new Set();
  const failedCategoryLoads = new Set();
  const loadingCatalogs = new Map();
  const groupFacetCache = new Map();
  const playbackDiagnostics = {
    sessionId: "",
    channelId: "",
    waitingCount: 0,
    totalRebufferMs: 0,
    rateClamps: 0,
    longTasks: 0,
    hlsErrors: [],
    streamErrors: [],
    samples: []
  };

  Promise.resolve(init()).catch((error) => {
    console.error(error);
    window.__sfvipBootError = error.message || String(error);
  });

  async function init() {
    els.guideDate.value = toInputDate(new Date());
    bindEvents();
    detectProxy();
    applySettings();
    populateAudioOutputs();
    await hydrateChannelCatalog();
    renderAll();
    renderChat();
    saveState();
    startClock();
    startScheduleService();
    startPlaybackDiagnostics();
    notify("Ready", "Select a profile or add IPTV credentials.");
  }

  function defaultState() {
    const channels = sampleChannels.map((channel) => ({ ...channel }));
    return {
      accounts: [
        {
          id: "demo",
          name: "Demo Library",
          type: "demo",
          source: "Built-in samples",
          createdAt: Date.now(),
          lastSync: Date.now()
        }
      ],
      channels,
      epg: buildDemoEpg(channels),
      favorites: ["demo-live-news"],
      hidden: [],
      locked: [],
      history: [],
      smartPlaylists: [
        {
          id: "smart-hd-favorites",
          name: "Favorite HD",
          query: "",
          group: "",
          type: "all",
          minRating: 0,
          onlyHd: true,
          favoritesOnly: true
        },
        {
          id: "smart-movies",
          name: "Top Movies",
          query: "",
          group: "Movies",
          type: "movie",
          minRating: 4,
          onlyHd: false,
          favoritesOnly: false
        }
      ],
      schedules: [],
      recordings: [],
      subtitles: [],
      settings: {
        theme: "midnight",
        accent: "teal",
        uiScale: 1,
        videoFit: "contain",
        brightness: 100,
        contrast: 100,
        saturation: 100,
        volume: 0.75,
        muted: false,
        playbackRate: 1,
        parentalEnabled: true,
        parentalPin: "1234",
        equalizer: "flat",
        eqGains: eqPresets.flat
      },
      currentAccountId: "demo",
      currentChannelId: null
    };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : defaultState();
      return parsed?.version === 2 ? expandStoredState(parsed) : parsed;
    } catch (error) {
      console.warn(error);
      return defaultState();
    }
  }

  function hasPersistedRealChannels(saved) {
    return Array.isArray(saved?.channels)
      && saved.channels.some((channel) => (channel?.accountId || channel?.a) && (channel.accountId || channel.a) !== "demo");
  }

  async function hydrateChannelCatalog() {
    try {
      const validAccountIds = new Set(state.accounts.map((account) => account.id));
      const storedChannels = (await loadStoredChannels()).filter((channel) => validAccountIds.has(channel.accountId));
      if (storedChannels.length && !shouldMigrateLocalChannels) {
        const storedAccountIds = new Set(storedChannels.map((channel) => channel.accountId));
        const localChannels = state.channels.filter((channel) => (
          channel.accountId === "demo"
          || channel.transient
          || !storedAccountIds.has(channel.accountId)
        ));
        replaceState(normalizeState({
          ...state,
          channels: [...localChannels, ...storedChannels]
        }));
      }

      if (shouldMigrateLocalChannels) {
        await persistAllStoredAccountChannels();
        notify("Large catalog enabled", "Channels are now stored outside browser localStorage for smoother large portals.");
      }
    } catch (error) {
      console.warn(error);
      notify("Catalog storage limited", "Large channel lists may not persist until browser database storage is available.");
    }
  }

  function replaceState(next) {
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, next);
  }

  function openChannelDb() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is not available"));
    if (channelDbPromise) return channelDbPromise;
    channelDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(CHANNEL_DB_NAME, CHANNEL_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.objectStoreNames.contains(CHANNEL_STORE)
          ? request.transaction.objectStore(CHANNEL_STORE)
          : db.createObjectStore(CHANNEL_STORE, { keyPath: "id" });
        if (!store.indexNames.contains("accountId")) {
          store.createIndex("accountId", "accountId", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open channel database"));
      request.onblocked = () => reject(new Error("Channel database is blocked by another tab"));
    });
    return channelDbPromise;
  }

  async function loadStoredChannels() {
    const db = await openChannelDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHANNEL_STORE, "readonly");
      const request = transaction.objectStore(CHANNEL_STORE).getAll();
      request.onsuccess = () => resolve((request.result || []).map(normalizeStoredChannel).filter(Boolean));
      request.onerror = () => reject(request.error || new Error("Could not read stored channels"));
      transaction.onerror = () => reject(transaction.error || new Error("Could not read stored channels"));
    });
  }

  async function persistAllStoredAccountChannels() {
    const accountIds = state.accounts
      .filter((account) => account.id !== "demo")
      .map((account) => account.id);
    for (const accountId of accountIds) {
      await replaceStoredChannelsForAccount(accountId, channelsForStorage(accountId));
    }
  }

  function channelsForStorage(accountId) {
    return state.channels
      .filter((channel) => channel.accountId === accountId && !channel.transient)
      .map((channel) => ({ ...channel }));
  }

  async function replaceStoredChannelsForAccount(accountId, channels) {
    const db = await openChannelDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHANNEL_STORE, "readwrite");
      const store = transaction.objectStore(CHANNEL_STORE);
      const index = store.index("accountId");
      const cursorRequest = index.openCursor(IDBKeyRange.only(accountId));
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
          return;
        }
        channels.forEach((channel) => store.put(channelForStorage(channel)));
      };
      cursorRequest.onerror = () => reject(cursorRequest.error || new Error("Could not clear old channels"));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Could not save channel catalog"));
      transaction.onabort = () => reject(transaction.error || new Error("Channel catalog save was aborted"));
    });
  }

  async function putStoredChannels(channels) {
    if (!channels.length) return;
    const db = await openChannelDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHANNEL_STORE, "readwrite");
      const store = transaction.objectStore(CHANNEL_STORE);
      channels.forEach((channel) => store.put(channelForStorage(channel)));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Could not save catalog items"));
      transaction.onabort = () => reject(transaction.error || new Error("Catalog item save was aborted"));
    });
  }

  async function deleteStoredChannelsForAccount(accountId) {
    const db = await openChannelDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CHANNEL_STORE, "readwrite");
      const store = transaction.objectStore(CHANNEL_STORE);
      const index = store.index("accountId");
      const cursorRequest = index.openCursor(IDBKeyRange.only(accountId));
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error || new Error("Could not delete stored channels"));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Could not delete stored channels"));
      transaction.onabort = () => reject(transaction.error || new Error("Stored channel deletion was aborted"));
    });
  }

  function channelForStorage(channel) {
    return {
      id: channel.id,
      accountId: channel.accountId,
      title: channel.title,
      type: channel.type || "live",
      mediaType: channel.mediaType || "",
      catalogOnly: Boolean(channel.catalogOnly),
      group: channel.group || "Other",
      url: channel.url || "",
      logo: channel.logo || "",
      description: channel.description || "",
      providerId: channel.providerId || "",
      macCommand: channel.macCommand || "",
      macEndpoint: channel.macEndpoint || "",
      streamFormat: channel.streamFormat || "",
      categoryId: channel.categoryId || "",
      adult: Boolean(channel.adult),
      country: channel.country || "",
      quality: channel.quality || "",
      rating: channel.rating || 0,
      language: channel.language || "",
      epgId: channel.epgId || ""
    };
  }

  function normalizeStoredChannel(channel) {
    if (!channel?.id || !channel.accountId || !channel.title) return null;
    return {
      ...channel,
      type: channel.type || "live",
      mediaType: channel.mediaType || "",
      catalogOnly: Boolean(channel.catalogOnly),
      group: channel.group || "Other",
      url: channel.url || "",
      description: channel.description || "",
      categoryId: channel.categoryId || "",
      adult: Boolean(channel.adult),
      country: channel.country || "",
      quality: channel.quality || inferQuality(`${channel.title || ""} ${channel.group || ""}`),
      language: channel.language || (channel.macCommand ? "Portal" : "Unknown"),
      epgId: channel.epgId || slug(channel.title)
    };
  }

  function loadChatState() {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        threadId: parsed.threadId || "",
        messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-80) : [],
        pending: false
      };
    } catch (error) {
      console.warn(error);
      return { threadId: "", messages: [], pending: false };
    }
  }

  function saveChatState() {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      threadId: chatState.threadId,
      messages: chatState.messages.filter((message) => !message.local).slice(-80)
    }));
  }

  function normalizeState(input) {
    const base = defaultState();
    const merged = {
      ...base,
      ...input,
      settings: { ...base.settings, ...(input.settings || {}) }
    };
    if (!Array.isArray(merged.accounts)) merged.accounts = base.accounts;
    if (!Array.isArray(merged.channels) || !merged.channels.length) merged.channels = base.channels;
    const deduped = dedupeAccounts(merged.accounts);
    merged.accounts = deduped.accounts;
    const channelKeys = new Set();
    merged.channels = merged.channels.map((channel) => ({
      ...channel,
      accountId: deduped.replacements[channel.accountId] || channel.accountId
    })).filter((channel) => {
      const key = `${channel.accountId}:${channel.title}:${channel.url || channel.macCommand || channel.id}`;
      if (channelKeys.has(key)) return false;
      channelKeys.add(key);
      return true;
    });
    if (deduped.replacements[merged.currentAccountId]) {
      merged.currentAccountId = deduped.replacements[merged.currentAccountId];
    }
    merged.channels = merged.channels.map((channel) => {
      const account = merged.accounts.find((item) => item.id === channel.accountId);
      const normalized = account?.portal ? { ...channel, url: rewriteProviderLocalUrl(channel.url, account.portal) } : channel;
      if (account?.type === "mac" && !normalized.macCommand) {
        const command = stalkerCommandFromUrl(normalized.url);
        return command ? { ...normalized, macCommand: command, streamFormat: normalized.streamFormat || "mpegts" } : normalized;
      }
      return normalized;
    });
    if (!Array.isArray(merged.epg)) merged.epg = buildDemoEpg(merged.channels);
    if (!Array.isArray(merged.favorites)) merged.favorites = [];
    if (!Array.isArray(merged.hidden)) merged.hidden = [];
    if (!Array.isArray(merged.locked)) merged.locked = [];
    if (!Array.isArray(merged.history)) merged.history = [];
    if (!Array.isArray(merged.smartPlaylists)) merged.smartPlaylists = base.smartPlaylists;
    if (!Array.isArray(merged.schedules)) merged.schedules = [];
    if (!Array.isArray(merged.recordings)) merged.recordings = [];
    if (!Array.isArray(merged.subtitles)) merged.subtitles = [];
    const channelCounts = countChannelsByAccount(merged.channels);
    const largeAccountChannelIds = new Set(merged.channels
      .filter((channel) => (channelCounts[channel.accountId] || 0) > 80)
      .map((channel) => channel.id));
    merged.epg = merged.epg.filter((program) => !(program.source === "demo" && largeAccountChannelIds.has(program.channelId)));
    const accountsWithChannels = merged.accounts.filter((account) => merged.channels.some((channel) => channel.accountId === account.id));
    const realAccountsWithChannels = accountsWithChannels.filter((account) => account.id !== "demo");
    if (!merged.accounts.some((account) => account.id === merged.currentAccountId)
      || (merged.currentAccountId === "demo" && realAccountsWithChannels.length)) {
      merged.currentAccountId = (realAccountsWithChannels[0] || accountsWithChannels[0] || merged.accounts[0])?.id || "demo";
    }
    if (merged.currentChannelId && findChannelIn(merged.channels, merged.currentChannelId)?.accountId !== merged.currentAccountId) {
      merged.currentChannelId = null;
    }
    return merged;
  }

  function dedupeAccounts(accounts) {
    const seen = new Map();
    const replacements = {};
    const dedupedAccounts = [];
    accounts.forEach((account) => {
      const key = accountProfileKey(account);
      if (seen.has(key)) {
        replacements[account.id] = seen.get(key);
      } else {
        seen.set(key, account.id);
        dedupedAccounts.push(account);
      }
    });
    return { accounts: dedupedAccounts, replacements };
  }

  function accountProfileKey(account) {
    if (account.type === "mac" && account.portal && account.mac) {
      return `mac:${trimSlash(account.portal).toLowerCase()}:${normalizeMac(account.mac).toLowerCase()}`;
    }
    if ((account.type === "m3u" || account.type === "xtream") && account.url) {
      return `${account.type}:${account.url.toLowerCase()}`;
    }
    return account.id;
  }

  function saveState() {
    const snapshot = compactStateForStorage(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      if (!isQuotaError(error)) throw error;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compactStateForStorage(true)));
        notify("Storage compacted", "Large guide and recording data was skipped so the profile can be saved.");
      } catch (retryError) {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(compactStateForStorage(true)));
          notify("Storage compacted", "Large guide and recording data was skipped so the profile can be saved.");
        } catch (finalError) {
          console.warn(finalError);
          notify("Storage full", "This browser could not save profile settings.");
        }
      }
    }
  }

  function compactStateForStorage(lean) {
    const channelCounts = countChannelsByAccount(state.channels.filter((channel) => !channel.transient));
    return {
      version: 2,
      accounts: state.accounts.map(compactAccount),
      channels: [],
      catalog: {
        driver: "indexeddb",
        accounts: channelCounts,
        updatedAt: Date.now()
      },
      epg: lean ? [] : state.epg.filter((program) => program.source !== "demo").map(compactProgram),
      favorites: state.favorites,
      hidden: state.hidden,
      locked: state.locked,
      history: state.history.slice(0, lean ? 20 : 40),
      smartPlaylists: state.smartPlaylists,
      schedules: state.schedules,
      recordings: lean ? [] : state.recordings.map(({ objectUrl, ...recording }) => recording),
      subtitles: state.subtitles.map(({ objectUrl, ...subtitle }) => subtitle),
      settings: state.settings,
      currentAccountId: state.currentAccountId,
      currentChannelId: state.currentChannelId
    };
  }

  function compactAccount(account) {
    const {
      id,
      name,
      type,
      source,
      url,
      server,
      username,
      password,
      portal,
      mac,
      createdAt,
      lastSync
    } = account;
    return {
      id,
      name,
      type,
      ...(source ? { source } : {}),
      ...(url ? { url } : {}),
      ...(server ? { server } : {}),
      ...(username ? { username } : {}),
      ...(password ? { password } : {}),
      ...(portal ? { portal } : {}),
      ...(mac ? { mac } : {}),
      createdAt,
      lastSync
    };
  }

  function compactChannel(channel) {
    const account = state.accounts.find((item) => item.id === channel.accountId);
    const canResolveMac = account?.type === "mac" && channel.macCommand;
    const compact = {
      i: channel.id,
      a: channel.accountId,
      n: channel.title
    };
    if (channel.type && channel.type !== "live") compact.t = channel.type;
    if (channel.mediaType) compact.mt = channel.mediaType;
    if (channel.catalogOnly) compact.co = 1;
    if (channel.group) compact.g = channel.group;
    if (channel.url && !canResolveMac) compact.u = channel.url;
    if (channel.logo) compact.l = channel.logo;
    if (channel.description) compact.d = channel.description;
    if (channel.providerId) compact.pid = channel.providerId;
    if (channel.macCommand) compact.m = channel.macCommand;
    if (channel.macEndpoint) compact.e = channel.macEndpoint;
    if (channel.streamFormat) compact.f = channel.streamFormat;
    if (channel.categoryId) compact.cid = channel.categoryId;
    if (channel.adult) compact.ad = 1;
    if (channel.country) compact.c = channel.country;
    if (channel.quality && channel.quality !== inferQuality(`${channel.title || ""} ${channel.group || ""}`)) compact.q = channel.quality;
    if (channel.rating) compact.r = channel.rating;
    if (channel.language && channel.language !== "Portal" && channel.language !== "Unknown") compact.lang = channel.language;
    if (channel.epgId && channel.epgId !== slug(channel.title || "")) compact.p = channel.epgId;
    return compact;
  }

  function compactProgram(program) {
    return {
      i: program.id,
      c: program.channelId,
      e: program.epgId,
      t: program.title,
      d: program.desc,
      s: program.start,
      n: program.end,
      o: program.source
    };
  }

  function expandStoredState(saved) {
    return {
      accounts: Array.isArray(saved.accounts) ? saved.accounts : [],
      channels: Array.isArray(saved.channels) ? saved.channels.map(expandStoredChannel) : [],
      epg: Array.isArray(saved.epg) ? saved.epg.map(expandStoredProgram) : [],
      favorites: saved.favorites,
      hidden: saved.hidden,
      locked: saved.locked,
      history: saved.history,
      smartPlaylists: saved.smartPlaylists,
      schedules: saved.schedules,
      recordings: saved.recordings,
      subtitles: saved.subtitles,
      settings: saved.settings,
      currentAccountId: saved.currentAccountId,
      currentChannelId: saved.currentChannelId
    };
  }

  function expandStoredChannel(channel) {
    if (!channel || typeof channel !== "object") return channel;
    if (!("i" in channel) && !("n" in channel)) return channel;
    const title = channel.n || "Untitled Stream";
    const group = channel.g || "Other";
    return {
      id: channel.i || uid("stream"),
      accountId: channel.a,
      title,
      type: channel.t || "live",
      mediaType: channel.mt || "",
      catalogOnly: Boolean(channel.co),
      group,
      url: channel.u || "",
      logo: channel.l || "",
      description: channel.d || "",
      providerId: channel.pid || "",
      macCommand: channel.m || "",
      macEndpoint: channel.e || "",
      streamFormat: channel.f || "",
      categoryId: channel.cid || "",
      adult: Boolean(channel.ad),
      country: channel.c || "",
      quality: channel.q || inferQuality(`${title} ${group}`),
      rating: channel.r || 0,
      language: channel.lang || (channel.m ? "Portal" : "Unknown"),
      epgId: channel.p || slug(title)
    };
  }

  function expandStoredProgram(program) {
    if (!program || typeof program !== "object") return program;
    if (!("i" in program) && !("c" in program)) return program;
    return {
      id: program.i || uid("epg"),
      channelId: program.c,
      epgId: program.e,
      title: program.t || "Program",
      desc: program.d || "",
      start: program.s,
      end: program.n,
      source: program.o || "xmltv"
    };
  }

  function isQuotaError(error) {
    return error?.name === "QuotaExceededError"
      || error?.name === "NS_ERROR_DOM_QUOTA_REACHED"
      || error?.code === 22
      || error?.code === 1014;
  }

  function bindEvents() {
    $$(".nav-item").forEach((button) => {
      button.addEventListener("click", () => switchView(button.dataset.view));
    });

    $$("[data-filter-type]").forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-filter-type]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        activeType = button.dataset.filterType;
        activeGroup = "All";
        renderChannelBrowser();
      });
    });

    els.globalSearch.addEventListener("input", () => {
      window.clearTimeout(searchRenderTimer);
      searchRenderTimer = window.setTimeout(() => {
        resetChannelScroll();
        renderChannelBrowser();
        renderGuide();
      }, 120);
    });
    els.channelGrid?.addEventListener("scroll", queueVirtualChannelRender, { passive: true });

    $("#addAccountBtn")?.addEventListener("click", () => openAccountDialog());
    $("#addAccountInlineBtn")?.addEventListener("click", () => openAccountDialog());
    $("#openMediaBtn")?.addEventListener("click", () => els.mediaFileInput.click());
    $("#openEpgBtn")?.addEventListener("click", () => els.epgFileInput.click());
    $("#refreshAllBtn")?.addEventListener("click", refreshAllAccounts);
    $("#refreshProfileBtn")?.addEventListener("click", refreshCurrentProfile);
    els.profileSelect?.addEventListener("change", () => switchProfile(els.profileSelect.value));
    els.continueBtn?.addEventListener("click", playMostRecent);
    els.deleteProfileBtn?.addEventListener("click", confirmDeleteCurrentProfile);
    $("#clearHistoryBtn").addEventListener("click", () => {
      state.history = [];
      saveState();
      renderAll();
    });

    $(".account-tabs").addEventListener("click", (event) => {
      const button = event.target.closest("[data-account-type]");
      if (!button) return;
      selectAccountType(button.dataset.accountType);
    });

    $("#m3uFileBtn").addEventListener("click", () => els.m3uFileInput.click());
    els.accountForm.addEventListener("submit", handleAccountSubmit);
    els.m3uFileInput.addEventListener("change", handleM3uFile);
    els.epgFileInput.addEventListener("change", handleEpgFile);
    els.mediaFileInput.addEventListener("change", handleMediaFile);
    els.subtitleFileInput.addEventListener("change", handleSubtitleFile);

    els.playPauseBtn.addEventListener("click", togglePlay);
    els.muteBtn.addEventListener("click", toggleMute);
    els.volumeRange.addEventListener("input", () => {
      state.settings.volume = Number(els.volumeRange.value);
      els.player.volume = state.settings.volume;
      saveState();
      updatePlaybackChrome();
    });
    els.seekRange?.addEventListener("input", seekFromRange);
    els.prevBtn.addEventListener("click", () => stepChannel(-1));
    els.nextBtn.addEventListener("click", () => stepChannel(1));
    els.pipBtn.addEventListener("click", togglePip);
    els.fullscreenBtn.addEventListener("click", toggleFullscreen);
    els.speedSelect?.addEventListener("change", handleSpeedChange);
    els.playerSubtitleBtn?.addEventListener("click", () => openSubtitleDialog());
    els.favoriteBtn.addEventListener("click", toggleFavorite);
    els.hideChannelBtn?.addEventListener("click", () => toggleHiddenChannel());
    els.lockChannelBtn.addEventListener("click", toggleCurrentLock);
    els.scheduleBtn.addEventListener("click", () => openScheduleDialog(currentChannel()));
    els.subtitleBtn.addEventListener("click", () => openSubtitleDialog());
    els.recordNowBtn.addEventListener("click", toggleRecording);

    els.player.addEventListener("play", () => {
      els.playerEmpty.classList.add("is-hidden");
      setPlayerStatus(isLivePlayback() ? "Live" : "Playing");
      updatePlaybackChrome();
      schedulePlayerChromeHide();
    });
    els.player.addEventListener("pause", () => {
      setPlayerStatus(currentChannel() ? "Paused" : "Ready");
      updatePlaybackChrome();
      showPlayerChrome(false);
    });
    els.player.addEventListener("volumechange", () => {
      updatePlaybackChrome();
    });
    els.player.addEventListener("timeupdate", updatePlaybackChrome);
    els.player.addEventListener("durationchange", updatePlaybackChrome);
    els.player.addEventListener("loadedmetadata", () => {
      applyStablePlaybackRate("metadata");
      updatePlaybackChrome();
    });
    els.player.addEventListener("progress", updatePlaybackChrome);
    els.player.addEventListener("playing", recordPlaying);
    els.player.addEventListener("ratechange", () => {
      if (!suppressRateChange) applyStablePlaybackRate("ratechange");
      updatePlaybackChrome();
    });
    els.player.addEventListener("waiting", recordWaiting);
    els.player.addEventListener("stalled", () => setPlayerStatus("Buffering", true));
    els.player.addEventListener("loadstart", () => setPlayerStatus("Loading", true));
    els.player.addEventListener("canplay", () => {
      setPlayerStatus(isLivePlayback() ? "Live" : "Ready");
      schedulePlayerChromeHide();
    });
    els.player.addEventListener("error", () => {
      setPlayerStatus("Issue");
      notify("Playback issue", "The browser could not load this stream.");
    });
    els.player.addEventListener("click", () => {
      if (state.currentChannelId) togglePlay();
    });
    ["mousemove", "pointermove", "touchstart", "click"].forEach((eventName) => {
      els.videoShell.addEventListener(eventName, () => showPlayerChrome());
    });
    els.videoShell.addEventListener("mouseleave", schedulePlayerChromeHide);

    els.favoriteBtn.addEventListener("dblclick", () => switchView("library"));
    els.guideDate.addEventListener("change", renderGuide);
    $("#todayGuideBtn").addEventListener("click", () => {
      els.guideDate.value = toInputDate(new Date());
      renderGuide();
    });

    $("#newSmartBtn").addEventListener("click", () => openSmartDialog());
    els.smartForm.addEventListener("submit", handleSmartSubmit);
    $("#newScheduleBtn").addEventListener("click", () => openScheduleDialog());
    els.scheduleForm.addEventListener("submit", handleScheduleSubmit);
    els.pinForm.addEventListener("submit", handlePinSubmit);

    $("#uploadSubtitleBtn").addEventListener("click", () => els.subtitleFileInput.click());
    $("#addSubtitleUrlBtn").addEventListener("click", () => openSubtitleDialog());
    els.subtitleForm.addEventListener("submit", handleSubtitleSubmit);

    els.themeSelect.addEventListener("change", updateSettingsFromControls);
    els.accentSelect.addEventListener("change", updateSettingsFromControls);
    els.uiScaleRange.addEventListener("input", updateSettingsFromControls);
    els.videoFitSelect.addEventListener("change", updateSettingsFromControls);
    els.brightnessRange.addEventListener("input", updateSettingsFromControls);
    els.contrastRange.addEventListener("input", updateSettingsFromControls);
    els.saturationRange.addEventListener("input", updateSettingsFromControls);
    els.audioOutputSelect.addEventListener("change", changeAudioOutput);
    els.equalizerSelect.addEventListener("change", applyEqualizerPreset);
    $$("[data-eq]").forEach((range, index) => {
      range.addEventListener("input", () => {
        state.settings.eqGains[index] = Number(range.value);
        state.settings.equalizer = "custom";
        applyEqualizer();
        saveState();
      });
    });
    els.parentalEnabled.addEventListener("change", updateSettingsFromControls);
    els.savePinBtn.addEventListener("click", savePin);
    $("#resetSettingsBtn").addEventListener("click", resetSettings);
    els.chatToggleBtn?.addEventListener("click", () => setChatOpen(els.chatPanel.classList.contains("is-hidden")));
    els.chatCloseBtn?.addEventListener("click", () => setChatOpen(false));
    els.chatResetBtn?.addEventListener("click", resetChat);
    els.chatForm?.addEventListener("submit", handleChatSubmit);

    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("fullscreenchange", () => showPlayerChrome());
  }

  function switchView(view) {
    activeView = view;
    $$(".nav-item").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
    $$(".view").forEach((section) => section.classList.toggle("is-active", section.id === `view-${view}`));
    if (view === "library") renderLibrary();
    if (view === "guide") renderGuide();
    if (view === "smart") renderSmartPlaylists();
    if (view === "recordings") renderRecordings();
    if (view === "subtitles") renderSubtitles();
    if (view === "settings") renderSettings();
  }

  function renderAll() {
    renderProfiles();
    renderSourceStatus();
    renderChannelBrowser();
    renderLibrary();
    renderGuide();
    renderSmartPlaylists();
    renderRecordings();
    renderSubtitles();
    renderSettings();
    updateNowPlaying();
  }

  function renderProfiles() {
    if (!els.profileSelect) return;
    const profiles = availableProfiles();
    if (!profiles.some((account) => account.id === state.currentAccountId)) {
      state.currentAccountId = profiles[0]?.id || "demo";
    }
    els.profileSelect.innerHTML = profiles.map((account) => {
      const media = mediaCountsForAccount(account.id);
      const count = media.counts.live || media.counts.all || media.categories.movie + media.categories.series;
      return `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)} (${count})</option>`;
    }).join("");
    els.profileSelect.value = state.currentAccountId;
    if (els.deleteProfileBtn) {
      const account = currentAccount();
      els.deleteProfileBtn.disabled = !account || account.id === "demo";
      els.deleteProfileBtn.title = account?.id === "demo" ? "The built-in demo profile cannot be removed" : "Remove this profile and its channels";
    }
  }

  function availableProfiles() {
    const realProfiles = state.accounts.filter((account) => account.id !== "demo");
    return realProfiles.length ? realProfiles : state.accounts;
  }

  function switchProfile(accountId) {
    if (!accountId || accountId === state.currentAccountId) return;
    state.currentAccountId = accountId;
    if (state.currentChannelId && findChannel(state.currentChannelId)?.accountId !== accountId) {
      state.currentChannelId = null;
      destroyHls();
      els.player.removeAttribute("src");
      els.player.load();
    }
    activeType = "live";
    activeGroup = "All";
    resetChannelScroll();
    saveState();
    renderChannelBrowser();
    renderSourceStatus();
    updateNowPlaying();
    notify("Profile switched", currentAccount()?.name || "Profile");
  }

  function legacyRenderChannelBrowser() {
    const visible = filteredChannels();
    const account = currentAccount();
    if (els.profileSummary) {
      els.profileSummary.textContent = `${visible.length} live channels`;
    }
    els.groupRail.innerHTML = `<div class="profile-summary">${escapeHtml(account?.name || "Profile")} - ${visible.length} live channels</div>`;
    const channels = visible;
    currentList = channels;
    els.channelGrid.innerHTML = channels.length
      ? channels.map(channelCard).join("")
      : emptyRow(account ? "No live channels in this profile" : "Add a profile to load channels");
    $$(".channel-card", els.channelGrid).forEach((card) => {
      card.addEventListener("click", () => playChannelById(card.dataset.id));
    });
  }

  function legacyFilteredChannels() {
    const query = clean(els.globalSearch.value);
    return state.channels.filter((channel) => {
      const profileMatches = channel.accountId === state.currentAccountId;
      const typeMatches = channel.type === "live";
      const searchText = clean(`${channel.title} ${channel.group} ${channel.language} ${channel.quality}`);
      return profileMatches && typeMatches && (!query || searchText.includes(query));
    });
  }

  function legacyChannelCard(channel) {
    const playing = state.currentChannelId === channel.id;
    return `
      <button class="channel-card ${playing ? "is-playing" : ""}" data-id="${escapeHtml(channel.id)}">
        <span class="channel-logo">${escapeHtml(initials(channel.title))}</span>
        <span class="channel-main">
          <span class="channel-title">${escapeHtml(channel.title)}</span>
          <span class="channel-meta">${escapeHtml(channel.group || "Other")} - ${escapeHtml(channel.language || channel.type)}</span>
          <span class="badges">
            <span class="badge accent">${escapeHtml(channel.quality || "SD")}</span>
            ${isFavorite(channel.id) ? `<span class="badge">Fav</span>` : ""}
            ${isLocked(channel.id) ? `<span class="badge warn">PIN</span>` : ""}
            <span class="badge">${escapeHtml(channel.type)}</span>
          </span>
        </span>
      </button>
    `;
  }

  function renderSourceStatus() {
    const account = currentAccount();
    const media = mediaCountsForAccount(account?.id);
    const parts = [
      media.counts.live ? `${media.counts.live} live` : "",
      media.counts.movie ? `${media.counts.movie} movies` : "",
      media.categories.movie && !media.counts.movie ? `${media.categories.movie} movie groups` : "",
      media.counts.series ? `${media.counts.series} series` : "",
      media.categories.series && !media.counts.series ? `${media.categories.series} series groups` : ""
    ].filter(Boolean);
    if (els.sourceHealth) {
      els.sourceHealth.textContent = parts.length ? parts.join(" / ") : "No channels";
    }
    if (els.syncStatus) {
      els.syncStatus.textContent = account?.lastSync ? `Sync ${timeAgo(account.lastSync)}` : "Sync ready";
    }
    if (els.connectionBadge) {
      els.connectionBadge.textContent = account ? `${account.type.toUpperCase()} profile` : "No profile";
    }
  }

  function ensureActiveGroup() {
    if (!TAXONOMY_MODES.some((mode) => mode.id === activeTaxonomy)) activeTaxonomy = "smart";
    const names = channelGroupsForAccount(state.currentAccountId, activeTaxonomy).map((group) => group.name);
    if (!names.includes(activeGroup)) activeGroup = "All";
  }

  function channelGroupsForAccount(accountId, taxonomy = activeTaxonomy) {
    const channels = catalogChannelsForAccount(accountId, activeType);
    const visibleChannels = channels.filter((channel) => !isHidden(channel.id) && channelMatchesTaxonomyBase(channel, taxonomy));
    const historyCount = recentlyWatchedForAccount(accountId)
      .filter((channel) => !isHidden(channel.id) && channelMatchesTaxonomyBase(channel, taxonomy)).length;
    const hiddenCount = hiddenChannelsForAccount(accountId).filter((channel) => channelMatchesTaxonomyBase(channel, taxonomy)).length;
    const groups = [
      { name: "All", count: visibleChannels.length },
      { name: "Favorites", count: visibleChannels.filter((channel) => isFavorite(channel.id)).length },
      { name: "Recently Watched", count: historyCount }
    ];
    const byGroup = new Map();
    visibleChannels.forEach((channel) => {
      const countValue = channel.catalogOnly && hasLoadedCatalogCategory(accountId, channel) ? 0 : 1;
      if (!countValue) return;
      channelGroupNames(channel, taxonomy).forEach((group) => {
        const entry = byGroup.get(group) || { name: group, count: 0, samples: [] };
        entry.count += countValue;
        if (!channel.catalogOnly && entry.samples.length < 3) entry.samples.push(channel);
        byGroup.set(group, entry);
      });
    });
    Array.from(byGroup.values())
      .sort((a, b) => {
        if (a.name === UNGROUPED_GROUP) return 1;
        if (b.name === UNGROUPED_GROUP) return -1;
        const rankA = groupSortPriority(a.name, taxonomy);
        const rankB = groupSortPriority(b.name, taxonomy);
        if (rankA !== rankB) return rankA - rankB;
        return b.count - a.count || a.name.localeCompare(b.name);
      })
      .forEach((group) => groups.push(group));
    if (hiddenCount) groups.push({ name: "Hidden", count: hiddenCount });
    return groups;
  }

  function channelMatchesTaxonomyBase(channel, taxonomy = activeTaxonomy) {
    return taxonomy !== "adult" || isAdultChannel(channel);
  }

  function recentlyWatchedForAccount(accountId) {
    return state.history
      .map((entry) => findChannel(entry.id))
      .filter((channel) => channel && channel.accountId === accountId && channelTypeMatches(channel, activeType) && !channel.catalogOnly);
  }

  function hiddenChannelsForAccount(accountId) {
    return channelsForAccount(accountId, activeType).filter((channel) => isHidden(channel.id));
  }

  function isSystemGroup(name) {
    return ["All", "Favorites", "Recently Watched", "Hidden"].includes(name);
  }

  function channelCollectionName(channel) {
    return channelPrimaryGroup(channel);
  }

  function specialCollectionName(value = "") {
    const text = facetText(value);
    if (isAdultText(text)) return ADULT_GROUP;
    if (/\b(vod|od|movie|series)\s+netflix\b/.test(text) || /\bod\s*netflix\b/.test(text)) return "OD Netflix";
    if (/\bnetflix\b/.test(text) && /\b(ozark|narcos|witcher|lucifer|stranger|series|season|episode)\b/.test(text)) return "OD Netflix";
    if (/\btennis\b/.test(text)) {
      const country = countryPrefix(text);
      return country ? `${country} Tennis` : "Tennis";
    }
    return "";
  }

  function cleanupCollectionName(value = "") {
    const account = currentAccount();
    let name = String(value || "")
      .replace(/[★☆✦•]+/g, " ")
      .replace(/[_|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!name) return "";
    const special = specialCollectionName(name);
    if (special) return special;
    const generic = clean(name);
    const accountName = clean(account?.name || "");
    if (!generic
      || generic === accountName
      || ["mac portal", "portal", "other", "live", "channels", "uncategorized", "general"].includes(generic)) {
      return "";
    }
    return titleCaseCollection(name);
  }

  function inferCollectionFromTitle(title = "") {
    const special = specialCollectionName(title);
    if (special) return special;
    const raw = String(title || "")
      .replace(/[★☆✦•]+/g, " ")
      .replace(/[()[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const split = raw.split(/\s*(?:\||:| - | -- | \/ )\s*/).map((part) => part.trim()).filter(Boolean);
    if (split.length > 1) {
      const prefix = countryPrefix(split[0]);
      const subject = significantTitleToken(split[1]);
      if (prefix && subject) return `${prefix} ${subject}`;
      const namedPrefix = cleanupCollectionName(split[0]);
      if (namedPrefix) return namedPrefix;
    }

    const tokens = raw
      .replace(/[_:|/.-]+/g, " ")
      .split(/\s+/)
      .map((token) => token.replace(/[^a-z0-9+]/gi, ""))
      .filter(Boolean);
    const significant = tokens.filter((token) => !isVariantToken(token));
    if (!significant.length) return "Other";
    const country = canonicalCountry(significant[0]);
    if (country && significant[1]) return `${country} ${titleTokenLabel(significant[1])}`;
    if (/^(od|vod)$/i.test(significant[0]) && significant[1]) return `OD ${titleTokenLabel(significant[1])}`;
    if (significant.length >= 2 && /^[a-z]{2,4}$/i.test(significant[0])) {
      return `${titleTokenLabel(significant[0])} ${titleTokenLabel(significant[1])}`;
    }
    return titleTokenLabel(significant[0]);
  }

  function countryPrefix(value = "") {
    const tokens = String(value).split(/\s+/).map((token) => token.replace(/[^a-z0-9+]/gi, "")).filter(Boolean);
    for (const token of tokens.slice(0, 3)) {
      const country = canonicalCountry(token);
      if (country) return country;
    }
    return "";
  }

  function canonicalCountry(token = "") {
    const value = clean(token);
    const countries = {
      us: "USA",
      usa: "USA",
      uk: "UK",
      gb: "UK",
      ca: "Canada",
      canada: "Canada",
      au: "Australia",
      australia: "Australia",
      in: "India",
      india: "India",
      de: "Germany",
      germany: "Germany",
      fr: "France",
      france: "France",
      es: "Spain",
      spain: "Spain",
      it: "Italy",
      italy: "Italy"
    };
    return countries[value] || "";
  }

  function significantTitleToken(value = "") {
    const token = String(value)
      .replace(/[()[\]{}]/g, " ")
      .split(/\s+/)
      .find((part) => part && !isVariantToken(part));
    return token ? titleTokenLabel(token) : "";
  }

  function isVariantToken(token = "") {
    return /^(hd|fhd|sd|uhd|4k|8k|hevc|h265|h264|plus|\+|vip|raw|live|channel|channels|tv|backup|main|test|event|feed|s\d+e\d+|season|episode)$/i.test(token)
      || /^\d+$/.test(token);
  }

  function titleTokenLabel(token = "") {
    const upper = String(token).toUpperCase();
    if (["USA", "UK", "UFC", "NBA", "NFL", "MLB", "NHL", "OD", "VOD"].includes(upper)) return upper === "VOD" ? "OD" : upper;
    return titleCaseCollection(token);
  }

  function titleCaseCollection(value = "") {
    return String(value)
      .toLowerCase()
      .replace(/\b[a-z0-9+]/g, (letter) => letter.toUpperCase())
      .replace(/\bHd\b/g, "HD")
      .replace(/\bFhd\b/g, "FHD")
      .replace(/\bUhd\b/g, "UHD")
      .replace(/\bTv\b/g, "TV")
      .replace(/\bUsa\b/g, "USA")
      .replace(/\bUk\b/g, "UK")
      .replace(/\bVip\b/g, "VIP")
      .replace(/\bOd\b/g, "OD")
      .replace(/\bVod\b/g, "VOD")
      .replace(/\bNfl\b/g, "NFL")
      .replace(/\bNba\b/g, "NBA")
      .replace(/\bMlb\b/g, "MLB")
      .replace(/\bNhl\b/g, "NHL")
      .replace(/\bUfc\b/g, "UFC")
      .replace(/\bWwe\b/g, "WWE")
      .replace(/\bF1\b/g, "F1")
      .replace(/\bEspn\b/g, "ESPN")
      .replace(/\bDazn\b/g, "DAZN")
      .replace(/\bBein\b/g, "beIN")
      .replace(/\bTsn\b/g, "TSN")
      .replace(/\bBbc\b/g, "BBC")
      .replace(/\bItv\b/g, "ITV")
      .replace(/\bCnn\b/g, "CNN")
      .replace(/\bHbo\b/g, "HBO")
      .replace(/\bOsn\b/g, "OSN")
      .replace(/\bMbc\b/g, "MBC")
      .replace(/\bSd\b/g, "SD")
      .trim();
  }

  const SPORTS_GENRES = new Set(["Tennis", "Football", "Cricket", "Basketball", "Baseball", "Hockey", "Golf", "Racing", "Combat Sports", "Wrestling", "Rugby"]);
  const ADULT_PATTERN = /(?:\b(?:adult|adults|xxx|18\s*plus|18\s*only|erotic|erotica|porn|porno|playboy|brazzers|hustler|penthouse|redlight|naughty|onlyfans|babes|sexy|nude|nudity)\b|\b18\s*\+)/;

  const COUNTRY_CODES = {
    us: "USA",
    usa: "USA",
    uk: "UK",
    gb: "UK",
    ca: "Canada",
    au: "Australia",
    nz: "New Zealand",
    in: "India",
    pk: "Pakistan",
    bd: "Bangladesh",
    lk: "Sri Lanka",
    de: "Germany",
    ger: "Germany",
    fr: "France",
    es: "Spain",
    it: "Italy",
    nl: "Netherlands",
    be: "Belgium",
    pt: "Portugal",
    br: "Brazil",
    mx: "Mexico",
    tr: "Turkey",
    gr: "Greece",
    se: "Sweden",
    dk: "Denmark",
    fi: "Finland",
    pl: "Poland",
    ru: "Russia",
    ua: "Ukraine",
    ro: "Romania",
    bg: "Bulgaria",
    al: "Albania",
    rs: "Serbia",
    hr: "Croatia",
    si: "Slovenia",
    cz: "Czech Republic",
    sk: "Slovakia",
    hu: "Hungary",
    at: "Austria",
    ch: "Switzerland",
    ie: "Ireland",
    il: "Israel",
    sa: "Saudi Arabia",
    ae: "UAE",
    qa: "Qatar",
    eg: "Egypt",
    ma: "Morocco",
    za: "South Africa",
    jp: "Japan",
    kr: "Korea",
    cn: "China",
    hk: "Hong Kong",
    tw: "Taiwan",
    ph: "Philippines",
    id: "Indonesia",
    my: "Malaysia",
    sg: "Singapore",
    th: "Thailand",
    vn: "Vietnam"
  };

  const COUNTRY_NAME_CODES = {
    canada: "Canada",
    australia: "Australia",
    india: "India",
    pakistan: "Pakistan",
    bangladesh: "Bangladesh",
    germany: "Germany",
    france: "France",
    spain: "Spain",
    italy: "Italy",
    netherlands: "Netherlands",
    belgium: "Belgium",
    portugal: "Portugal",
    brazil: "Brazil",
    argentina: "Argentina",
    mexico: "Mexico",
    turkey: "Turkey",
    greece: "Greece",
    sweden: "Sweden",
    denmark: "Denmark",
    finland: "Finland",
    poland: "Poland",
    russia: "Russia",
    ukraine: "Ukraine",
    romania: "Romania",
    bulgaria: "Bulgaria",
    albania: "Albania",
    serbia: "Serbia",
    croatia: "Croatia",
    austria: "Austria",
    switzerland: "Switzerland",
    ireland: "Ireland",
    israel: "Israel",
    japan: "Japan",
    korea: "Korea",
    china: "China"
  };

  const COUNTRY_PHRASES = [
    [/\b(united states|usa|u s a)\b/, "USA"],
    [/\b(united kingdom|great britain|uk)\b/, "UK"],
    [/\bnew zealand\b/, "New Zealand"],
    [/\bsri lanka\b/, "Sri Lanka"],
    [/\bsouth africa\b/, "South Africa"],
    [/\bsaudi arabia\b/, "Saudi Arabia"],
    [/\bunited arab emirates\b|\buae\b/, "UAE"],
    [/\bhong kong\b/, "Hong Kong"],
    [/\bargentina\b/, "Argentina"],
    [/\bnigeria\b/, "Nigeria"],
    [/\bkenya\b/, "Kenya"]
  ];

  const LANGUAGE_CODES = {
    en: "English",
    eng: "English",
    english: "English",
    ar: "Arabic",
    ara: "Arabic",
    arabic: "Arabic",
    hi: "Hindi",
    hin: "Hindi",
    hindi: "Hindi",
    ml: "Malayalam",
    mal: "Malayalam",
    malayalam: "Malayalam",
    ta: "Tamil",
    tam: "Tamil",
    tamil: "Tamil",
    te: "Telugu",
    tel: "Telugu",
    telugu: "Telugu",
    kn: "Kannada",
    kan: "Kannada",
    kannada: "Kannada",
    bn: "Bengali",
    ben: "Bengali",
    bangla: "Bengali",
    bengali: "Bengali",
    ur: "Urdu",
    urdu: "Urdu",
    pa: "Punjabi",
    pan: "Punjabi",
    punjabi: "Punjabi",
    gu: "Gujarati",
    gujarati: "Gujarati",
    mr: "Marathi",
    marathi: "Marathi",
    fr: "French",
    fre: "French",
    fra: "French",
    french: "French",
    de: "German",
    ger: "German",
    deu: "German",
    german: "German",
    es: "Spanish",
    spa: "Spanish",
    spanish: "Spanish",
    it: "Italian",
    ita: "Italian",
    italian: "Italian",
    nl: "Dutch",
    dutch: "Dutch",
    pt: "Portuguese",
    por: "Portuguese",
    portuguese: "Portuguese",
    tr: "Turkish",
    turkish: "Turkish",
    ru: "Russian",
    russian: "Russian",
    pl: "Polish",
    polish: "Polish",
    el: "Greek",
    greek: "Greek",
    sv: "Swedish",
    swedish: "Swedish",
    da: "Danish",
    danish: "Danish",
    fi: "Finnish",
    finnish: "Finnish"
  };

  const LANGUAGE_PHRASES = [
    [/\bmalayalam\b/, "Malayalam"],
    [/\btamil\b/, "Tamil"],
    [/\btelugu\b/, "Telugu"],
    [/\bkannada\b/, "Kannada"],
    [/\bhindi\b/, "Hindi"],
    [/\burdu\b/, "Urdu"],
    [/\barabic\b|\bar\b/, "Arabic"],
    [/\benglish\b|\ben\b/, "English"],
    [/\bfrench\b/, "French"],
    [/\bgerman\b/, "German"],
    [/\bspanish\b/, "Spanish"],
    [/\bportuguese\b/, "Portuguese"]
  ];

  const PROVIDER_PATTERNS = [
    [/\b(od|vod)?\s*netflix\b|\bnetflix\b.*\b(ozark|narcos|witcher|lucifer|stranger|season|episode)\b/, "OD Netflix"],
    [/\bsky\b/, "Sky"],
    [/\bespn\+|\bespn plus\b/, "ESPN+"],
    [/\bespn\b/, "ESPN"],
    [/\bdazn\b/, "DAZN"],
    [/\bbein\b/, "beIN Sports"],
    [/\bziggo\b/, "Ziggo Sport"],
    [/\bviaplay\b/, "Viaplay"],
    [/\btnt sports?\b/, "TNT Sports"],
    [/\bbt sports?\b/, "BT Sport"],
    [/\beurosport\b/, "Eurosport"],
    [/\bfox sports?\b/, "Fox Sports"],
    [/\bnbc sports?\b/, "NBC Sports"],
    [/\bcbs sports?\b/, "CBS Sports"],
    [/\btsn\b/, "TSN"],
    [/\bsportsnet\b/, "Sportsnet"],
    [/\bstar sports?\b/, "Star Sports"],
    [/\bsony (ten|sports?)\b|\bsony liv\b/, "Sony Sports"],
    [/\bsupersport\b/, "SuperSport"],
    [/\bcanal\+|\bcanal plus\b/, "Canal+"],
    [/\bmovistar\b/, "Movistar"],
    [/\bosn\b/, "OSN"],
    [/\bmbc\b/, "MBC"],
    [/\bhbo\b/, "HBO"],
    [/\bdisney\+|\bdisney plus\b/, "Disney+"],
    [/\bprime video\b|\bamazon prime\b/, "Prime Video"],
    [/\bapple tv\b/, "Apple TV"],
    [/\bhulu\b/, "Hulu"],
    [/\bpeacock\b/, "Peacock"],
    [/\bparamount\+|\bparamount plus\b/, "Paramount+"],
    [/\basianet\b/, "Asianet"],
    [/\bsun tv\b/, "Sun TV"],
    [/\bzee\b/, "Zee"],
    [/\bcolors\b/, "Colors"],
    [/\bmanorama\b/, "Manorama"],
    [/\bmazhavil\b/, "Mazhavil"],
    [/\bflowers\b/, "Flowers"],
    [/\bkairali\b/, "Kairali"]
  ];

  function channelGroupNames(channel, taxonomy = activeTaxonomy) {
    const facets = channelGroupFacets(channel);
    const names = facets[taxonomy] || facets.smart || [];
    const normalized = unique(names.map(normalizeGroupLabel).filter(Boolean));
    return normalized.length ? normalized : [UNGROUPED_GROUP];
  }

  function groupSortPriority(name, taxonomy) {
    if (taxonomy !== "smart") return 1;
    if (name === UNGROUPED_GROUP) return 9;
    const text = clean(name);
    if (name === ADULT_GROUP) return 0;
    if (/\b(adult|netflix|tennis|sports?|football|cricket|basketball|baseball|hockey|golf|racing|wrestling|rugby|movies?|news|kids|series|documentary|music|radio|religious)\b/.test(text)) {
      return 0;
    }
    return isCountryGroupName(name) ? 3 : 1;
  }

  function isCountryGroupName(name) {
    const label = normalizeGroupLabel(name);
    return Object.values(COUNTRY_CODES).includes(label) || Object.values(COUNTRY_NAME_CODES).includes(label);
  }

  function channelPrimaryGroup(channel) {
    if (!channel) return UNGROUPED_GROUP;
    if (!isSystemGroup(activeGroup) && channelGroupNames(channel, activeTaxonomy).includes(activeGroup)) return activeGroup;
    const facets = channelGroupFacets(channel);
    return facets.smart?.[0] || facets.raw?.[0] || facets.country?.[0] || facets.language?.[0] || UNGROUPED_GROUP;
  }

  function allChannelGroupLabels(channel) {
    const facets = channelGroupFacets(channel);
    return unique(Object.values(facets).flat().filter(Boolean));
  }

  function channelGroupFacets(channel) {
    const cacheKey = [
      channel?.id,
      channel?.title,
      channel?.type,
      channel?.group,
      channel?.language,
      channel?.adult ? "adult" : "",
      channel?.categoryId,
      channel?.country,
      channel?.quality,
      channel?.epgId
    ].join("|");
    const cached = groupFacetCache.get(cacheKey);
    if (cached) return cached;

    const raw = rawSourceGroups(channel);
    const country = inferCountries(channel);
    const language = inferLanguages(channel);
    const genre = inferGenres(channel);
    const provider = inferProviderBundles(channel);
    const smart = buildSmartGroups({ raw, country, language, genre, provider });
    const facets = {
      smart: smart.length ? smart : [UNGROUPED_GROUP],
      country: country.length ? country : [UNGROUPED_GROUP],
      genre: genre.length ? genre : [UNGROUPED_GROUP],
      adult: genre.includes(ADULT_GROUP) ? [ADULT_GROUP] : [],
      language: language.length ? language : [UNGROUPED_GROUP],
      raw: raw.length ? raw : [UNGROUPED_GROUP]
    };
    groupFacetCache.set(cacheKey, facets);
    return facets;
  }

  function buildSmartGroups({ raw, country, language, genre, provider }) {
    const groups = [];
    const primaryCountry = country[0] || "";
    const primaryLanguage = language[0] || "";
    const sports = genre.filter((item) => item !== "Sports" && SPORTS_GENRES.has(item));
    const themes = genre.filter((item) => item !== "Adult" && item !== "Sports" && !SPORTS_GENRES.has(item));

    if (genre.includes(ADULT_GROUP)) groups.push(ADULT_GROUP);
    if (provider.includes("OD Netflix")) groups.push("OD Netflix");
    sports.forEach((item) => groups.push(primaryCountry ? `${primaryCountry} ${item}` : item));
    themes.forEach((item) => groups.push(primaryCountry ? `${primaryCountry} ${item}` : item));
    provider
      .filter((item) => item !== "OD Netflix")
      .forEach((item) => {
        if (primaryCountry && !clean(item).startsWith(clean(primaryCountry))) groups.push(`${primaryCountry} ${item}`);
        groups.push(item);
      });
    if (!groups.length && primaryCountry && primaryLanguage && !isCountryLanguageRedundant(primaryCountry, primaryLanguage)) groups.push(`${primaryCountry} ${primaryLanguage}`);
    if (!groups.length && primaryCountry) groups.push(primaryCountry);
    if (!groups.length && primaryLanguage) groups.push(primaryLanguage);
    if (!groups.length) groups.push(...raw.slice(0, 2));
    return unique(groups.map(normalizeGroupLabel).filter(Boolean)).slice(0, 8);
  }

  function isCountryLanguageRedundant(country, language) {
    const defaults = {
      Germany: "German",
      France: "French",
      Spain: "Spanish",
      Italy: "Italian",
      Netherlands: "Dutch",
      Portugal: "Portuguese",
      Turkey: "Turkish",
      Russia: "Russian",
      Poland: "Polish",
      Greece: "Greek",
      Sweden: "Swedish",
      Denmark: "Danish",
      Finland: "Finnish"
    };
    return defaults[country] === language;
  }

  function rawSourceGroups(channel) {
    const label = normalizeGroupLabel(channel?.group || "");
    if (!label || isGenericGroupLabel(label, channel)) return [];
    return [label];
  }

  function isGenericGroupLabel(label, channel) {
    const value = clean(label);
    const account = state.accounts.find((item) => item.id === channel?.accountId);
    const accountName = clean(account?.name || "");
    return !value
      || value === accountName
      || ["mac portal", "portal", "other", "uncategorized", "uncategorised", "unknown", "none", "all", "live", "channel", "channels"].includes(value);
  }

  function inferCountries(channel) {
    const values = [];
    addDelimitedCountries(values, channel?.country);
    const text = facetText(`${channel?.group || ""} ${channel?.title || ""} ${channel?.epgId || ""}`);
    COUNTRY_PHRASES.forEach(([pattern, label]) => {
      if (pattern.test(text)) values.push(label);
    });
    facetTokens(`${channel?.group || ""} ${channel?.title || ""}`).slice(0, 6).forEach((token) => {
      const country = COUNTRY_CODES[token] || COUNTRY_NAME_CODES[token];
      if (country) values.push(country);
    });
    return unique(values);
  }

  function addDelimitedCountries(values, input = "") {
    String(input || "").split(/[;,/| ]+/).forEach((part) => {
      const token = clean(part);
      const country = COUNTRY_CODES[token] || COUNTRY_NAME_CODES[token];
      if (country) values.push(country);
    });
  }

  function normalizeCountryValue(input = "") {
    const values = [];
    addDelimitedCountries(values, input);
    return unique(values).join(", ");
  }

  function inferLanguages(channel) {
    const values = [];
    const stored = normalizeLanguage(channel?.language || "");
    if (stored) values.push(stored);
    const text = facetText(`${channel?.group || ""} ${channel?.title || ""} ${channel?.epgId || ""}`);
    LANGUAGE_PHRASES.forEach(([pattern, label]) => {
      if (pattern.test(text)) values.push(label);
    });
    facetTokens(`${channel?.group || ""} ${channel?.title || ""}`).forEach((token) => {
      const language = LANGUAGE_CODES[token];
      if (language) values.push(language);
    });
    return unique(values);
  }

  function normalizeLanguage(value = "") {
    const token = clean(value);
    if (!token || ["portal", "unknown", "local", "default", "audio", "track"].includes(token)) return "";
    return LANGUAGE_CODES[token] || titleCaseCollection(value);
  }

  function inferGenres(channel) {
    const text = facetText(`${channel?.group || ""} ${channel?.title || ""}`);
    const genres = [];
    if (channel?.adult || isAdultText(text)) genres.push(ADULT_GROUP);
    if (channel?.type === "movie") genres.push("Movies");
    if (channel?.type === "series") genres.push("Series");
    if (channel?.type === "music") genres.push("Music");
    if (/\b(tennis|atp|wta)\b/.test(text)) genres.push("Sports", "Tennis");
    if (/\b(football|soccer|premier league|epl|laliga|serie a|bundesliga|uefa|fifa)\b/.test(text)) genres.push("Sports", "Football");
    if (/\b(cricket|ipl|psl|bbl)\b/.test(text)) genres.push("Sports", "Cricket");
    if (/\b(nba|basketball)\b/.test(text)) genres.push("Sports", "Basketball");
    if (/\b(mlb|baseball)\b/.test(text)) genres.push("Sports", "Baseball");
    if (/\b(nhl|hockey)\b/.test(text)) genres.push("Sports", "Hockey");
    if (/\b(golf|pga)\b/.test(text)) genres.push("Sports", "Golf");
    if (/\b(f1|formula 1|motogp|nascar|racing)\b/.test(text)) genres.push("Sports", "Racing");
    if (/\b(ufc|mma|boxing|fight)\b/.test(text)) genres.push("Sports", "Combat Sports");
    if (/\b(wwe|wrestling)\b/.test(text)) genres.push("Sports", "Wrestling");
    if (/\b(rugby)\b/.test(text)) genres.push("Sports", "Rugby");
    if (/\b(news|cnn|bbc news|sky news|al jazeera|fox news)\b/.test(text)) genres.push("News");
    if (/\b(movie|movies|cinema|film|vod|video on demand)\b/.test(text)) genres.push("Movies");
    if (/\b(series|season|episode|s\d{1,2}e\d{1,2}|24\/7)\b/.test(text)) genres.push("Series");
    if (/\b(kids|cartoon|children|nickelodeon|disney junior)\b/.test(text)) genres.push("Kids");
    if (/\b(music|radio|fm|mtv|vh1)\b/.test(text)) genres.push(/\bradio|fm\b/.test(text) ? "Radio" : "Music");
    if (/\b(documentary|history|discovery|nat geo|national geographic)\b/.test(text)) genres.push("Documentary");
    if (/\b(religion|religious|islam|quran|christian|church|bhakti)\b/.test(text)) genres.push("Religious");
    if (/\b(entertainment|general|lifestyle|food|travel)\b/.test(text)) genres.push("Entertainment");
    return unique(genres);
  }

  function inferProviderBundles(channel) {
    const text = facetText(`${channel?.group || ""} ${channel?.title || ""}`);
    const providers = [];
    PROVIDER_PATTERNS.forEach(([pattern, label]) => {
      if (pattern.test(text)) providers.push(label);
    });
    return unique(providers);
  }

  function isAdultChannel(channel) {
    return Boolean(channel?.adult) || isAdultText(facetText(`${channel?.group || ""} ${channel?.title || ""}`));
  }

  function isAdultText(text = "") {
    if (!ADULT_PATTERN.test(text)) return false;
    const withoutKnownFalsePositive = text.replace(/\badult\s+swim\b/g, " ");
    return ADULT_PATTERN.test(withoutKnownFalsePositive);
  }

  function normalizeGroupLabel(value = "") {
    const name = String(value || "")
      .replace(/[\u2605\u2606\u2726\u2022]+/g, " ")
      .replace(/[_]+/g, " ")
      .replace(/[()[\]{}]/g, " ")
      .replace(/\s*(?:\||>|:| - | -- | \/ )\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[-:|/]+|[-:|/]+$/g, "")
      .trim();
    return name ? titleCaseCollection(name) : "";
  }

  function facetText(value = "") {
    return clean(value)
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9+]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function facetTokens(value = "") {
    return facetText(value).split(/\s+/).filter(Boolean);
  }

  function renderChannelBrowser() {
    const account = currentAccount();
    ensureActiveGroup();
    const visible = filteredChannels();
    const query = clean(els.globalSearch.value);
    const groups = channelGroupsForAccount(account?.id, activeTaxonomy);
    const browsableGroups = groups.filter((group) => !isSystemGroup(group.name));
    const taxonomyLabel = TAXONOMY_MODES.find((mode) => mode.id === activeTaxonomy)?.label || "Smart";
    const typeMeta = mediaTypeMeta();
    const media = mediaCountsForAccount(account?.id);
    const loadingCategory = ensureSelectedCategoryItemsLoaded(account, query);
    const catalogLoading = currentCatalogLoadingStatus(account);
    renderCatalogLoadStatus(catalogLoading);
    renderStreamingHome(account, visible, groups, query);
    if (els.catalogTitle) els.catalogTitle.textContent = typeMeta.title;
    if (els.profileSummary) {
      const counts = [
        `${media.counts.live} live`,
        media.counts.movie ? `${media.counts.movie} movies` : `${media.categories.movie} movie groups`,
        media.counts.series ? `${media.counts.series} series` : `${media.categories.series} series groups`
      ];
      els.profileSummary.textContent = account
        ? `${account.name} - ${counts.filter((value) => !value.startsWith("0 ")).join(" / ") || "no items"}`
        : "Add a profile";
    }
    if (els.typeRail) {
      els.typeRail.innerHTML = MEDIA_TYPES.map((type) => {
        const loaded = media.counts[type.id] || 0;
        const categories = media.categories[type.id] || 0;
        const count = type.id === "all" ? media.counts.all : loaded || categories;
        return `
          <button class="${type.id === activeType ? "is-active" : ""}" data-media-type="${escapeHtml(type.id)}" role="tab" aria-selected="${type.id === activeType ? "true" : "false"}">
            ${escapeHtml(type.label)} <span>${count}</span>
          </button>
        `;
      }).join("");
    }
    if (els.taxonomyRail) {
      els.taxonomyRail.innerHTML = TAXONOMY_MODES.map((mode) => `
        <button class="chip ${mode.id === activeTaxonomy ? "is-active" : ""}" data-taxonomy="${escapeHtml(mode.id)}" role="tab" aria-selected="${mode.id === activeTaxonomy ? "true" : "false"}">
          ${escapeHtml(mode.label)}
        </button>
      `).join("");
    }
    const railGroups = compactRailGroups(groups, activeGroup);
    els.groupRail.innerHTML = railGroups.map((group) => `
      <button class="chip ${group.name === activeGroup ? "is-active" : ""}" data-group="${escapeHtml(group.name)}">
        ${escapeHtml(group.name)}
        <span>${group.count}</span>
      </button>
    `).join("");
    currentList = visible;
    if (els.activeGroupTitle) els.activeGroupTitle.textContent = activeGroup === "All" && !query ? `${taxonomyLabel} Groups` : activeGroup;
    if (els.activeGroupMeta) {
      const hiddenCount = hiddenChannelsForAccount(account?.id).length;
      const optimized = catalogChannelsForAccount(account?.id, activeType).length > 1000 ? " - optimized large list" : "";
      els.activeGroupMeta.textContent = activeGroup === "All" && !query
        ? `${browsableGroups.length} ${taxonomyLabel.toLowerCase()} groups - ${visible.length} ${typeMeta.itemLabel}${hiddenCount ? ` - ${hiddenCount} hidden` : ""}${optimized}`
        : `${visible.length} shown${catalogLoading ? ` - loading ${catalogLoading.typeLabel}` : ""}${hiddenCount ? ` - ${hiddenCount} hidden` : ""}${optimized}`;
    }
    if (activeGroup === "All" && !query) {
      renderGroupGrid(browsableGroups, account);
    } else if (loadingCategory && !visible.length) {
      renderLoadingCatalog(account);
    } else {
      renderChannelGrid(visible, account);
    }
    if (els.typeRail) {
      $$("[data-media-type]", els.typeRail).forEach((button) => {
        button.addEventListener("click", () => {
          activeType = button.dataset.mediaType || "live";
          activeTaxonomy = activeType === "live" || activeType === "all" ? "smart" : "raw";
          activeGroup = "All";
          resetChannelScroll();
          renderChannelBrowser();
        });
      });
    }
    $$("[data-taxonomy]", els.taxonomyRail).forEach((button) => {
      button.addEventListener("click", () => {
        activeTaxonomy = button.dataset.taxonomy || "smart";
        activeGroup = "All";
        resetChannelScroll();
        renderChannelBrowser();
      });
    });
    $$(".chip", els.groupRail).forEach((button) => {
      button.addEventListener("click", () => {
        activeGroup = button.dataset.group || "All";
        resetChannelScroll();
        renderChannelBrowser();
      });
    });
  }

  function renderGroupGrid(groups, account) {
    currentGroupList = groups;
    if (!groups.length) {
      els.channelGrid.classList.remove("is-virtualized");
      els.channelGrid.classList.remove("is-group-virtualized");
      els.channelGrid.classList.add("is-group-grid");
      els.channelGrid.innerHTML = emptyRow(account ? `No ${mediaTypeMeta().itemLabel} groups in this profile` : "Add a profile to load channels");
      return;
    }
    els.channelGrid.classList.add("is-group-grid");
    if (groups.length > 48) {
      els.channelGrid.classList.remove("is-virtualized");
      els.channelGrid.classList.add("is-group-virtualized");
      renderVirtualGroupWindow(groups);
      return;
    }
    els.channelGrid.classList.remove("is-virtualized");
    els.channelGrid.classList.remove("is-group-virtualized");
    els.channelGrid.innerHTML = groups.map(groupCard).join("");
    attachGroupGridEvents();
  }

  function renderStreamingHome(account, visible, groups, query) {
    if (!els.streamingHome || !els.heroFeature || !els.contentRows) return;
    const showHome = Boolean(account) && activeGroup === "All" && !query;
    els.streamingHome.classList.toggle("is-hidden", !showHome);
    if (!showHome) {
      els.heroFeature.innerHTML = "";
      els.contentRows.innerHTML = "";
      return;
    }

    const hero = heroFeatureItem(account, visible, groups);
    els.heroFeature.innerHTML = heroFeatureMarkup(hero, account);
    const rows = streamingRows(account, groups);
    els.contentRows.innerHTML = rows.length
      ? rows.map(streamingRowMarkup).join("")
      : "";
    attachStreamingHomeEvents();
  }

  function heroFeatureItem(account, visible, groups) {
    const recent = recentlyWatchedForAccount(account.id).find((channel) => !isHidden(channel.id));
    const favorite = favoriteChannels().find((channel) => channel.accountId === account.id && channelTypeMatches(channel, activeType));
    const playable = visible.find((channel) => channel.url || channel.macCommand);
    const group = groups.find((item) => !isSystemGroup(item.name));
    return {
      channel: recent || favorite || playable || null,
      group,
      title: recent?.title || favorite?.title || playable?.title || `${mediaTypeMeta().title} for ${account.name}`,
      eyebrow: activeType === "all" ? "Streaming home" : mediaTypeMeta().label,
      summary: heroSummary(account, group),
      type: activeType
    };
  }

  function heroSummary(account, group) {
    const media = mediaCountsForAccount(account.id);
    const parts = [
      media.counts.live ? `${media.counts.live} live channels` : "",
      media.counts.movie ? `${media.counts.movie} movies` : media.categories.movie ? `${media.categories.movie} movie groups` : "",
      media.counts.series ? `${media.counts.series} series` : media.categories.series ? `${media.categories.series} series groups` : ""
    ].filter(Boolean);
    const base = parts.length ? parts.join(" / ") : "Add content to this profile";
    return group ? `${base}. Featured group: ${group.name}.` : base;
  }

  function heroFeatureMarkup(hero, account) {
    const channel = hero.channel;
    const group = hero.group;
    const canPlay = channel && (channel.url || channel.macCommand);
    const posterStyle = channel?.logo ? ` style="background-image:url('${escapeAttribute(channel.logo)}')"` : "";
    return `
      <article class="hero-feature-card" role="region" aria-label="Featured ${escapeHtml(hero.eyebrow)}">
        <div class="hero-art"${posterStyle}>
          <span>${escapeHtml(initials(channel?.title || group?.name || account.name))}</span>
        </div>
        <div class="hero-copy">
          <small>${escapeHtml(hero.eyebrow)}</small>
          <h2>${escapeHtml(hero.title)}</h2>
          <p>${escapeHtml(hero.summary)}</p>
          <div class="hero-actions">
            ${canPlay ? `<button class="primary-btn" data-home-play="${escapeHtml(channel.id)}">Play now</button>` : ""}
            ${group ? `<button class="ghost-btn" data-home-group="${escapeHtml(group.name)}" data-home-type="${escapeHtml(activeType)}">Open group</button>` : ""}
            <button class="ghost-btn" data-home-type="${escapeHtml(activeType === "all" ? "live" : activeType)}">Browse ${escapeHtml(mediaTypeMeta(activeType === "all" ? "live" : activeType).label)}</button>
          </div>
        </div>
      </article>
    `;
  }

  function streamingRows(account, groups) {
    const rows = [];
    const recent = recentlyWatchedForAccount(account.id).filter((channel) => !isHidden(channel.id)).slice(0, 14);
    if (recent.length) rows.push({
      title: "Continue Watching",
      subtitle: "Resume streams from this profile",
      kind: "channel",
      items: recent.map(channelRowItem)
    });

    const liveGroups = topGroupsForType(account.id, "live", "smart", 14);
    if (liveGroups.length) rows.push({
      title: "Live TV Channels",
      subtitle: "Browse the strongest live channel groups",
      kind: "group",
      items: liveGroups.map((group) => groupRowItem(group, "live", "smart"))
    });

    const movieGroups = topGroupsForType(account.id, "movie", "raw", 14);
    if (movieGroups.length) rows.push({
      title: "Movies",
      subtitle: "On-demand categories from the portal",
      kind: "group",
      items: movieGroups.map((group) => groupRowItem(group, "movie", "raw"))
    });

    const seriesGroups = topGroupsForType(account.id, "series", "raw", 14);
    if (seriesGroups.length) rows.push({
      title: "Series",
      subtitle: "Shows and season catalogs",
      kind: "group",
      items: seriesGroups.map((group) => groupRowItem(group, "series", "raw"))
    });

    const currentGroups = groups.filter((group) => !isSystemGroup(group.name)).slice(0, 14);
    if (!rows.length && currentGroups.length) rows.push({
      title: `${mediaTypeMeta().label} Highlights`,
      subtitle: "Start with a group",
      kind: "group",
      items: currentGroups.map((group) => groupRowItem(group, activeType, activeTaxonomy))
    });
    return rows;
  }

  function topGroupsForType(accountId, type, taxonomy, limit) {
    const channels = catalogChannelsForAccount(accountId, type)
      .filter((channel) => !isHidden(channel.id) && channelMatchesTaxonomyBase(channel, taxonomy));
    const byGroup = new Map();
    channels.forEach((channel) => {
      channelGroupNames(channel, taxonomy).forEach((name) => {
        if (isSystemGroup(name)) return;
        const entry = byGroup.get(name) || { name, count: 0, samples: [] };
        entry.count += 1;
        if (!channel.catalogOnly && entry.samples.length < 3) entry.samples.push(channel);
        byGroup.set(name, entry);
      });
    });
    return Array.from(byGroup.values())
      .filter((group) => group.name !== UNGROUPED_GROUP)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  function channelRowItem(channel) {
    return {
      id: channel.id,
      title: channel.title,
      subtitle: channelPrimaryGroup(channel),
      badge: channel.quality || mediaTypeMeta(channel.type).label,
      logo: channel.logo || "",
      initials: initials(channel.title),
      action: "play"
    };
  }

  function groupRowItem(group, type, taxonomy) {
    return {
      id: group.name,
      title: group.name,
      subtitle: `${group.count} ${mediaTypeMeta(type).itemLabel}`,
      badge: mediaTypeMeta(type).label,
      initials: initials(group.name),
      type,
      taxonomy,
      action: "group"
    };
  }

  function streamingRowMarkup(row) {
    return `
      <section class="content-row" role="region" aria-label="${escapeHtml(row.title)}">
        <div class="content-row-head">
          <div>
            <h2>${escapeHtml(row.title)}</h2>
            <span>${escapeHtml(row.subtitle)}</span>
          </div>
        </div>
        <div class="content-track">
          ${row.items.map(streamCardMarkup).join("")}
        </div>
      </section>
    `;
  }

  function streamCardMarkup(item) {
    const imageStyle = item.logo ? ` style="background-image:url('${escapeAttribute(item.logo)}')"` : "";
    const actionAttrs = item.action === "play"
      ? `data-home-play="${escapeHtml(item.id)}"`
      : `data-home-group="${escapeHtml(item.id)}" data-home-type="${escapeHtml(item.type)}" data-home-taxonomy="${escapeHtml(item.taxonomy)}"`;
    return `
      <button class="stream-card" ${actionAttrs} type="button" aria-label="${escapeHtml(item.title)}">
        <span class="stream-thumb"${imageStyle}><b>${escapeHtml(item.initials)}</b></span>
        <span class="stream-card-info">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.subtitle)}</span>
          <em>${escapeHtml(item.badge)}</em>
        </span>
      </button>
    `;
  }

  function attachStreamingHomeEvents() {
    $$("[data-home-play]", els.streamingHome).forEach((button) => {
      button.addEventListener("click", () => playChannelById(button.dataset.homePlay));
    });
    $$("[data-home-group]", els.streamingHome).forEach((button) => {
      button.addEventListener("click", () => {
        activeType = button.dataset.homeType || activeType;
        activeTaxonomy = button.dataset.homeTaxonomy || (activeType === "live" || activeType === "all" ? "smart" : "raw");
        activeGroup = button.dataset.homeGroup || "All";
        resetChannelScroll();
        renderChannelBrowser();
      });
    });
    $$("[data-home-type]:not([data-home-group])", els.streamingHome).forEach((button) => {
      button.addEventListener("click", () => {
        activeType = button.dataset.homeType || "live";
        activeTaxonomy = activeType === "live" || activeType === "all" ? "smart" : "raw";
        activeGroup = "All";
        resetChannelScroll();
        renderChannelBrowser();
      });
    });
  }

  function attachGroupGridEvents() {
    $$("[data-open-group]", els.channelGrid).forEach((card) => {
      card.addEventListener("click", () => {
        activeGroup = card.dataset.openGroup || "All";
        resetChannelScroll();
        renderChannelBrowser();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activeGroup = card.dataset.openGroup || "All";
        resetChannelScroll();
        renderChannelBrowser();
      });
    });
  }

  function renderChannelGrid(channels, account) {
    els.channelGrid.classList.remove("is-group-grid");
    els.channelGrid.classList.remove("is-group-virtualized");
    if (!channels.length) {
      els.channelGrid.classList.remove("is-virtualized");
      els.channelGrid.innerHTML = emptyRow(account ? `No ${mediaTypeMeta().itemLabel} in this profile` : "Add a profile to load channels");
      return;
    }
    els.channelGrid.classList.add("is-virtualized");
    renderVirtualChannelWindow(channels);
  }

  function renderLoadingCatalog(account) {
    els.channelGrid.classList.remove("is-group-grid");
    els.channelGrid.classList.remove("is-group-virtualized");
    els.channelGrid.classList.remove("is-virtualized");
    els.channelGrid.innerHTML = account
      ? loadingPanel("Loading catalog group", "Fetching this category from the portal. Large groups can take a minute.")
      : emptyRow("Add a profile to load channels");
  }

  function selectedCatalogPlaceholders(accountId) {
    if (!accountId || activeGroup === "All" || isSystemGroup(activeGroup)) return [];
    return catalogChannelsForAccount(accountId, activeType)
      .filter((channel) => channel.catalogOnly && !isHidden(channel.id))
      .filter((channel) => channelGroupNames(channel, activeTaxonomy).includes(activeGroup));
  }

  function categoryLoadKey(accountId, placeholder) {
    return `${accountId}:${placeholder.type}:${placeholder.categoryId || placeholder.group}`;
  }

  function hasLoadedCatalogCategory(accountId, placeholder) {
    return channelsForAccount(accountId, placeholder.type).some((channel) => (
      channel.categoryId
      && placeholder.categoryId
      && channel.categoryId === placeholder.categoryId
    ));
  }

  function ensureSelectedCategoryItemsLoaded(account, query) {
    if (!account?.portal || query) return false;
    const placeholders = selectedCatalogPlaceholders(account.id)
      .filter((placeholder) => !hasLoadedCatalogCategory(account.id, placeholder))
      .filter((placeholder) => !failedCategoryLoads.has(categoryLoadKey(account.id, placeholder)));
    if (!placeholders.length) return false;
    const placeholder = placeholders[0];
    const key = categoryLoadKey(account.id, placeholder);
    if (!pendingCategoryLoads.has(key)) {
      pendingCategoryLoads.add(key);
      loadingCatalogs.set(key, {
        title: placeholder.group || placeholder.title || "Catalog group",
        type: placeholder.type || activeType,
        typeLabel: mediaTypeMeta(placeholder.type).itemLabel
      });
      loadMacCategoryItems(account, placeholder)
        .catch((error) => {
          failedCategoryLoads.add(key);
          notify("Catalog load failed", error.message || "The portal did not return this group.");
        })
        .finally(() => {
          pendingCategoryLoads.delete(key);
          loadingCatalogs.delete(key);
          renderChannelBrowser();
          renderProfiles();
          renderSourceStatus();
        });
    }
    return true;
  }

  function currentCatalogLoadingStatus(account) {
    if (!account?.id) return null;
    const placeholders = selectedCatalogPlaceholders(account.id);
    for (const placeholder of placeholders) {
      const key = categoryLoadKey(account.id, placeholder);
      if (pendingCategoryLoads.has(key)) return loadingCatalogs.get(key) || {
        title: placeholder.group || placeholder.title || "Catalog group",
        type: placeholder.type || activeType,
        typeLabel: mediaTypeMeta(placeholder.type).itemLabel
      };
    }
    return null;
  }

  function renderCatalogLoadStatus(status) {
    if (!els.catalogLoadStatus) return;
    if (!status) {
      els.catalogLoadStatus.classList.add("is-hidden");
      els.catalogLoadStatus.innerHTML = "";
      return;
    }
    els.catalogLoadStatus.classList.remove("is-hidden");
    els.catalogLoadStatus.innerHTML = `
      <span class="loading-spinner"></span>
      <span>
        <strong>Loading ${escapeHtml(status.typeLabel)}</strong>
        <small>${escapeHtml(status.title)}</small>
      </span>
    `;
  }

  function loadingPanel(title, message) {
    return `
      <div class="loading-panel">
        <span class="loading-spinner"></span>
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(message)}</span>
        </div>
        <div class="loading-skeleton"><span></span><span></span><span></span></div>
      </div>
    `;
  }

  function queueVirtualChannelRender() {
    if (!els.channelGrid?.classList.contains("is-virtualized")
      && !els.channelGrid?.classList.contains("is-group-virtualized")) return;
    if (channelRenderFrame) return;
    channelRenderFrame = window.requestAnimationFrame(() => {
      channelRenderFrame = 0;
      if (els.channelGrid.classList.contains("is-group-virtualized")) renderVirtualGroupWindow(currentGroupList);
      else renderVirtualChannelWindow(currentList);
    });
  }

  function renderVirtualGroupWindow(groups) {
    const viewportHeight = Math.max(360, els.channelGrid.clientHeight || 620);
    const width = Math.max(GROUP_CARD_MIN_WIDTH, els.channelGrid.clientWidth || GROUP_CARD_MIN_WIDTH);
    const columns = Math.max(1, Math.floor((width + 8) / (GROUP_CARD_MIN_WIDTH + 8)));
    const scrollTop = els.channelGrid.scrollTop || 0;
    const totalRows = Math.ceil(groups.length / columns);
    const totalHeight = Math.max(GROUP_ROW_HEIGHT, totalRows * GROUP_ROW_HEIGHT);
    const visibleRows = Math.ceil(viewportHeight / GROUP_ROW_HEIGHT) + CHANNEL_OVERSCAN;
    const startRow = Math.min(Math.max(0, totalRows - visibleRows), Math.max(0, Math.floor(scrollTop / GROUP_ROW_HEIGHT) - 4));
    const endRow = Math.min(totalRows, startRow + visibleRows);
    const start = startRow * columns;
    const end = Math.min(groups.length, endRow * columns);
    const offsetTop = startRow * GROUP_ROW_HEIGHT;
    els.channelGrid.innerHTML = `
      <div class="group-virtual-space" style="height:${totalHeight}px">
        <div class="group-virtual-window" style="transform:translateY(${offsetTop}px);grid-template-columns:repeat(${columns}, minmax(0, 1fr))">
          ${groups.slice(start, end).map(groupCard).join("")}
        </div>
      </div>
    `;
    attachGroupGridEvents();
  }

  function renderVirtualChannelWindow(channels) {
    const viewportHeight = Math.max(360, els.channelGrid.clientHeight || 620);
    const scrollTop = els.channelGrid.scrollTop || 0;
    const totalHeight = Math.max(CHANNEL_ROW_HEIGHT, channels.length * CHANNEL_ROW_HEIGHT);
    const visibleCount = Math.ceil(viewportHeight / CHANNEL_ROW_HEIGHT) + CHANNEL_OVERSCAN * 2;
    const maxStart = Math.max(0, channels.length - visibleCount);
    const start = Math.min(maxStart, Math.max(0, Math.floor(scrollTop / CHANNEL_ROW_HEIGHT) - CHANNEL_OVERSCAN));
    const end = Math.min(channels.length, start + visibleCount);
    const offsetTop = start * CHANNEL_ROW_HEIGHT;
    els.channelGrid.innerHTML = `
      <div class="channel-virtual-space" style="height:${totalHeight}px">
        <div class="channel-virtual-window" style="transform:translateY(${offsetTop}px)">
          ${channels.slice(start, end).map(channelCard).join("")}
        </div>
      </div>
    `;
    attachChannelGridEvents();
  }

  function attachChannelGridEvents() {
    $$(".channel-card", els.channelGrid).forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-channel-action]")) return;
        playChannelById(card.dataset.id);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        playChannelById(card.dataset.id);
      });
    });
    $$("[data-play-channel]", els.channelGrid).forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      playChannelById(button.dataset.playChannel);
    }));
    $$("[data-favorite-channel]", els.channelGrid).forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavoriteById(button.dataset.favoriteChannel);
    }));
    $$("[data-hide-channel]", els.channelGrid).forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleHiddenChannel(button.dataset.hideChannel);
    }));
  }

  function resetChannelScroll() {
    if (els.channelGrid) els.channelGrid.scrollTop = 0;
  }

  function filteredChannels() {
    const query = clean(els.globalSearch.value);
    const profileChannels = channelsForAccount(state.currentAccountId, activeType)
      .filter((channel) => channelMatchesTaxonomyBase(channel, activeTaxonomy));
    const base = activeGroup === "Recently Watched"
      ? recentlyWatchedForAccount(state.currentAccountId).filter((channel) => channelMatchesTaxonomyBase(channel, activeTaxonomy))
      : profileChannels;
    return base.filter((channel) => {
      const groupMatches = activeGroup === "All"
        || (activeGroup === "Favorites" && isFavorite(channel.id))
        || (activeGroup === "Hidden" && isHidden(channel.id))
        || activeGroup === "Recently Watched"
        || channelGroupNames(channel, activeTaxonomy).includes(activeGroup);
      const hiddenMatches = activeGroup === "Hidden" ? isHidden(channel.id) : !isHidden(channel.id);
      const searchText = clean(`${channel.title} ${channel.group} ${allChannelGroupLabels(channel).join(" ")} ${channel.description || ""} ${channel.language} ${channel.quality}`);
      return groupMatches && hiddenMatches && (!query || searchText.includes(query));
    });
  }

  function groupCard(group) {
    const channels = group.samples || [];
    return `
      <article class="group-card" data-open-group="${escapeHtml(group.name)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(group.name)}">
        <span class="group-logo">${escapeHtml(initials(group.name))}</span>
        <span class="group-main">
          <strong>${escapeHtml(group.name)}</strong>
          <span>${group.count} ${escapeHtml(mediaTypeMeta().itemLabel)}</span>
          <span class="group-preview">${channels.map((channel) => escapeHtml(channel.title)).join(" / ")}</span>
        </span>
      </article>
    `;
  }

  function compactRailGroups(groups, selectedName) {
    const system = groups.filter((group) => isSystemGroup(group.name));
    const pinnedNames = activeTaxonomy === "adult" ? [ADULT_GROUP] : [ADULT_GROUP, "OD Netflix"];
    const pinned = groups.filter((group) => !isSystemGroup(group.name) && pinnedNames.includes(group.name));
    const common = groups
      .filter((group) => !isSystemGroup(group.name) && !pinned.includes(group))
      .slice(0, Math.max(0, 54 - pinned.length));
    const selected = groups.find((group) => group.name === selectedName
      && !system.includes(group)
      && !pinned.includes(group)
      && !common.includes(group));
    return selected ? [...system, ...pinned, selected, ...common] : [...system, ...pinned, ...common];
  }

  function channelsForCollection(name) {
    return channelsForAccount(state.currentAccountId, activeType)
      .filter((channel) => !isHidden(channel.id)
        && channelMatchesTaxonomyBase(channel, activeTaxonomy)
        && channelGroupNames(channel, activeTaxonomy).includes(name));
  }

  function channelCard(channel) {
    const playing = state.currentChannelId === channel.id;
    const hidden = isHidden(channel.id);
    const favorite = isFavorite(channel.id);
    const primaryGroup = channelPrimaryGroup(channel);
    const metaLabel = normalizeLanguage(channel.language) || rawSourceGroups(channel)[0] || channel.type;
    const playable = Boolean(channel.url || channel.macCommand);
    return `
      <article class="channel-card ${playing ? "is-playing" : ""}" data-id="${escapeHtml(channel.id)}" tabindex="0" role="button" aria-label="Play ${escapeHtml(channel.title)}">
        <span class="channel-logo">${escapeHtml(initials(channel.title))}</span>
        <span class="channel-main">
          <span class="channel-title">${escapeHtml(channel.title)}</span>
          <span class="channel-meta">${escapeHtml(primaryGroup)} - ${escapeHtml(metaLabel)}</span>
          <span class="badges">
            <span class="badge accent">${escapeHtml(channel.quality || "SD")}</span>
            ${favorite ? `<span class="badge">Fav</span>` : ""}
            ${hidden ? `<span class="badge warn">Hidden</span>` : ""}
            ${isLocked(channel.id) ? `<span class="badge warn">PIN</span>` : ""}
            ${channel.type !== "live" ? `<span class="badge">${escapeHtml(mediaTypeMeta(channel.type).label)}</span>` : ""}
          </span>
        </span>
        <span class="channel-actions">
          <button class="ghost-btn" data-channel-action data-favorite-channel="${escapeHtml(channel.id)}">${favorite ? "Saved" : "Save"}</button>
          <button class="ghost-btn" data-channel-action data-hide-channel="${escapeHtml(channel.id)}">${hidden ? "Unhide" : "Hide"}</button>
          <button class="primary-btn" data-channel-action data-play-channel="${escapeHtml(channel.id)}">${playable ? "Play" : "Open"}</button>
        </span>
      </article>
    `;
  }

  function renderLibrary() {
    els.accountsList.innerHTML = state.accounts.map((account) => {
      const count = state.channels.filter((channel) => channel.accountId === account.id).length;
      return `
        <div class="list-row">
          <div>
            <div class="row-title">${escapeHtml(account.name)}</div>
            <div class="row-meta">${escapeHtml(account.type)} - ${count} streams</div>
          </div>
          <div class="list-actions">
            <button class="icon-btn" data-refresh-account="${escapeHtml(account.id)}" title="Refresh">Sync</button>
            ${account.id !== "demo" ? `<button class="icon-btn" data-delete-account="${escapeHtml(account.id)}" title="Delete">Del</button>` : ""}
          </div>
        </div>
      `;
    }).join("");

    els.favoritesList.innerHTML = favoriteChannels().length
      ? favoriteChannels().map((channel) => listRow(channel, "Play", `data-play="${escapeHtml(channel.id)}"`)).join("")
      : emptyRow("No favorites");
    els.favoriteCount.textContent = String(favoriteChannels().length);

    const history = state.history.slice(0, 12);
    els.historyList.innerHTML = history.length
      ? history.map((item) => {
        const channel = findChannel(item.id);
        return `
          <div class="list-row">
            <div>
              <div class="row-title">${escapeHtml(channel?.title || item.title || "Unknown stream")}</div>
              <div class="row-meta">${timeAgo(item.at)} - ${escapeHtml(channel?.group || "History")}</div>
            </div>
            ${channel ? `<button class="icon-btn" data-play="${escapeHtml(channel.id)}" title="Play">Play</button>` : ""}
          </div>
        `;
      }).join("")
      : emptyRow("No history yet");

    $$("[data-play]").forEach((button) => button.addEventListener("click", () => playChannelById(button.dataset.play)));
    $$("[data-delete-account]").forEach((button) => button.addEventListener("click", () => deleteAccount(button.dataset.deleteAccount)));
    $$("[data-refresh-account]").forEach((button) => button.addEventListener("click", () => refreshAccount(button.dataset.refreshAccount)));
  }

  function renderGuide() {
    const date = new Date(`${els.guideDate.value || toInputDate(new Date())}T00:00:00`);
    const query = clean(els.globalSearch.value);
    const channels = state.channels
      .filter((channel) => !query || clean(`${channel.title} ${channel.group}`).includes(query))
      .slice(0, 28);
    els.guideGrid.innerHTML = channels.length
      ? channels.map((channel) => {
        const programs = programsFor(channel, date).slice(0, 8);
        return `
          <div class="guide-row">
            <button class="guide-channel" data-play="${escapeHtml(channel.id)}">${escapeHtml(channel.title)}</button>
            <div class="guide-programs">
              ${programs.map((program) => `
                <button class="guide-program" data-play="${escapeHtml(channel.id)}">
                  <span>${formatTime(program.start)} - ${formatTime(program.end)}</span>
                  <strong>${escapeHtml(program.title)}</strong>
                  <span>${escapeHtml(program.desc || channel.group || "")}</span>
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }).join("")
      : emptyRow("No guide rows");
    $$("[data-play]", els.guideGrid).forEach((button) => button.addEventListener("click", () => playChannelById(button.dataset.play)));
  }

  function renderSmartPlaylists() {
    els.smartGrid.innerHTML = state.smartPlaylists.map((playlist) => {
      const matches = smartMatches(playlist);
      return `
        <section class="smart-card">
          <div>
            <h2>${escapeHtml(playlist.name)}</h2>
            <div class="row-meta">${matches.length} streams - ${escapeHtml(playlist.type || "all")}</div>
          </div>
          <div class="badges">
            ${playlist.group ? `<span class="badge">${escapeHtml(playlist.group)}</span>` : ""}
            ${playlist.query ? `<span class="badge">${escapeHtml(playlist.query)}</span>` : ""}
            ${playlist.onlyHd ? `<span class="badge accent">HD</span>` : ""}
            ${playlist.favoritesOnly ? `<span class="badge warn">Fav</span>` : ""}
          </div>
          <button class="primary-btn" data-open-smart="${escapeHtml(playlist.id)}">Open</button>
          <div class="list-actions">
            <button class="ghost-btn" data-edit-smart="${escapeHtml(playlist.id)}">Edit</button>
            <button class="danger-btn" data-delete-smart="${escapeHtml(playlist.id)}">Delete</button>
          </div>
        </section>
      `;
    }).join("");
    $$("[data-open-smart]").forEach((button) => button.addEventListener("click", () => openSmartPlaylist(button.dataset.openSmart)));
    $$("[data-edit-smart]").forEach((button) => button.addEventListener("click", () => openSmartDialog(button.dataset.editSmart)));
    $$("[data-delete-smart]").forEach((button) => button.addEventListener("click", () => deleteSmart(button.dataset.deleteSmart)));
  }

  function renderRecordings() {
    els.scheduleCount.textContent = String(state.schedules.length);
    els.recordingCount.textContent = String(state.recordings.length);
    els.scheduleList.innerHTML = state.schedules.length
      ? state.schedules.map((entry) => {
        const channel = findChannel(entry.channelId);
        return `
          <div class="list-row">
            <div>
              <div class="row-title">${escapeHtml(channel?.title || entry.title || "Unknown")}</div>
              <div class="row-meta">${formatDateTime(entry.start)} - ${escapeHtml(entry.action)}</div>
            </div>
            <div class="list-actions">
              <button class="icon-btn" data-play="${escapeHtml(entry.channelId)}" title="Play">Play</button>
              <button class="icon-btn" data-delete-schedule="${escapeHtml(entry.id)}" title="Delete">Del</button>
            </div>
          </div>
        `;
      }).join("")
      : emptyRow("No schedules");

    els.recordingList.innerHTML = state.recordings.length
      ? state.recordings.map((recording) => `
        <div class="list-row">
          <div>
            <div class="row-title">${escapeHtml(recording.title)}</div>
            <div class="row-meta">${formatDateTime(recording.createdAt)} - ${formatBytes(recording.size || 0)}</div>
          </div>
          <div class="list-actions">
            ${recording.objectUrl ? `<a class="ghost-btn" href="${recording.objectUrl}" download="${escapeHtml(recording.filename)}">Save</a>` : ""}
            <button class="icon-btn" data-delete-recording="${escapeHtml(recording.id)}" title="Delete">Del</button>
          </div>
        </div>
      `).join("")
      : emptyRow("No captured files");

    $$("[data-play]", els.scheduleList).forEach((button) => button.addEventListener("click", () => playChannelById(button.dataset.play)));
    $$("[data-delete-schedule]").forEach((button) => button.addEventListener("click", () => deleteSchedule(button.dataset.deleteSchedule)));
    $$("[data-delete-recording]").forEach((button) => button.addEventListener("click", () => deleteRecording(button.dataset.deleteRecording)));
  }

  function renderSubtitles() {
    els.subtitleList.innerHTML = state.subtitles.length
      ? state.subtitles.map((subtitle) => `
        <div class="list-row">
          <div>
            <div class="row-title">${escapeHtml(subtitle.name)}</div>
            <div class="row-meta">${escapeHtml(subtitle.language || "Subtitle")} - ${subtitle.linkedChannelId ? "Linked" : "Manual"}</div>
          </div>
          <div class="list-actions">
            <button class="ghost-btn" data-apply-subtitle="${escapeHtml(subtitle.id)}">Apply</button>
            <button class="icon-btn" data-link-subtitle="${escapeHtml(subtitle.id)}" title="Link">Link</button>
            <button class="icon-btn" data-delete-subtitle="${escapeHtml(subtitle.id)}" title="Delete">Del</button>
          </div>
        </div>
      `).join("")
      : emptyRow("No subtitles");
    $$("[data-apply-subtitle]").forEach((button) => button.addEventListener("click", () => applySubtitle(button.dataset.applySubtitle)));
    $$("[data-link-subtitle]").forEach((button) => button.addEventListener("click", () => linkSubtitle(button.dataset.linkSubtitle)));
    $$("[data-delete-subtitle]").forEach((button) => button.addEventListener("click", () => deleteSubtitle(button.dataset.deleteSubtitle)));
  }

  function renderSettings() {
    els.themeSelect.value = state.settings.theme;
    els.accentSelect.value = state.settings.accent;
    els.uiScaleRange.value = state.settings.uiScale;
    els.videoFitSelect.value = state.settings.videoFit;
    els.brightnessRange.value = state.settings.brightness;
    els.contrastRange.value = state.settings.contrast;
    els.saturationRange.value = state.settings.saturation;
    els.parentalEnabled.checked = state.settings.parentalEnabled;
    els.pinInput.value = state.settings.parentalPin || "";
    els.equalizerSelect.value = eqPresets[state.settings.equalizer] ? state.settings.equalizer : "flat";
    $$("[data-eq]").forEach((range, index) => {
      range.value = state.settings.eqGains[index] ?? 0;
    });
  }

  function playChannelById(id) {
    const channel = findChannel(id);
    if (channel) playChannel(channel);
  }

  async function playChannel(channel, options = {}) {
    if (!channel.url && !channel.macCommand) {
      notify(channel.type === "series" ? "Series selected" : "Missing stream",
        channel.type === "series"
          ? "This provider exposes the series title, but no episode stream was returned yet."
          : "This item does not have a playable URL or portal command.");
      return;
    }
    if (state.settings.parentalEnabled && isLocked(channel.id) && !options.authorized) {
      pendingLockedChannel = channel;
      $("#unlockPin").value = "";
      openDialog(els.pinDialog);
      return;
    }

    state.currentChannelId = channel.id;
    if (options.recovering) {
      lastProgressAt = Date.now();
      waitStartedAt = null;
    } else {
      startPlaybackSession(channel);
    }
    let playable;
    try {
      playable = await playableSourceFor(channel);
    } catch (error) {
      notify("Stream unavailable", error.message || "The provider did not return a playable stream.");
      return;
    }
    setupSource(playable.url, { format: playable.format });
    els.player.volume = state.settings.volume;
    els.player.muted = state.settings.muted;
    applyStablePlaybackRate("play");
    setPlayerStatus("Loading", true);
    updatePlaybackChrome();
    try {
      await els.player.play();
    } catch (error) {
      notify("Autoplay blocked", "Press play in the player controls.");
    }
    rememberHistory(channel);
    autoApplySubtitle(channel);
    saveState();
    updateNowPlaying();
    renderChannelBrowser();
    renderLibrary();
    samplePlaybackHealth();
  }

  async function playableSourceFor(channel) {
    if (channel.macCommand) {
      const account = state.accounts.find((item) => item.id === channel.accountId);
      if (!account) throw new Error("The MAC profile for this channel was not found.");
      const data = await fetchMacStream(account, channel);
      channel.streamFormat = data.format || channel.streamFormat || inferStreamFormat(data.url);
      channel.macEndpoint = data.endpoint || channel.macEndpoint;
      return { url: data.url, format: channel.streamFormat };
    }
    return { url: channel.url, format: channel.streamFormat || inferStreamFormat(channel.url) };
  }

  function setupSource(url, options = {}) {
    destroyHls();
    resetMediaElement();
    els.playerEmpty.classList.add("is-hidden");
    const playerUrl = proxyAvailable ? proxiedUrl(url) : url;
    const format = options.format || inferStreamFormat(url);
    const isHls = format === "hls" || /\.m3u8($|\?)/i.test(url) || /application\/vnd\.apple\.mpegurl/i.test(url);
    const isMpegTs = format === "mpegts";
    if (isHls && window.Hls && Hls.isSupported()) {
      hls = new Hls(stableHlsConfig());
      hls.loadSource(playerUrl);
      hls.attachMedia(els.player);
      hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
        playbackDiagnostics.lastFragment = {
          level: data?.frag?.level ?? null,
          sn: data?.frag?.sn ?? null,
          loadMs: fragmentLoadMs(data?.stats)
        };
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        playbackDiagnostics.lastLevel = data?.level ?? null;
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        playbackDiagnostics.hlsErrors.push({
          at: Date.now(),
          type: data?.type || "",
          details: data?.details || "",
          fatal: Boolean(data?.fatal)
        });
        playbackDiagnostics.hlsErrors = playbackDiagnostics.hlsErrors.slice(-12);
        if (!data?.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          notify("Stream recovered", "A media stall was repaired automatically.");
        } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          notify("Network retry", "The stream request is being retried.");
        } else {
          notify("HLS error", data.details || "The stream stopped.");
        }
      });
    } else if (isMpegTs && window.mpegts?.getFeatureList?.().mseLivePlayback) {
      mpegtsPlayer = window.mpegts.createPlayer({
        type: "mpegts",
        isLive: true,
        url: playerUrl
      }, stableMpegTsConfig());
      mpegtsPlayer.attachMediaElement(els.player);
      mpegtsPlayer.on(window.mpegts.Events.ERROR, (_, detail) => {
        playbackDiagnostics.streamErrors.push({ at: Date.now(), detail: String(detail || "MPEG-TS error") });
        playbackDiagnostics.streamErrors = playbackDiagnostics.streamErrors.slice(-12);
        recoverStalledPlayback(String(detail || "MPEG-TS media error"));
      });
      mpegtsPlayer.load();
    } else {
      els.player.src = playerUrl;
      els.player.load();
    }
    updatePlaybackChrome();
  }

  function resetMediaElement() {
    try {
      els.player.pause();
      els.player.removeAttribute("src");
      els.player.load();
    } catch (error) {
      // A clean load clears stale media errors before MSE attaches a new source.
    }
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

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
    if (mpegtsPlayer) {
      mpegtsPlayer.destroy();
      mpegtsPlayer = null;
    }
  }

  function setPlayerStatus(text, buffering = false) {
    if (els.playerStatus) els.playerStatus.textContent = text;
    if (els.videoShell) els.videoShell.dataset.buffering = buffering ? "true" : "false";
    if (buffering || text === "Loading" || text === "Issue") showPlayerChrome(false);
  }

  function showPlayerChrome(autoHide = true) {
    if (!els.videoShell) return;
    els.videoShell.classList.remove("is-chrome-hidden");
    window.clearTimeout(controlsHideTimer);
    if (autoHide) schedulePlayerChromeHide();
  }

  function schedulePlayerChromeHide() {
    window.clearTimeout(controlsHideTimer);
    if (!els.videoShell || els.player.paused || els.videoShell.dataset.buffering === "true") return;
    controlsHideTimer = window.setTimeout(() => {
      if (!els.player.paused && els.videoShell.dataset.buffering !== "true") {
        els.videoShell.classList.add("is-chrome-hidden");
      }
    }, document.fullscreenElement === els.videoShell ? 2400 : 3200);
  }

  function updatePlaybackChrome(force = false) {
    if (!force) {
      if (playbackChromeFrame) return;
      playbackChromeFrame = window.requestAnimationFrame(() => {
        playbackChromeFrame = 0;
        updatePlaybackChrome(true);
      });
      return;
    }
    if (!els.player) return;
    const duration = els.player.duration;
    const current = els.player.currentTime || 0;
    const live = isLivePlayback();
    if (els.currentTimeLabel) els.currentTimeLabel.textContent = live ? "Live" : formatPlaybackTime(current);
    if (els.durationLabel) els.durationLabel.textContent = live ? "LIVE" : formatPlaybackTime(duration);
    if (els.seekRange) {
      els.seekRange.disabled = live;
      els.seekRange.value = live || !duration ? 1000 : String(Math.min(1000, Math.round((current / duration) * 1000)));
      els.seekRange.setAttribute("aria-valuetext", live ? "Live stream" : `${formatPlaybackTime(current)} of ${formatPlaybackTime(duration)}`);
    }
    if (els.speedSelect) {
      els.speedSelect.disabled = live;
      if (live) els.speedSelect.value = "1";
    }
    if (els.bufferBar) {
      const buffered = bufferedEnd();
      const pct = live || !duration ? (els.player.readyState ? 100 : 0) : Math.min(100, (buffered / duration) * 100);
      els.bufferBar.style.width = `${pct}%`;
    }
    if (els.videoShell?.dataset.buffering === "true" && !els.player.paused && els.player.readyState >= 2) {
      els.videoShell.dataset.buffering = "false";
    }
    if (els.playerStatus && els.videoShell?.dataset.buffering !== "true") {
      els.playerStatus.textContent = !state.currentChannelId
        ? "Ready"
        : els.player.paused ? "Paused" : live ? "Live" : "Playing";
    }
    if (els.playPauseBtn) {
      const paused = els.player.paused;
      els.playPauseBtn.textContent = paused ? "Play" : "Pause";
      els.playPauseBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
      els.playPauseBtn.title = paused ? "Play" : "Pause";
    }
    if (els.muteBtn) {
      const muted = els.player.muted || els.player.volume === 0;
      els.muteBtn.textContent = muted ? "Sound" : "Mute";
      els.muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
      els.muteBtn.title = muted ? "Unmute" : "Mute";
    }
  }
  function isLivePlayback() {
    const duration = els.player?.duration;
    return !Number.isFinite(duration) || duration <= 0 || duration === Infinity;
  }

  function bufferedEnd() {
    const ranges = els.player?.buffered;
    if (!ranges?.length) return 0;
    try {
      return ranges.end(ranges.length - 1);
    } catch (error) {
      return 0;
    }
  }

  function seekFromRange() {
    const duration = els.player.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    els.player.currentTime = (Number(els.seekRange.value) / 1000) * duration;
    updatePlaybackChrome();
  }

  function formatPlaybackTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const whole = Math.floor(seconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const rest = whole % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
      : `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function handleSpeedChange() {
    state.settings.playbackRate = Number(els.speedSelect.value) || STABLE_LIVE_RATE;
    applyStablePlaybackRate("speed-control");
    saveState();
    updatePlaybackChrome(true);
  }

  function applyStablePlaybackRate(reason) {
    if (!els.player) return;
    const requested = Number(state.settings.playbackRate || STABLE_LIVE_RATE);
    const target = isLivePlayback() ? STABLE_LIVE_RATE : Math.min(Math.max(requested, 0.5), 2);
    if (Math.abs((els.player.playbackRate || STABLE_LIVE_RATE) - target) < 0.01) return;
    suppressRateChange = true;
    els.player.playbackRate = target;
    window.setTimeout(() => {
      suppressRateChange = false;
    }, 0);
    if (reason === "ratechange" && isLivePlayback()) {
      playbackDiagnostics.rateClamps += 1;
    }
  }

  function startPlaybackDiagnostics() {
    window.clearInterval(playbackHealthTimer);
    playbackHealthTimer = window.setInterval(samplePlaybackHealth, QOE_HEARTBEAT_MS);
    if ("PerformanceObserver" in window && PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      try {
        longTaskObserver = new PerformanceObserver((list) => {
          playbackDiagnostics.longTasks += list.getEntries().length;
        });
        longTaskObserver.observe({ type: "longtask", buffered: true });
      } catch (error) {
        longTaskObserver = null;
      }
    }
  }

  function startPlaybackSession(channel) {
    Object.assign(playbackDiagnostics, {
      sessionId: uid("playback"),
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
  }

  function samplePlaybackHealth() {
    if (!els.player || !state.currentChannelId) return;
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
      totalFrames: quality?.totalVideoFrames ?? null,
      longTasks: playbackDiagnostics.longTasks
    };
    playbackDiagnostics.samples.push(sample);
    playbackDiagnostics.samples = playbackDiagnostics.samples.slice(-24);
    window.sfvipPlaybackDiagnostics = playbackDiagnostics;
    updateProgressWatchdog(sample);
  }

  function updateProgressWatchdog(sample) {
    if (els.player.paused || !state.currentChannelId) return;
    if (sample.currentTime > lastProgressTime + 0.25) {
      lastProgressTime = sample.currentTime;
      lastProgressAt = Date.now();
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
    if (!channel || recoveryAttempts >= 2 || now - lastRecoveryAt < 15000) return;
    recoveryAttempts += 1;
    lastRecoveryAt = now;
    playbackDiagnostics.recoveries = recoveryAttempts;
    notify("Stream recovery", reason);
    playChannel(channel, { authorized: true, recovering: true });
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

  function fragmentLoadMs(stats) {
    if (!stats) return null;
    const start = stats.loading?.start || stats.trequest || stats.request || 0;
    const end = stats.loading?.end || stats.tload || stats.loaded || 0;
    return start && end ? Math.max(0, Math.round(end - start)) : null;
  }

  function updateNowPlaying() {
    const channel = currentChannel();
    const program = channel ? currentProgram(channel) : null;
    els.playerEmpty.classList.toggle("is-hidden", Boolean(channel));
    els.nowType.textContent = channel ? channel.type.toUpperCase() : "Ready";
    els.nowTitle.textContent = channel ? channel.title : "No stream selected";
    els.nowQuality.textContent = channel?.quality || "HD";
    els.detailTitle.textContent = channel?.title || "SFVIP Web Player";
    els.detailGroup.textContent = channel ? channelPrimaryGroup(channel) : "Demo";
    els.detailProgram.textContent = program?.title || "No program";
    els.detailRating.textContent = channel?.rating ? channel.rating.toFixed(1) : "0.0";
    els.detailHistory.textContent = channel ? historyLabel(channel.id) : "New";
    els.favoriteBtn.textContent = channel && isFavorite(channel.id) ? "Saved" : "Star";
    if (els.hideChannelBtn) {
      els.hideChannelBtn.textContent = channel && isHidden(channel.id) ? "Unhide" : "Hide";
    }
    els.lockChannelBtn.textContent = channel && isLocked(channel.id) ? "Unlock" : "Lock";
    els.upNextList.innerHTML = channel
      ? programsFor(channel, new Date()).slice(1, 5).map((item) => `
        <div class="list-row">
          <div>
            <div class="row-title">${escapeHtml(item.title)}</div>
            <div class="row-meta">${formatTime(item.start)} - ${formatTime(item.end)}</div>
          </div>
        </div>
      `).join("")
      : emptyRow("No stream selected");
  }

  function togglePlay() {
    if (els.player.paused) els.player.play().catch(() => notify("Playback issue", "The stream cannot start yet."));
    else els.player.pause();
  }

  function toggleMute() {
    els.player.muted = !els.player.muted;
    state.settings.muted = els.player.muted;
    saveState();
    updatePlaybackChrome();
  }

  function stepChannel(direction) {
    if (!currentList.length) currentList = filteredChannels();
    const currentId = state.currentChannelId;
    const index = Math.max(0, currentList.findIndex((channel) => channel.id === currentId));
    const next = currentList[(index + direction + currentList.length) % currentList.length];
    if (next) playChannel(next);
  }

  async function togglePip() {
    if (!document.pictureInPictureEnabled || !els.player.requestPictureInPicture) {
      notify("PiP unavailable", "This browser does not expose picture in picture.");
      return;
    }
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await els.player.requestPictureInPicture();
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await els.videoShell.requestFullscreen();
  }

  function toggleFavorite() {
    const channel = currentChannel();
    if (channel) toggleFavoriteById(channel.id);
  }

  function toggleFavoriteById(id) {
    if (!id) return;
    if (isFavorite(id)) state.favorites = state.favorites.filter((favoriteId) => favoriteId !== id);
    else state.favorites.unshift(id);
    saveState();
    renderAll();
  }

  function toggleHiddenChannel(id = state.currentChannelId) {
    if (!id) return;
    if (isHidden(id)) {
      state.hidden = state.hidden.filter((hiddenId) => hiddenId !== id);
    } else {
      state.hidden = [id, ...state.hidden.filter((hiddenId) => hiddenId !== id)];
      if (state.currentChannelId === id) notify("Channel hidden", "It remains playable from the Hidden group.");
    }
    if (activeGroup !== "Hidden" && !filteredChannels().length) activeGroup = "All";
    saveState();
    renderAll();
  }

  function playMostRecent() {
    const accountId = state.currentAccountId;
    const recent = recentlyWatchedForAccount(accountId).find((channel) => !isHidden(channel.id));
    const current = currentChannel();
    const fallback = channelsForAccount(accountId, activeType).find((channel) => !isHidden(channel.id))
      || liveChannelsForAccount(accountId).find((channel) => !isHidden(channel.id));
    const channel = (current?.accountId === accountId && !isHidden(current.id)) ? current : recent || fallback;
    if (channel) playChannel(channel);
    else notify("No channels", "Add or refresh a profile first.");
  }

  function toggleCurrentLock() {
    const channel = currentChannel();
    if (!channel) return;
    if (isLocked(channel.id)) state.locked = state.locked.filter((id) => id !== channel.id);
    else state.locked.push(channel.id);
    saveState();
    renderAll();
  }

  async function handleAccountSubmit(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const copy = profileLoadingCopy();
    setAccountBusy(true, copy.title, copy.message);
    setGlobalBusy(true, copy.title, copy.message);
    try {
      const added = await addAccountFromForm();
      if (added !== false) closeDialog(els.accountDialog);
    } finally {
      setAccountBusy(false);
      setGlobalBusy(false);
    }
  }

  async function addAccountFromForm() {
    const name = $("#accountName").value.trim() || (accountType === "mac" ? "MAC Account" : "IPTV Account");
    const account = {
      id: uid("account"),
      name,
      type: accountType,
      createdAt: Date.now(),
      lastSync: Date.now()
    };
    try {
      if (accountType === "m3u") {
        account.url = $("#m3uUrl").value.trim();
        if (!account.url) {
          notify("Missing URL", "Choose a file or enter an M3U URL.");
          return false;
        }
        const text = await fetchText(account.url);
        await addAccountChannels(account, parseM3U(text, account));
      } else if (accountType === "xtream") {
        const server = trimSlash($("#xtreamServer").value.trim());
        const username = $("#xtreamUser").value.trim();
        const password = $("#xtreamPass").value.trim();
        account.server = server;
        account.username = username;
        account.password = password;
        account.url = `${server}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=mpegts`;
        const text = await fetchText(account.url);
        await addAccountChannels(account, parseM3U(text, account));
        refreshXtreamEpg(account).catch(() => null);
      } else if (accountType === "mac") {
        Object.assign(account, macAccountFromForm());
        if (!account.portal || !account.mac) {
          notify("Missing MAC login", "Enter the URL and MAC address.");
          return false;
        }
        const channels = await fetchMacChannels(account);
        await addAccountChannels(account, channels);
      } else {
        notify("Unknown account type", "Choose M3U, Xtream, or MAC.");
        return false;
      }
    } catch (error) {
      if (accountType === "mac") {
        notify("MAC login failed", error.message || "The provider rejected this profile.");
        return false;
      }
      state.accounts = state.accounts.filter((item) => item.id !== account.id);
      state.accounts.push(account);
      state.currentAccountId = account.id;
      notify("Profile saved", accountType === "mac"
        ? "The MAC profile was saved, but the portal did not return channels."
        : "The source was saved, but the browser could not fetch it.");
    }
    saveState();
    renderAll();
    return true;
  }

  function macAccountFromForm() {
    return {
      portal: $("#macPortal").value.trim(),
      mac: normalizeMac($("#macValue").value.trim())
    };
  }

  async function fetchMacChannels(account) {
    if (!location.protocol.startsWith("http")) {
      throw new Error("MAC portals require the local server.");
    }
    const response = await fetch(`${location.origin}/api/mac/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "MAC portal failed");
    return (data.channels || []).map((channel) => ({
      id: stableChannelId(account, channel),
      accountId: account.id,
      title: channel.title || "MAC Channel",
      type: channel.type || "live",
      mediaType: channel.mediaType || "",
      catalogOnly: Boolean(channel.catalogOnly),
      group: channel.group || account.name,
      url: channel.url ? rewriteProviderLocalUrl(channel.url, account.portal) : "",
      logo: channel.logo || "",
      description: channel.description || "",
      providerId: channel.id || "",
      macCommand: channel.command || "",
      macEndpoint: channel.endpoint || "",
      streamFormat: channel.format || "",
      categoryId: channel.categoryId || "",
      adult: Boolean(channel.adult),
      quality: inferQuality(`${channel.title || ""} ${channel.group || ""} ${channel.quality || ""}`),
      rating: 0,
      language: "Portal",
      epgId: channel.epgId || slug(channel.title || channel.id || "mac-channel")
    })).filter((channel) => channel.catalogOnly || channel.url || channel.macCommand);
  }

  async function fetchMacCategory(account, placeholder) {
    if (!location.protocol.startsWith("http")) {
      throw new Error("MAC portals require the local server.");
    }
    const response = await fetch(`${location.origin}/api/mac/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portal: account.portal,
        mac: account.mac,
        endpoint: placeholder.macEndpoint,
        mediaType: placeholder.mediaType || placeholder.type,
        type: placeholder.type,
        categoryId: placeholder.categoryId,
        categoryTitle: placeholder.group || placeholder.title
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "MAC catalog failed");
    return (data.channels || []).map((channel) => ({
      id: stableChannelId(account, channel),
      accountId: account.id,
      title: channel.title || "Portal item",
      type: channel.type || placeholder.type || "movie",
      mediaType: channel.mediaType || placeholder.mediaType || "",
      group: channel.group || placeholder.group || account.name,
      url: channel.url ? rewriteProviderLocalUrl(channel.url, account.portal) : "",
      logo: channel.logo || "",
      description: channel.description || "",
      providerId: channel.providerId || channel.id || "",
      macCommand: channel.command || "",
      macEndpoint: channel.endpoint || placeholder.macEndpoint || "",
      streamFormat: channel.format || "",
      categoryId: channel.categoryId || placeholder.categoryId || "",
      adult: Boolean(channel.adult || placeholder.adult),
      quality: inferQuality(`${channel.title || ""} ${channel.group || ""} ${channel.quality || ""}`),
      rating: 0,
      language: "Portal",
      epgId: channel.epgId || slug(channel.title || channel.id || "portal-item")
    })).filter((channel) => channel.url || channel.macCommand || channel.type === "series");
  }

  async function loadMacCategoryItems(account, placeholder) {
    const channels = await fetchMacCategory(account, placeholder);
    if (!channels.length) return;
    const existingIds = new Set(state.channels.map((channel) => channel.id));
    const fresh = channels.filter((channel) => !existingIds.has(channel.id));
    if (!fresh.length) return;
    state.channels.push(...fresh);
    groupFacetCache.clear();
    try {
      await putStoredChannels(fresh);
    } catch (error) {
      console.warn(error);
      notify("Catalog not saved", "This group is loaded for this session, but browser database storage failed.");
    }
    saveState();
    notify("Catalog loaded", `${fresh.length} ${mediaTypeMeta(placeholder.type).itemLabel} added from ${placeholder.group || placeholder.title}.`);
  }

  async function fetchMacStream(account, channel) {
    if (!location.protocol.startsWith("http")) {
      throw new Error("MAC portals require the local server.");
    }
    const response = await fetch(`${location.origin}/api/mac/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portal: account.portal,
        mac: account.mac,
        endpoint: channel.macEndpoint,
        mediaType: channel.mediaType || channel.type,
        type: channel.type,
        command: channel.macCommand || stalkerCommandFromUrl(channel.url),
        url: channel.url,
        providerId: channel.providerId,
        epgId: channel.epgId,
        title: channel.title
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "MAC stream failed");
    if (!data.url) throw new Error("The provider returned an empty stream URL.");
    return data;
  }

  async function addAccountChannels(account, channels) {
    state.accounts = state.accounts.filter((item) => item.id !== account.id);
    state.accounts.push(account);
    const previousChannelIds = idsForAccount(account.id);
    state.channels = state.channels.filter((channel) => channel.accountId !== account.id);
    state.channels.push(...channels);
    groupFacetCache.clear();
    failedCategoryLoads.clear();
    removeChannelLinkedData(previousChannelIds);
    state.epg = state.epg.concat(generatedEpgFor(channels));
    state.currentAccountId = account.id;
    activeType = "live";
    activeGroup = "All";
    resetChannelScroll();
    try {
      await replaceStoredChannelsForAccount(account.id, channels);
    } catch (error) {
      console.warn(error);
      notify("Catalog not saved", "Channels are loaded for this session, but browser database storage failed.");
    }
    saveState();
    renderProfiles();
    renderSourceStatus();
    notify("Profile added", profileCatalogSummary(account.id));
  }

  function profileCatalogSummary(accountId) {
    const media = mediaCountsForAccount(accountId);
    const parts = [
      media.counts.live ? `${media.counts.live} live channels` : "",
      media.counts.movie ? `${media.counts.movie} movies` : "",
      media.categories.movie ? `${media.categories.movie} movie groups` : "",
      media.counts.series ? `${media.counts.series} series` : "",
      media.categories.series ? `${media.categories.series} series groups` : ""
    ].filter(Boolean);
    return parts.length ? `${parts.join(" / ")} loaded with large-catalog mode.` : "Profile saved.";
  }

  function generatedEpgFor(channels) {
    return channels.length <= 80 ? buildDemoEpg(channels) : [];
  }

  async function handleM3uFile() {
    const file = els.m3uFileInput.files?.[0];
    if (!file) return;
    setGlobalBusy(true, "Importing M3U file", "Reading the playlist and building groups.");
    setAccountBusy(true, "Importing M3U file", "Reading the playlist and building groups.");
    try {
      const text = await file.text();
      const account = {
        id: uid("account"),
        name: $("#accountName").value.trim() || file.name.replace(/\.(m3u8?|txt)$/i, ""),
        type: "m3u-file",
        source: file.name,
        createdAt: Date.now(),
        lastSync: Date.now()
      };
      await addAccountChannels(account, parseM3U(text, account));
      saveState();
      renderAll();
      closeDialog(els.accountDialog);
      els.m3uFileInput.value = "";
    } finally {
      setAccountBusy(false);
      setGlobalBusy(false);
    }
  }

  async function handleEpgFile() {
    const file = els.epgFileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    const count = importXmlTv(text);
    saveState();
    renderAll();
    notify("EPG imported", `${count} programs added.`);
    els.epgFileInput.value = "";
  }

  function handleMediaFile() {
    const file = els.mediaFileInput.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    transientUrls.add(url);
    const channel = {
      id: uid("local"),
      accountId: "local",
      title: file.name,
      type: file.type.startsWith("audio") ? "music" : "movie",
      group: "Local Files",
      url,
      quality: "Local",
      rating: 0,
      language: "Local",
      epgId: uid("local-epg"),
      transient: true
    };
    state.channels = state.channels.filter((item) => !item.transient);
    state.channels.unshift(channel);
    renderChannelBrowser();
    playChannel(channel, { authorized: true });
    els.mediaFileInput.value = "";
  }

  async function handleSubtitleFile() {
    const file = els.subtitleFileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    const isSrt = /\.srt$/i.test(file.name);
    const subtitle = {
      id: uid("sub"),
      name: file.name.replace(/\.(srt|vtt)$/i, ""),
      language: "English",
      text: isSrt ? srtToVtt(text) : ensureVtt(text),
      linkedChannelId: state.currentChannelId || null,
      createdAt: Date.now()
    };
    state.subtitles.unshift(subtitle);
    saveState();
    renderSubtitles();
    applySubtitle(subtitle.id);
    notify("Subtitle added", subtitle.name);
    els.subtitleFileInput.value = "";
  }

  function parseM3U(text, account) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const channels = [];
    let info = null;
    for (const line of lines) {
      if (line.startsWith("#EXTINF")) {
        const attrs = {};
        line.replace(/([\w-]+)="([^"]*)"/g, (_, key, value) => {
          attrs[key] = value;
          return "";
        });
        const title = line.includes(",") ? line.slice(line.lastIndexOf(",") + 1).trim() : attrs["tvg-name"];
        info = { attrs, title };
      } else if (!line.startsWith("#")) {
        const title = info?.title || line.split("/").pop() || "Untitled Stream";
        const group = info?.attrs?.["group-title"] || "Other";
        const epgId = info?.attrs?.["tvg-id"] || info?.attrs?.["tvg-name"] || slug(title);
        channels.push({
          id: stableChannelId(account, { id: epgId, title, url: line }),
          accountId: account.id,
          title,
          type: inferType(group, line),
          group,
          url: line,
          streamFormat: inferStreamFormat(line),
          logo: info?.attrs?.["tvg-logo"] || "",
          country: normalizeCountryValue(info?.attrs?.["tvg-country"] || info?.attrs?.["tvg-country-code"] || ""),
          quality: inferQuality(`${title} ${group}`),
          rating: 0,
          language: normalizeLanguage(info?.attrs?.["tvg-language"] || info?.attrs?.["audio-track"] || "") || "Unknown",
          epgId
        });
        info = null;
      }
    }
    return channels;
  }

  function importXmlTv(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    const names = new Map();
    $$("channel", doc).forEach((channel) => {
      const id = channel.getAttribute("id");
      const name = $("display-name", channel)?.textContent?.trim();
      if (id && name) names.set(id, name);
    });
    const imported = [];
    $$("programme", doc).forEach((item) => {
      const channelRef = item.getAttribute("channel") || "";
      const title = $("title", item)?.textContent?.trim() || "Program";
      const desc = $("desc", item)?.textContent?.trim() || "";
      const start = parseXmlTvDate(item.getAttribute("start"));
      const end = parseXmlTvDate(item.getAttribute("stop"));
      const channel = matchEpgChannel(channelRef, names.get(channelRef));
      if (!channel || !start || !end) return;
      imported.push({
        id: uid("epg"),
        channelId: channel.id,
        epgId: channel.epgId,
        title,
        desc,
        start: start.getTime(),
        end: end.getTime(),
        source: "xmltv"
      });
    });
    state.epg = state.epg.filter((program) => program.source !== "xmltv");
    state.epg.push(...imported);
    return imported.length;
  }

  function matchEpgChannel(ref, name) {
    const refClean = clean(ref);
    const nameClean = clean(name || "");
    return state.channels.find((channel) => clean(channel.epgId) === refClean)
      || state.channels.find((channel) => clean(channel.title) === nameClean)
      || state.channels.find((channel) => nameClean && clean(channel.title).includes(nameClean));
  }

  function buildDemoEpg(channels) {
    const programs = [];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const templates = {
      live: ["Morning Edition", "Studio Live", "Prime Bulletin", "Late Show"],
      movie: ["Feature Presentation", "Behind the Scenes", "Director Cut", "Encore"],
      series: ["Episode Block", "New Episode", "Series Marathon", "Recap"],
      music: ["Fresh Rotation", "Artist Focus", "Studio Session", "Late Mix"]
    };
    channels.forEach((channel, channelIndex) => {
      for (let day = -1; day <= 3; day += 1) {
        for (let slot = 0; slot < 12; slot += 1) {
          const start = startOfToday.getTime() + (day * DAY) + (slot * 2 * 60 * 60 * 1000);
          const end = start + (2 * 60 * 60 * 1000);
          const titles = templates[channel.type] || templates.live;
          programs.push({
            id: uid("epg"),
            channelId: channel.id,
            epgId: channel.epgId,
            title: titles[(slot + channelIndex) % titles.length],
            desc: channel.group || channel.type,
            start,
            end,
            source: "demo"
          });
        }
      }
    });
    return programs;
  }

  function programsFor(channel, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + DAY;
    const programs = state.epg
      .filter((program) => (
        (program.channelId === channel.id || program.epgId === channel.epgId)
        && program.end > dayStart.getTime()
        && program.start < dayEnd
      ))
      .sort((a, b) => a.start - b.start);
    if (programs.length) return programs;
    return [{
      id: uid("epg-missing"),
      channelId: channel.id,
      title: "Live Broadcast",
      desc: channel.group || "",
      start: dayStart.getTime(),
      end: dayEnd
    }];
  }

  function currentProgram(channel) {
    const now = Date.now();
    return state.epg.find((program) => (
      (program.channelId === channel.id || program.epgId === channel.epgId)
      && program.start <= now
      && program.end > now
    ));
  }

  function openAccountDialog() {
    selectAccountType("m3u");
    $("#accountName").value = "";
    $("#m3uUrl").value = "";
    $("#xtreamServer").value = "";
    $("#xtreamUser").value = "";
    $("#xtreamPass").value = "";
    $("#macPortal").value = "http://vip058esmertv.live:8080/c/";
    $("#macValue").value = "00:1A:79:27:0f:10";
    openDialog(els.accountDialog);
  }

  function selectAccountType(type) {
    accountType = type;
    $$(".account-tabs button").forEach((item) => item.classList.toggle("is-active", item.dataset.accountType === accountType));
    $$(".account-fields").forEach((group) => group.classList.toggle("is-hidden", group.dataset.fields !== accountType));
  }

  function openSmartDialog(id = null) {
    pendingSmartId = id;
    const playlist = state.smartPlaylists.find((item) => item.id === id) || {};
    $("#smartName").value = playlist.name || "";
    $("#smartQuery").value = playlist.query || "";
    $("#smartGroup").value = playlist.group || "";
    $("#smartType").value = playlist.type || "all";
    $("#smartRating").value = playlist.minRating || 0;
    $("#smartOnlyHd").checked = Boolean(playlist.onlyHd);
    $("#smartFavorites").checked = Boolean(playlist.favoritesOnly);
    openDialog(els.smartDialog);
  }

  function handleSmartSubmit(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const playlist = {
      id: pendingSmartId || uid("smart"),
      name: $("#smartName").value.trim() || "Smart Playlist",
      query: $("#smartQuery").value.trim(),
      group: $("#smartGroup").value.trim(),
      type: $("#smartType").value,
      minRating: Number($("#smartRating").value),
      onlyHd: $("#smartOnlyHd").checked,
      favoritesOnly: $("#smartFavorites").checked
    };
    state.smartPlaylists = state.smartPlaylists.filter((item) => item.id !== playlist.id);
    state.smartPlaylists.unshift(playlist);
    saveState();
    renderSmartPlaylists();
    closeDialog(els.smartDialog);
  }

  function openSmartPlaylist(id) {
    const playlist = state.smartPlaylists.find((item) => item.id === id);
    if (!playlist) return;
    activeView = "live";
    switchView("live");
    activeType = playlist.type || "all";
    activeGroup = playlist.group || "All";
    els.globalSearch.value = playlist.query || "";
    currentList = smartMatches(playlist);
    els.channelGrid.innerHTML = currentList.length ? currentList.map(channelCard).join("") : emptyRow("No matches");
    $$(".channel-card", els.channelGrid).forEach((card) => card.addEventListener("click", () => playChannelById(card.dataset.id)));
  }

  function smartMatches(playlist) {
    const query = clean(playlist.query || "");
    const group = clean(playlist.group || "");
    return state.channels.filter((channel) => {
      if (channel.catalogOnly) return false;
      const labels = allChannelGroupLabels(channel).join(" ");
      const text = clean(`${channel.title} ${channel.group} ${labels} ${channel.quality}`);
      if (playlist.type && playlist.type !== "all" && channel.type !== playlist.type) return false;
      if (query && !text.includes(query)) return false;
      if (group && !clean(`${channel.group} ${labels}`).includes(group)) return false;
      if (playlist.minRating && Number(channel.rating || 0) < playlist.minRating) return false;
      if (playlist.onlyHd && !/(hd|fhd|uhd|4k)/i.test(channel.quality || channel.title)) return false;
      if (playlist.favoritesOnly && !isFavorite(channel.id)) return false;
      return true;
    });
  }

  function deleteSmart(id) {
    state.smartPlaylists = state.smartPlaylists.filter((item) => item.id !== id);
    saveState();
    renderSmartPlaylists();
  }

  function openScheduleDialog(channel = null) {
    const channels = state.channels.filter((item) => !item.transient);
    $("#scheduleChannel").innerHTML = channels.map((item) => (
      `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`
    )).join("");
    $("#scheduleChannel").value = channel?.id || state.currentChannelId || channels[0]?.id || "";
    const start = new Date(Date.now() + 10 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    $("#scheduleStart").value = toDatetimeLocal(start);
    $("#scheduleEnd").value = toDatetimeLocal(end);
    $("#scheduleAction").value = "notify";
    openDialog(els.scheduleDialog);
  }

  function handleScheduleSubmit(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const channel = findChannel($("#scheduleChannel").value);
    if (!channel) return;
    const entry = {
      id: uid("schedule"),
      channelId: channel.id,
      title: channel.title,
      start: new Date($("#scheduleStart").value).getTime(),
      end: new Date($("#scheduleEnd").value).getTime(),
      action: $("#scheduleAction").value,
      triggered: false
    };
    state.schedules.unshift(entry);
    saveState();
    renderRecordings();
    closeDialog(els.scheduleDialog);
    notify("Schedule saved", channel.title);
  }

  function startScheduleService() {
    window.clearInterval(scheduleTimer);
    scheduleTimer = window.setInterval(checkSchedules, 15000);
    checkSchedules();
  }

  function checkSchedules() {
    const now = Date.now();
    let changed = false;
    state.schedules.forEach((entry) => {
      if (!entry.triggered && entry.start <= now && entry.end > now) {
        entry.triggered = true;
        changed = true;
        const channel = findChannel(entry.channelId);
        notify("Schedule due", channel?.title || entry.title || "Recording");
        if (channel && (entry.action === "play" || entry.action === "record")) {
          playChannel(channel, { authorized: true });
        }
        if (entry.action === "record") {
          setTimeout(() => {
            if (!mediaRecorder) startRecording();
          }, 1200);
        }
      }
      if (entry.triggered && entry.action === "record" && entry.end <= now && mediaRecorder) {
        stopRecording();
      }
    });
    if (changed) {
      saveState();
      renderRecordings();
    }
  }

  function deleteSchedule(id) {
    state.schedules = state.schedules.filter((entry) => entry.id !== id);
    saveState();
    renderRecordings();
  }

  function toggleRecording() {
    if (mediaRecorder) stopRecording();
    else startRecording();
  }

  function startRecording() {
    const capture = els.player.captureStream || els.player.mozCaptureStream;
    if (!capture) {
      notify("Recording unavailable", "This browser cannot capture the player stream.");
      return;
    }
    try {
      const stream = capture.call(els.player);
      recordChunks = [];
      mediaRecorder = new MediaRecorder(stream, preferredRecorderOptions());
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) recordChunks.push(event.data);
      });
      mediaRecorder.addEventListener("stop", finishRecording);
      mediaRecorder.start(1000);
      document.body.dataset.recording = "true";
      els.recordNowBtn.textContent = "Stop";
      notify("Recording started", currentChannel()?.title || "Current stream");
    } catch (error) {
      mediaRecorder = null;
      notify("Recording blocked", "The stream cannot be captured by this browser.");
    }
  }

  function stopRecording() {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
  }

  function finishRecording() {
    const channel = currentChannel();
    const blob = new Blob(recordChunks, { type: recordChunks[0]?.type || "video/webm" });
    const objectUrl = URL.createObjectURL(blob);
    transientUrls.add(objectUrl);
    const title = channel?.title || "Recording";
    const recording = {
      id: uid("recording"),
      channelId: channel?.id || "",
      title,
      filename: `${slug(title)}-${Date.now()}.webm`,
      createdAt: Date.now(),
      size: blob.size,
      objectUrl
    };
    state.recordings.unshift(recording);
    mediaRecorder = null;
    recordChunks = [];
    document.body.dataset.recording = "false";
    els.recordNowBtn.textContent = "Record";
    saveState();
    renderRecordings();
    notify("Recording ready", recording.filename);
  }

  function preferredRecorderOptions() {
    const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const type = types.find((item) => MediaRecorder.isTypeSupported(item));
    return type ? { mimeType: type } : undefined;
  }

  function deleteRecording(id) {
    const recording = state.recordings.find((item) => item.id === id);
    if (recording?.objectUrl) URL.revokeObjectURL(recording.objectUrl);
    state.recordings = state.recordings.filter((item) => item.id !== id);
    saveState();
    renderRecordings();
  }

  function handlePinSubmit(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const value = $("#unlockPin").value;
    if (value === state.settings.parentalPin && pendingLockedChannel) {
      const channel = pendingLockedChannel;
      pendingLockedChannel = null;
      closeDialog(els.pinDialog);
      playChannel(channel, { authorized: true });
    } else {
      notify("Wrong PIN", "The locked item was not opened.");
    }
  }

  function openSubtitleDialog() {
    $("#subtitleName").value = currentChannel()?.title || "";
    $("#subtitleLang").value = "English";
    $("#subtitleUrl").value = "";
    openDialog(els.subtitleDialog);
  }

  function handleSubtitleSubmit(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const subtitle = {
      id: uid("sub"),
      name: $("#subtitleName").value.trim() || "Subtitle",
      language: $("#subtitleLang").value.trim() || "English",
      url: $("#subtitleUrl").value.trim(),
      linkedChannelId: state.currentChannelId || null,
      createdAt: Date.now()
    };
    state.subtitles.unshift(subtitle);
    saveState();
    renderSubtitles();
    applySubtitle(subtitle.id);
    closeDialog(els.subtitleDialog);
  }

  function applySubtitle(id) {
    const subtitle = state.subtitles.find((item) => item.id === id);
    if (!subtitle) return;
    attachSubtitle(subtitle);
    notify("Subtitle applied", subtitle.name);
  }

  function attachSubtitle(subtitle) {
    $$("track[data-managed]", els.player).forEach((track) => track.remove());
    let src = subtitle.url;
    if (subtitle.text) {
      if (subtitle.objectUrl) URL.revokeObjectURL(subtitle.objectUrl);
      const blob = new Blob([subtitle.text], { type: "text/vtt" });
      src = URL.createObjectURL(blob);
      subtitle.objectUrl = src;
      transientUrls.add(src);
    }
    if (!src) return;
    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = subtitle.language || subtitle.name;
    track.srclang = (subtitle.language || "en").slice(0, 2).toLowerCase();
    track.src = src;
    track.default = true;
    track.dataset.managed = "true";
    els.player.append(track);
    setTimeout(() => {
      Array.from(els.player.textTracks).forEach((textTrack) => {
        textTrack.mode = textTrack.label === track.label ? "showing" : "disabled";
      });
    }, 250);
  }

  function autoApplySubtitle(channel) {
    const subtitle = state.subtitles.find((item) => item.linkedChannelId === channel.id)
      || state.subtitles.find((item) => clean(channel.title).includes(clean(item.name)) || clean(item.name).includes(clean(channel.title)));
    if (subtitle) attachSubtitle(subtitle);
  }

  function linkSubtitle(id) {
    const channel = currentChannel();
    if (!channel) {
      notify("No stream selected", "Play a stream before linking a subtitle.");
      return;
    }
    const subtitle = state.subtitles.find((item) => item.id === id);
    if (!subtitle) return;
    subtitle.linkedChannelId = channel.id;
    saveState();
    renderSubtitles();
    notify("Subtitle linked", channel.title);
  }

  function deleteSubtitle(id) {
    const subtitle = state.subtitles.find((item) => item.id === id);
    if (subtitle?.objectUrl) URL.revokeObjectURL(subtitle.objectUrl);
    state.subtitles = state.subtitles.filter((item) => item.id !== id);
    saveState();
    renderSubtitles();
  }

  function updateSettingsFromControls() {
    state.settings.theme = els.themeSelect.value;
    state.settings.accent = els.accentSelect.value;
    state.settings.uiScale = Number(els.uiScaleRange.value);
    state.settings.videoFit = els.videoFitSelect.value;
    state.settings.brightness = Number(els.brightnessRange.value);
    state.settings.contrast = Number(els.contrastRange.value);
    state.settings.saturation = Number(els.saturationRange.value);
    state.settings.parentalEnabled = els.parentalEnabled.checked;
    applySettings();
    saveState();
  }

  function applySettings() {
    document.body.dataset.theme = state.settings.theme;
    document.body.dataset.accent = state.settings.accent;
    document.documentElement.style.setProperty("--scale", String(state.settings.uiScale));
    els.videoShell.dataset.fit = state.settings.videoFit;
    els.player.style.filter = `brightness(${state.settings.brightness}%) contrast(${state.settings.contrast}%) saturate(${state.settings.saturation}%)`;
    els.player.volume = state.settings.volume;
    els.player.muted = state.settings.muted;
    applyStablePlaybackRate("settings");
    els.volumeRange.value = state.settings.volume;
    if (els.speedSelect) els.speedSelect.value = String(state.settings.playbackRate || 1);
    updatePlaybackChrome();
    renderSettings();
  }

  async function populateAudioOutputs() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      els.audioOutputSelect.innerHTML = `<option>Default output</option>`;
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter((device) => device.kind === "audiooutput");
      els.audioOutputSelect.innerHTML = [
        `<option value="">Default output</option>`,
        ...outputs.map((device) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || "Audio output")}</option>`)
      ].join("");
    } catch (error) {
      els.audioOutputSelect.innerHTML = `<option>Default output</option>`;
    }
  }

  async function changeAudioOutput() {
    if (!els.player.setSinkId) {
      notify("Audio output unavailable", "This browser does not support output device switching.");
      return;
    }
    try {
      await els.player.setSinkId(els.audioOutputSelect.value);
      notify("Audio output changed", "The player output device was updated.");
    } catch (error) {
      notify("Output blocked", "The browser rejected the selected audio device.");
    }
  }

  function applyEqualizerPreset() {
    const preset = els.equalizerSelect.value;
    state.settings.equalizer = preset;
    state.settings.eqGains = [...(eqPresets[preset] || eqPresets.flat)];
    $$("[data-eq]").forEach((range, index) => {
      range.value = state.settings.eqGains[index];
    });
    applyEqualizer();
    saveState();
  }

  function applyEqualizer() {
    setupAudioGraph();
    eqFilters.forEach((filter, index) => {
      filter.gain.value = state.settings.eqGains[index] || 0;
    });
  }

  function setupAudioGraph() {
    if (audioContext || audioSource) return;
    try {
      audioContext = new AudioContext();
      audioSource = audioContext.createMediaElementSource(els.player);
      const bands = [60, 250, 1000, 4000, 12000];
      eqFilters = bands.map((frequency) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });
      audioSource.connect(eqFilters[0]);
      for (let index = 0; index < eqFilters.length - 1; index += 1) {
        eqFilters[index].connect(eqFilters[index + 1]);
      }
      eqFilters[eqFilters.length - 1].connect(audioContext.destination);
    } catch (error) {
      audioContext = null;
      audioSource = null;
      eqFilters = [];
      notify("Equalizer unavailable", "The browser blocked audio processing for this media.");
    }
  }

  function savePin() {
    const pin = els.pinInput.value.trim();
    if (!pin) {
      notify("PIN required", "Enter a non-empty PIN.");
      return;
    }
    state.settings.parentalPin = pin;
    state.settings.parentalEnabled = els.parentalEnabled.checked;
    saveState();
    notify("PIN saved", "Parental controls updated.");
  }

  function resetSettings() {
    const defaults = defaultState().settings;
    state.settings = { ...defaults };
    applySettings();
    saveState();
    notify("Settings reset", "Player preferences returned to defaults.");
  }

  async function refreshAllAccounts() {
    const accounts = state.accounts.filter((item) => item.url || item.portal);
    if (!accounts.length) {
      notify("Nothing to refresh", "Add a remote profile first.");
      return;
    }
    setButtonBusy($("#refreshAllBtn"), true, "Refreshing...");
    setGlobalBusy(true, "Refreshing profiles", "Updating channels and catalog groups.");
    try {
      for (const account of accounts) {
        await refreshAccount(account.id, true);
      }
    } finally {
      setButtonBusy($("#refreshAllBtn"), false);
      setGlobalBusy(false);
    }
    renderAll();
    notify("Profiles refreshed", `${accounts.length} profile${accounts.length === 1 ? "" : "s"} updated.`);
  }

  async function refreshCurrentProfile() {
    const account = currentAccount();
    if (!account) return;
    await refreshAccount(account.id);
    renderProfiles();
    renderSourceStatus();
    renderChannelBrowser();
  }

  async function refreshAccount(id, quiet = false) {
    const account = state.accounts.find((item) => item.id === id);
    if (!account?.url && !account?.portal) {
      if (!quiet) notify("Nothing to refresh", "This account has no remote URL.");
      return;
    }
    const refreshButton = id === state.currentAccountId ? $("#refreshProfileBtn") : null;
    if (!quiet) {
      setButtonBusy(refreshButton, true, "Refreshing...");
      setGlobalBusy(true, `Refreshing ${account.name}`, "Updating live channels and catalog groups.");
    }
    try {
      const channels = account.type === "mac" && account.portal
        ? await fetchMacChannels(account)
        : parseM3U(await fetchText(account.url), account);
      const previousChannelIds = idsForAccount(account.id);
      state.channels = state.channels.filter((channel) => channel.accountId !== account.id);
      state.channels.push(...channels);
      groupFacetCache.clear();
      failedCategoryLoads.clear();
      removeChannelLinkedData(previousChannelIds);
      account.lastSync = Date.now();
      state.epg = state.epg.concat(generatedEpgFor(channels));
      try {
        await replaceStoredChannelsForAccount(account.id, channels);
      } catch (storageError) {
        console.warn(storageError);
        if (!quiet) notify("Catalog not saved", "The refreshed channels are loaded for this session only.");
      }
      saveState();
      renderSourceStatus();
      if (!quiet) notify("Account refreshed", profileCatalogSummary(account.id));
    } catch (error) {
      if (!quiet) notify("Refresh failed", "The browser could not fetch this source.");
    } finally {
      if (!quiet) {
        setButtonBusy(refreshButton, false);
        setGlobalBusy(false);
      }
    }
  }

  async function refreshXtreamEpg(account) {
    if (!account.server || !account.username || !account.password) return;
    const url = `${trimSlash(account.server)}/xmltv.php?username=${encodeURIComponent(account.username)}&password=${encodeURIComponent(account.password)}`;
    const xml = await fetchText(url);
    importXmlTv(xml);
  }

  function confirmDeleteCurrentProfile() {
    const account = currentAccount();
    if (!account || account.id === "demo") {
      notify("Profile not removable", "Add a real login before removing profiles.");
      return;
    }
    const count = state.channels.filter((channel) => channel.accountId === account.id).length;
    const confirmed = window.confirm(`Remove "${account.name}" and delete its ${count} saved catalog items from this browser?`);
    if (confirmed) deleteAccount(account.id);
  }

  async function deleteAccount(id) {
    const account = state.accounts.find((item) => item.id === id);
    if (!account || account.id === "demo") {
      notify("Profile not removable", "The built-in demo profile cannot be removed.");
      return;
    }
    const removedChannelIds = idsForAccount(id);
    const wasCurrent = state.currentAccountId === id;
    state.accounts = state.accounts.filter((account) => account.id !== id);
    state.channels = state.channels.filter((channel) => channel.accountId !== id);
    groupFacetCache.clear();
    removeChannelLinkedData(removedChannelIds);
    try {
      await deleteStoredChannelsForAccount(id);
    } catch (error) {
      console.warn(error);
    }
    if (wasCurrent) {
      state.currentAccountId = nextProfileAfterDelete()?.id || "demo";
      state.currentChannelId = null;
      destroyHls();
      els.player.pause();
      els.player.removeAttribute("src");
      els.player.load();
      els.playerEmpty.classList.remove("is-hidden");
    }
    activeGroup = "All";
    saveState();
    renderAll();
    notify("Profile removed", `${account.name} and its channels were deleted.`);
  }

  function nextProfileAfterDelete() {
    const realProfiles = state.accounts.filter((account) => account.id !== "demo");
    return realProfiles[0] || state.accounts.find((account) => account.id === "demo") || state.accounts[0];
  }

  function idsForAccount(accountId) {
    return state.channels
      .filter((channel) => channel.accountId === accountId)
      .map((channel) => channel.id);
  }

  function removeChannelLinkedData(channelIds) {
    const removed = new Set(channelIds);
    if (!removed.size) return;
    state.epg = state.epg.filter((program) => !removed.has(program.channelId));
    state.favorites = state.favorites.filter((id) => !removed.has(id) && findChannel(id));
    state.hidden = state.hidden.filter((id) => !removed.has(id) && findChannel(id));
    state.locked = state.locked.filter((id) => !removed.has(id) && findChannel(id));
    state.history = state.history.filter((entry) => !removed.has(entry.id) && findChannel(entry.id));
    state.schedules = state.schedules.filter((entry) => !removed.has(entry.channelId));
    state.subtitles = state.subtitles.map((subtitle) => (
      removed.has(subtitle.linkedChannelId) ? { ...subtitle, linkedChannelId: null } : subtitle
    ));
    if (removed.has(state.currentChannelId)) state.currentChannelId = null;
  }

  function handleKeyboard(event) {
    if (event.target.matches("input, select, textarea") || event.metaKey || event.ctrlKey || event.altKey) return;
    showPlayerChrome();
    if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    } else if (event.key === "ArrowUp") {
      els.player.volume = Math.min(1, els.player.volume + 0.05);
      els.volumeRange.value = els.player.volume;
    } else if (event.key === "ArrowDown") {
      els.player.volume = Math.max(0, els.player.volume - 0.05);
      els.volumeRange.value = els.player.volume;
    } else if (event.key === "ArrowRight") {
      if (Number.isFinite(els.player.duration)) els.player.currentTime = Math.min(els.player.duration, els.player.currentTime + 15);
      else stepChannel(1);
    } else if (event.key === "ArrowLeft") {
      if (Number.isFinite(els.player.duration)) els.player.currentTime = Math.max(0, els.player.currentTime - 15);
      else stepChannel(-1);
    } else if (event.key.toLowerCase() === "f") {
      toggleFullscreen();
    } else if (event.key.toLowerCase() === "p") {
      togglePip();
    } else if (event.key.toLowerCase() === "m") {
      toggleMute();
    } else if (event.key === "/") {
      event.preventDefault();
      els.globalSearch.focus();
    }
  }

  function openDialog(dialog) {
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute("open", "open");
  }

  function closeDialog(dialog) {
    if (dialog.close) dialog.close();
    else dialog.removeAttribute("open");
  }

  function setChatOpen(open) {
    els.chatPanel?.classList.toggle("is-hidden", !open);
    els.chatToggleBtn?.setAttribute("aria-expanded", String(open));
    if (open) {
      renderChat();
      window.setTimeout(() => els.chatInput?.focus(), 60);
    }
  }

  function renderChat() {
    if (!els.chatMessages) return;
    const messages = chatState.messages.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const rows = messages.map((message) => `
      <div class="chat-message ${message.source === "user" ? "is-user" : "is-assistant"}">
        <div class="chat-bubble">
          <span>${escapeHtml(message.content)}</span>
          <time>${escapeHtml(formatChatTime(message.createdAt))}</time>
        </div>
      </div>
    `);
    if (chatState.pending) {
      rows.push(`
        <div class="chat-message is-assistant is-pending">
          <div class="chat-bubble"><span>Thinking...</span></div>
        </div>
      `);
    }
    els.chatMessages.innerHTML = rows.join("") || `
      <div class="chat-empty">
        <strong>Capy AI</strong>
        <span>Ask a question while watching.</span>
      </div>
    `;
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    if (els.chatSendBtn) els.chatSendBtn.disabled = chatState.pending;
  }

  async function handleChatSubmit(event) {
    event.preventDefault();
    const text = els.chatInput.value.trim();
    if (!text || chatState.pending) return;
    const knownIds = officialChatIds();
    chatState.messages.push({
      id: uid("local-chat"),
      source: "user",
      content: text,
      createdAt: new Date().toISOString(),
      local: true
    });
    chatState.pending = true;
    els.chatInput.value = "";
    renderChat();

    try {
      const response = await fetch(`${location.origin}/api/capy/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: chatState.threadId,
          message: text,
          knownIds
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      chatState.threadId = data.threadId || chatState.threadId;
      mergeChatMessages(data.messages || []);
      chatState.pending = !data.reply && /running|queued|waiting/i.test(data.status || "");
      saveChatState();
      renderChat();
      if (chatState.pending) startChatPolling();
    } catch (error) {
      chatState.pending = false;
      chatState.messages.push({
        id: uid("chat-error"),
        source: "assistant",
        content: `Chat unavailable: ${error.message}`,
        createdAt: new Date().toISOString()
      });
      renderChat();
      notify("Chat unavailable", error.message);
    }
  }

  function mergeChatMessages(messages) {
    messages.forEach((message) => {
      const normalized = {
        id: String(message.id || uid("chat")),
        source: message.source === "user" ? "user" : "assistant",
        content: String(message.content || ""),
        createdAt: message.createdAt || new Date().toISOString()
      };
      if (!normalized.content) return;
      const index = chatState.messages.findIndex((item) => item.id === normalized.id);
      if (index >= 0) {
        chatState.messages[index] = normalized;
        return;
      }
      const localIndex = chatState.messages.findIndex((item) => (
        item.local
        && item.source === normalized.source
        && item.content.trim() === normalized.content.trim()
      ));
      if (localIndex >= 0) chatState.messages[localIndex] = normalized;
      else chatState.messages.push(normalized);
    });
    chatState.messages = chatState.messages
      .filter((message) => message.content)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-80);
  }

  function startChatPolling() {
    window.clearInterval(chatPollTimer);
    chatPollTimer = window.setInterval(pollChatMessages, 3500);
  }

  async function pollChatMessages() {
    if (!chatState.threadId || !chatState.pending) {
      window.clearInterval(chatPollTimer);
      return;
    }
    const known = new Set(officialChatIds());
    try {
      const response = await fetch(`${location.origin}/api/capy/messages?threadId=${encodeURIComponent(chatState.threadId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      mergeChatMessages(data.messages || []);
      const hasNewAssistant = (data.messages || []).some((message) => message.source === "assistant" && !known.has(message.id));
      chatState.pending = !hasNewAssistant && /running|queued|waiting/i.test(data.status || "");
      if (!chatState.pending) window.clearInterval(chatPollTimer);
      saveChatState();
      renderChat();
    } catch (error) {
      chatState.pending = false;
      window.clearInterval(chatPollTimer);
      notify("Chat unavailable", error.message);
      renderChat();
    }
  }

  function resetChat() {
    window.clearInterval(chatPollTimer);
    chatState.threadId = "";
    chatState.messages = [];
    chatState.pending = false;
    saveChatState();
    renderChat();
    els.chatInput?.focus();
  }

  function officialChatIds() {
    return chatState.messages.filter((message) => !message.local).map((message) => message.id);
  }

  function formatChatTime(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  }

  function profileLoadingCopy() {
    if (accountType === "mac") {
      return {
        title: "Connecting to MAC portal",
        message: "Signing in, loading live channels, then adding movie and series groups."
      };
    }
    if (accountType === "xtream") {
      return {
        title: "Loading Xtream profile",
        message: "Fetching the playlist and organizing channels into groups."
      };
    }
    return {
      title: "Loading M3U playlist",
      message: "Fetching the playlist and preparing the channel browser."
    };
  }

  function setAccountBusy(active, title = "", message = "") {
    if (els.accountBusy) {
      els.accountBusy.classList.toggle("is-hidden", !active);
      els.accountBusy.innerHTML = active ? `
        <span class="loading-spinner"></span>
        <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(message)}</small></span>
      ` : "";
    }
    if (els.accountForm) {
      $$("input, .account-tabs button, #m3uFileBtn", els.accountForm)
        .forEach((control) => { control.disabled = active; });
    }
    setButtonBusy(els.saveAccountBtn, active, "Adding...");
  }

  function setGlobalBusy(active, title = "", message = "") {
    if (!els.busyOverlay) return;
    els.busyOverlay.classList.toggle("is-hidden", !active);
    if (active) {
      if (els.busyTitle) els.busyTitle.textContent = title || "Working";
      if (els.busyMessage) els.busyMessage.textContent = message || "Please wait";
    }
  }

  function setButtonBusy(button, active, loadingText = "Loading...") {
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
    button.classList.toggle("is-loading", active);
    button.disabled = active;
    button.textContent = active ? loadingText : button.dataset.defaultText;
  }

  function notify(title, message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message || "")}</span>`;
    els.toastStack.append(toast);
    window.setTimeout(() => toast.remove(), 4200);
    els.connectionBadge.textContent = title;
  }

  function startClock() {
    const tick = () => {
      els.clock.textContent = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date());
    };
    tick();
    window.setInterval(tick, 30000);
  }

  function rememberHistory(channel) {
    state.history = state.history.filter((entry) => entry.id !== channel.id);
    state.history.unshift({ id: channel.id, title: channel.title, at: Date.now() });
    state.history = state.history.slice(0, 40);
  }

  function favoriteChannels() {
    return state.favorites.map(findChannel).filter(Boolean);
  }

  function isFavorite(id) {
    return state.favorites.includes(id);
  }

  function isHidden(id) {
    return state.hidden.includes(id);
  }

  function isLocked(id) {
    return state.locked.includes(id);
  }

  function currentChannel() {
    return findChannel(state.currentChannelId);
  }

  function currentAccount() {
    return state.accounts.find((account) => account.id === state.currentAccountId);
  }

  function mediaTypeMeta(type = activeType) {
    return MEDIA_TYPES.find((item) => item.id === type) || MEDIA_TYPES[0];
  }

  function channelTypeMatches(channel, type = activeType) {
    if (type === "all") return true;
    return (channel?.type || "live") === type;
  }

  function channelsForAccount(accountId, type = activeType, options = {}) {
    return state.channels.filter((channel) => {
      if (channel.accountId !== accountId) return false;
      if (!channelTypeMatches(channel, type)) return false;
      return options.includeCatalogOnly || !channel.catalogOnly;
    });
  }

  function catalogChannelsForAccount(accountId, type = activeType) {
    return channelsForAccount(accountId, type, { includeCatalogOnly: true });
  }

  function liveChannelsForAccount(accountId) {
    return state.channels.filter((channel) => channel.accountId === accountId && channel.type === "live");
  }

  function mediaCountsForAccount(accountId) {
    const counts = { live: 0, movie: 0, series: 0, music: 0, all: 0 };
    const categories = { movie: 0, series: 0 };
    state.channels.forEach((channel) => {
      if (channel.accountId !== accountId) return;
      const type = channel.type || "live";
      if (channel.catalogOnly) {
        if (type === "movie" || type === "series") categories[type] += 1;
        return;
      }
      counts[type] = (counts[type] || 0) + 1;
      counts.all += 1;
    });
    return { counts, categories };
  }

  function findChannel(id) {
    return findChannelIn(state.channels, id);
  }

  function findChannelIn(channels, id) {
    return channels.find((channel) => channel.id === id);
  }

  function countChannelsByAccount(channels) {
    return channels.reduce((counts, channel) => {
      counts[channel.accountId] = (counts[channel.accountId] || 0) + 1;
      return counts;
    }, {});
  }

  function listRow(channel, actionText, actionAttrs) {
    return `
      <div class="list-row">
        <div>
          <div class="row-title">${escapeHtml(channel.title)}</div>
          <div class="row-meta">${escapeHtml(channel.group || "Other")} - ${escapeHtml(channel.quality || "")}</div>
        </div>
        <button class="icon-btn" ${actionAttrs} title="${escapeHtml(actionText)}">${escapeHtml(actionText)}</button>
      </div>
    `;
  }

  function emptyRow(text) {
    return `<div class="list-row"><div><div class="row-title">${escapeHtml(text)}</div><div class="row-meta">SFVIP Web Player</div></div></div>`;
  }

  function openSmartFilterFallback() {
    activeType = "all";
    activeGroup = "All";
    renderChannelBrowser();
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

  function inferStreamFormat(url = "") {
    const value = String(url || "").toLowerCase();
    if (/\.m3u8(?:$|[?#])|mpegurl/.test(value)) return "hls";
    if (/\.flv(?:$|[?#])|type=flv/.test(value)) return "flv";
    if (/\.m2ts(?:$|[?#])|\.ts(?:$|[?#])|extension=ts|\/live\/play\//.test(value)) return "mpegts";
    return "";
  }

  function stalkerCommandFromUrl(value = "") {
    if (!isRemoteUrl(value)) return "";
    try {
      const parsed = new URL(value);
      if (/\/ch\/[^/]+_?$/i.test(parsed.pathname)) {
        return `ffmpeg http://localhost${parsed.pathname}`;
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function normalizeMac(value = "") {
    const raw = value.replace(/[^a-f0-9]/gi, "").toUpperCase().slice(0, 12);
    return raw.match(/.{1,2}/g)?.join(":") || "";
  }

  function srtToVtt(text) {
    return `WEBVTT\n\n${text.replace(/\r/g, "").replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2")}`;
  }

  function ensureVtt(text) {
    return text.trimStart().startsWith("WEBVTT") ? text : `WEBVTT\n\n${text}`;
  }

  function parseXmlTvDate(value) {
    if (!value) return null;
    const match = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-]\d{4}))?/);
    if (!match) return null;
    const [, y, mo, d, h, mi, s, zone] = match;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}`;
    if (!zone) return new Date(iso);
    const offset = `${zone.slice(0, 3)}:${zone.slice(3)}`;
    return new Date(`${iso}${offset}`);
  }

  async function fetchText(url) {
    if (isRemoteUrl(url) && location.protocol.startsWith("http")) {
      try {
        const proxied = await fetch(`${location.origin}/api/fetch?url=${encodeURIComponent(url)}`);
        if (proxied.ok) return proxied.text();
      } catch (error) {
        // Fall back to a direct browser fetch below.
      }
    }
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  }

  async function detectProxy() {
    if (!location.protocol.startsWith("http")) return;
    try {
      const response = await fetch(`${location.origin}/api/health`, { cache: "no-store" });
      proxyAvailable = response.ok;
      if (proxyAvailable) notify("Proxy ready", "Remote playlists and HLS streams can use the local proxy.");
    } catch (error) {
      proxyAvailable = false;
    }
  }

  function proxiedUrl(url) {
    if (!isRemoteUrl(url)) return url;
    return `${location.origin}/proxy?url=${encodeURIComponent(url)}`;
  }

  function isRemoteUrl(url = "") {
    return /^https?:\/\//i.test(url);
  }

  function preferredDate(value) {
    return new Date(value);
  }

  function toInputDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function toDatetimeLocal(date) {
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  }

  function formatDateTime(value) {
    return new Intl.DateTimeFormat([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  }

  function timeAgo(value) {
    const seconds = Math.max(1, Math.floor((Date.now() - value) / 1000));
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} day ago`;
  }

  function historyLabel(id) {
    const entry = state.history.find((item) => item.id === id);
    return entry ? timeAgo(entry.at) : "New";
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${size.toFixed(unit ? 1 : 0)} ${units[unit]}`;
  }

  function initials(text = "") {
    const words = text.replace(/[^a-z0-9 ]/gi, " ").trim().split(/\s+/).filter(Boolean);
    return (words[0]?.[0] || "S").toUpperCase() + (words[1]?.[0] || words[0]?.[1] || "F").toUpperCase();
  }

  function clean(value = "") {
    return String(value).toLowerCase().trim();
  }

  function slug(value = "") {
    return clean(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
  }

  function trimSlash(value) {
    return value.replace(/\/+$/, "");
  }

  function rewriteProviderLocalUrl(url = "", portal = "") {
    try {
      const stream = new URL(url, portal);
      const portalUrl = new URL(portal);
      if (["localhost", "127.0.0.1", "::1"].includes(stream.hostname)) {
        stream.protocol = portalUrl.protocol;
        stream.host = portalUrl.host;
      }
      return stream.href;
    } catch (error) {
      return url;
    }
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
  }

  function stableChannelId(account, channel) {
    const raw = [
      account?.id || "account",
      channel?.id || channel?.epgId || "",
      channel?.command || channel?.macCommand || channel?.url || "",
      channel?.title || ""
    ].join("|");
    return `stream-${stableHash(raw)}`;
  }

  function stableHash(value = "") {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value = "") {
    return escapeHtml(String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n]/g, ""));
  }

  window.addEventListener("beforeunload", () => {
    destroyHls();
    window.clearInterval(chatPollTimer);
    window.clearInterval(playbackHealthTimer);
    window.clearTimeout(controlsHideTimer);
    if (playbackChromeFrame) window.cancelAnimationFrame(playbackChromeFrame);
    longTaskObserver?.disconnect?.();
    transientUrls.forEach((url) => URL.revokeObjectURL(url));
  });

  window.sfvipWebPlayer = {
    state,
    playChannelById,
    importXmlTv,
    parseM3U,
    renderAll,
    renderChannelBrowser,
    replaceStoredChannelsForAccount,
    openSmartFilterFallback,
    playbackDiagnostics
  };
})();
