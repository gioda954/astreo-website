const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
const languageToggle = document.querySelector("[data-language-toggle]");
const languageStorageKey = "astreo-language";
const preorderCampaign = {
  link: "/ordina",
  bottles: {
    current: 480,
    goal: 600,
  },
  fundraisingGoalNet: 7500,
};

const pageMeta = {
  home: {
    it: {
      title: "Astreo | Un vino, un sogno realizzato",
      description:
        "Astreo è un progetto solidale nato da un gruppo di ex-allievi: un vino artigianale che ha finanziato la donazione di un pianoforte alla scuola.",
    },
    en: {
      title: "Astreo | A wine, a dream fulfilled",
      description:
        "Astreo is a solidarity project created by a group of alumni: an artisanal wine that funded the donation of a grand piano to the school.",
    },
  },
  album: {
    it: {
      title: "Astreo | Album delle vendemmie",
      description:
        "Rivivi le vendemmie del progetto Astreo e la consegna del pianoforte: album fotografici con il team e i momenti simbolo.",
    },
    en: {
      title: "Astreo | Harvest Albums",
      description:
        "Relive the Astreo harvests and the piano donation through photo albums featuring the team and the project’s defining moments.",
    },
  },
  second: {
    it: {
      title: "Astreo | Seconda edizione 2026",
      description:
        "La seconda edizione di Astreo sostiene una biblioteca per un orfanotrofio di bambine in India, in collaborazione con Anna4Children.",
    },
    en: {
      title: "Astreo | Second Edition 2026",
      description:
        "Astreo’s second edition supports a library for a girls’ orphanage in India, in collaboration with Anna4Children.",
    },
  },
};

