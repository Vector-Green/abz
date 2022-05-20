import { createI18n, LocaleMessages, VueMessageType, Locale } from "vue-i18n";

function loadLocaleMessages(): LocaleMessages<VueMessageType> {
  const locales = require.context(
    "./locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages: LocaleMessages<VueMessageType> = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

function getLocale(): Locale {
  const cookieLanguage = sessionStorage.getItem("language");
  if (cookieLanguage) return cookieLanguage;

  const navigatorLanguage = navigator.language.toLowerCase();
  if (navigatorLanguage) return navigatorLanguage;

  return process.env.VUE_APP_I18N_LOCALE || "en";
}

export default createI18n({
  //? use globalInjection?
  //globalInjection: false,

  legacy: false,
  locale: getLocale(),
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: loadLocaleMessages(),

  pluralRules: {
    ru: function (choice: number, choicesLength: number) {
      if (choicesLength == 1) return 0;

      if (choicesLength == 2) {
        const lastCharacter = choice % 10;
        if (lastCharacter == 1) {
          return 1;
        } else {
          return 0;
        }
      }

      if (choicesLength == 3) {
        const lastTwoCharacters = choice % 100;
        if (lastTwoCharacters > 10 && lastTwoCharacters < 20) {
          return 0;
        }

        const lastCharacter = choice % 10;
        switch (lastCharacter) {
          case 0:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
            return 0;

          case 1:
            return 1;

          case 2:
          case 3:
          case 4:
            return 2;
        }
      }
    },
  },
});