const translations = {
  en: {
    common: {
      mainNavigation: "Main navigation",
      openMenu: "Open menu",
      preorderNow: "Pre-Order Now",
      preorderAstreoNow: "Pre-Order Astreo Now",
      secondEdition2026: "Second Edition 2026",
      libraryTitle: "A library for a girls’ orphanage in India",
      libraryLead:
        "This year Astreo aims to raise funds to donate a library to a girls’ orphanage in extreme poverty in India.",
      bottleGoal: "Goal: 1000 bottles",
      progressAria: "Astreo pre-order progress",
      fundraisingGoal:
        "This year’s goal is to raise a net total of <strong data-fundraising-goal>€7,500</strong> to complete the project.",
      footer:
        "A solidarity project created by alumni. All rights reserved.",
      pianoDeliveryAlt:
        "Delivery of the piano to the Morosini Naval Military School",
      pianoTeamAlt:
        "Astreo project alumni with the donated piano",
      pianoAlt: "The grand piano donated to Morosini",
    },
    nav: {
      story: "Story",
      wine: "The wine",
      gift: "The gift",
      secondEdition: "Second edition",
      about: "About us",
      gallery: "Gallery",
      contacts: "Contacts",
    },
    home: {
      heroImageAlt: "Bottle of Astreo wine on a black background",
      heroOverline: "2024 Edition",
      heroTitle: "Astreo, our dream.",
      heroLead:
        "Astreo is the project created by the Astraios 19-22 class of the Morosini Naval School in Venice: a wine followed through every phase, from harvest to labeling, to leave a positive impact on our school and, in the future, on the world.",
      discoverSecondEdition: "Discover the second edition",
      storyTitle: "A project about brotherhood and values",
      storyText:
        "In 2024, around twenty alumni from the Astraios 19-22 class created Astreo to leave a tangible mark on the school that raised them. The proceeds funded the donation of a grand piano for the music room, and the project continues as an initiative for all Morosini alumni, open to ideas and contributions for future editions.",
      wineTypeLabel: "Type",
      wineTypeText: "Bordeaux blend: 50% Cabernet, 50% Merlot.",
      wineProcessLabel: "Supply chain",
      wineProcessText:
        "Followed by alumni at every stage, from the harvest to the label.",
      wineQualityLabel: "Quality",
      wineQualityText:
        "Masari supported us and guarantees the quality, as one of the best wineries in Italy.",
      wineFirstEditionLabel: "The first edition (2024) was dedicated to",
      wineFirstEditionText:
        "The purchase of a grand piano for the music room, now available to all students.",
      bottleAlt: "Astreo bottle with a black label and helmet details",
      giftTitle: "The piano delivery",
      giftText:
        "The proceeds from the 2024 edition made it possible to deliver the grand piano to Morosini, a gift for today’s students and those of tomorrow.",
      valueSolidarity:
        "<strong>Solidarity</strong>: every bottle supports a shared good.",
      valueCulture:
        "<strong>Culture</strong>: the instrument invites students to play and share music.",
      valueMemory:
        "<strong>Memory</strong>: the legacy of the Astraios class and of everyone who contributed remains alive in the school.",
      valueContinuity:
        "<strong>Continuity</strong>: the project will continue with new editions.",
      secondPreviewText:
        "The project is developed in collaboration with Anna4Children, which built and maintains the orphanage. We are excited to contribute, in our small way, to this major project and are deeply inspired by their story.",
      discoverProject: "Discover the project",
      orphanageAlt:
        "The orphanage in India involved in Astreo’s second-edition project",
      childrenFamiliesAlt:
        "Girls and families near the orphanage supported by Anna4Children",
      dailyLifeAlt:
        "A daily-life moment in the project supported by Astreo’s second edition",
      teamTitle: "Alumni, school, community",
      teamIntro:
        "A collective project with different roles, united by the same goal.",
      alumniTitle: "The alumni",
      alumniText: "A group of alumni followed every phase of the project.",
      alumniPoint1: "Harvesting and cellar work.",
      alumniPoint2: "Label, communication and sales.",
      schoolTitle: "School",
      schoolText:
        "The school supported the initiative with spaces and coordination.",
      schoolPoint1: "Organizational and institutional support.",
      schoolPoint2: "Sharing the results with the community.",
      communityTitle: "Morosini community",
      communityText:
        "The project belongs to all Morosini alumni and is open to ideas and contributions.",
      communityPoint1: "Ideas to improve the next editions.",
      communityPoint2: "The spirit that unites all Morosini alumni.",
      photoAlbums: "Photo albums",
      harvestsTitle: "Astreo’s harvests",
      albumPreviewText:
        "Discover photos from the harvests and the piano delivery: the project told through our images.",
      goToAlbums: "Go to the photo albums",
      contactsTitle: "Follow the project or contact us",
      contactsText:
        "Would you like to collaborate or follow Astreo? Write to us or follow our channels.",
      emailCta: "write to gioda2603@gmail.com",
      instagramCta: "@astreo.wine on Instagram",
      references:
        'References: <a href="https://astraios.it/" target="_blank" rel="noopener">astraios.it</a> and <a href="https://www.instagram.com/astreo.wine/" target="_blank" rel="noopener">@astreo.wine</a>.',
    },
    album: {
      heroTitle: "Astreo harvests, memories by year",
      heroLead:
        "The images tell the collective effort behind every bottle: harvests, teamwork and the delivery of the piano to the school.",
      goToHarvests: "Go to the harvests",
      edition2024: "2024 Edition",
      harvest2024Title: "The harvest that brought the piano to life",
      harvest2024Text:
        "Highlights from the year that funded the Morosini piano: harvest, teamwork and the first toasts.",
      pianoText:
        "The tangible result of the project: the grand piano donated to Morosini.",
      edition2025: "2025 Edition",
      harvest2025Title: "A new vintage to carry the dream forward",
      harvest2025Text:
        "In 2025 the harvest continued the path of solidarity and the project’s shared memory.",
      alt2024HarvestRows: "Astreo 2024 harvest, picking among the rows",
      alt2024TeamWork: "Astreo 2024 harvest, the team at work",
      alt2024GrapeSelection: "Astreo 2024 harvest, selecting the bunches",
      alt2024SunsetRows: "Astreo 2024 harvest, view of the rows at sunset",
      alt2024GrapesDetail: "Astreo 2024 harvest, detail of picked grapes",
      alt2024TeamMoment: "Astreo 2024 harvest, team moment",
      alt2024Toast: "Astreo 2024 harvest, final toast among alumni",
      alt2025SharingRows: "Astreo 2025 harvest, sharing time among the rows",
      alt2025Vineyards: "Astreo 2025 harvest, view over the vineyards",
      alt2025ManualHarvest: "Astreo 2025 harvest, hand-picking the grapes",
      alt2025Crates: "Astreo 2025 harvest, alumni with grape crates",
      alt2025CellarGrapes: "Astreo 2025 harvest, grape details in the cellar",
      alt2025TeamVineyard: "Astreo 2025 harvest, team posing in the vineyard",
      alt2025Break: "Astreo 2025 harvest, break and smiles",
      alt2025SunlitRows: "Astreo 2025 harvest, sunlit rows",
      alt2025Pressing: "Astreo 2025 harvest, grape pressing",
      alt2025TeamHarvest: "Astreo 2025 harvest, harvesting as a team",
      alt2025FinalToast: "Astreo 2025 harvest, closing toast",
    },
    second: {
      heroNote:
        "We are doing this together with Anna4Children, the organization that built and maintains the orphanage. We are excited to contribute, in our small way, to this major project, and we are deeply inspired by their story.",
      backHome: "Back to home",
      heroImageAlt:
        "The girls’ orphanage in India supported by Astreo’s second edition",
      projectOverline: "The project",
      projectTitle: "Concrete help, simply",
      projectText:
        "Astreo was created to turn a bottle into a concrete gesture. After donating the piano to Morosini, our goal today is to help create a library that can offer space, study and a future to girls living in extreme poverty.",
      withAnna: "With Anna4Children",
      inspiringTitle: "A project that inspires us",
      inspiringText:
        "Anna4Children built and continues to maintain the orphanage. We want to stand beside them with respect and gratitude, supporting a precise and useful part of this journey: the library.",
      reserveBottles: "Reserve the bottles",
      imagesOverline: "Images",
      galleryTitle: "The place we want to support",
      galleryAltBuilding:
        "The orphanage building supported by Anna4Children",
      galleryAltCommunity:
        "Families and girls in the community around the orphanage",
      galleryAltGirls:
        "Girls from the orphanage in a daily moment",
      galleryAltSharedSpace:
        "Shared space at the orphanage supported by the Astreo project",
      contributeOverline: "Contribute",
      ctaTitle: "Buy the wine and support the library",
      ctaText:
        "Every contribution can help Astreo take part, concretely, in this project with Anna4Children.",
      moreContacts: "Other contacts",
    },
  },
};

const getNestedTranslation = (language, key) =>
  key.split(".").reduce((value, part) => value?.[part], translations[language]);

const getStoredLanguage = () => {
  try {
    return localStorage.getItem(languageStorageKey);
  } catch {
    return null;
  }
};

const storeLanguage = (language) => {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // The toggle still works for the current page if storage is unavailable.
  }
};

const originalText = new Map();
const originalHtml = new Map();
const originalAttributes = new Map();

document.querySelectorAll("[data-i18n]").forEach((el) => {
  originalText.set(el, el.textContent);
});

document.querySelectorAll("[data-i18n-html]").forEach((el) => {
  originalHtml.set(el, el.innerHTML);
});

[
  ["data-i18n-alt", "alt"],
  ["data-i18n-aria-label", "aria-label"],
].forEach(([dataAttr, attr]) => {
  document.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
    originalAttributes.set(el, {
      ...originalAttributes.get(el),
      [attr]: el.getAttribute(attr) ?? "",
    });
  });
});

let currentLanguage = getStoredLanguage() === "en" ? "en" : "it";

const formatInteger = () =>
  new Intl.NumberFormat(currentLanguage === "en" ? "en-US" : "it-IT");

const formatCurrency = () =>
  new Intl.NumberFormat(currentLanguage === "en" ? "en-US" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const updateCampaignProgress = () => {
  document.querySelectorAll("[data-campaign-progress]").forEach((card) => {
    const { current, goal } = preorderCampaign.bottles;
    const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const integerFormatter = formatInteger();
    const currencyFormatter = formatCurrency();

    card.querySelectorAll("[data-current-bottles]").forEach((el) => {
      el.textContent = integerFormatter.format(current);
    });

    card.querySelectorAll("[data-total-bottles]").forEach((el) => {
      el.textContent = integerFormatter.format(goal);
    });

    card.querySelectorAll("[data-progress-percent]").forEach((el) => {
      el.textContent = `${Math.round(progress)}%`;
    });

    card.querySelectorAll("[data-progress-fill]").forEach((el) => {
      el.style.width = `${progress}%`;
    });

    card.querySelectorAll("[data-fundraising-goal]").forEach((el) => {
      el.textContent = currencyFormatter.format(preorderCampaign.fundraisingGoalNet);
    });

    const progressbar = card.querySelector(".campaign-progress-track");
    if (progressbar) {
      progressbar.setAttribute("aria-valuemax", String(goal));
      progressbar.setAttribute("aria-valuenow", String(current));
    }
  });
};

const updateMeta = (language) => {
  const page = body.dataset.page;
  const meta = page ? pageMeta[page]?.[language] : null;
  if (!meta) return;

  document.title = meta.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", meta.description);
  }
};

const applyLanguage = (language) => {
  currentLanguage = language;
  document.documentElement.lang = language;
  storeLanguage(language);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const translated = getNestedTranslation(language, el.dataset.i18n);
    el.textContent = translated ?? originalText.get(el) ?? el.textContent;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const translated = getNestedTranslation(language, el.dataset.i18nHtml);
    el.innerHTML = translated ?? originalHtml.get(el) ?? el.innerHTML;
  });

  [
    ["data-i18n-alt", "alt"],
    ["data-i18n-aria-label", "aria-label"],
  ].forEach(([dataAttr, attr]) => {
    document.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
      const translated = getNestedTranslation(language, el.getAttribute(dataAttr));
      const original = originalAttributes.get(el)?.[attr] ?? "";
      el.setAttribute(attr, translated ?? original);
    });
  });

  if (languageToggle) {
    languageToggle.textContent = language === "en" ? "IT" : "EN";
    languageToggle.setAttribute(
      "aria-label",
      language === "en" ? "Passa all’italiano" : "Switch to English",
    );
    languageToggle.setAttribute("aria-pressed", String(language === "en"));
  }

  updateMeta(language);
  updateCampaignProgress();
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    applyLanguage(currentLanguage === "en" ? "it" : "en");
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href")?.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus?.({ preventScroll: true });
    }
  });
});

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

document.querySelectorAll("[data-preorder-link]").forEach((link) => {
  link.setAttribute("href", preorderCampaign.link);
  if (link.getAttribute("target") !== "_blank") {
    link.setAttribute("target", "_blank");
  }
  link.setAttribute("rel", "noopener");
});

applyLanguage(currentLanguage);
