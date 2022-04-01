import React, { useCallback, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { initLocalization, useTranslation } from "./localization";
import RNBootSplash from "react-native-bootsplash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "./common";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Config from "react-native-config";
import { AppScreens } from "./AppScreens";
import { Notification } from "./components/notification";
import { StatusBar } from "./components";
import { Host } from "react-native-portalize";
import { configure } from "mobx";

configure({ enforceActions: "observed" });

RNBootSplash.show().then();
initLocalization({ initLang: "ru" });

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    AsyncStorage.getItem("i18nextLng").then(async lang => {
      if (lang) {
        await i18n.changeLanguage(lang);
      }
    });

    console.log("CONFIG", JSON.stringify(Config));
  }, [i18n]);

  const onReady = useCallback(() => {
    RNBootSplash.getVisibilityStatus().then(status => {
      if (status === "visible") {
        RNBootSplash.hide({ fade: true }).then();
      }
    });
  }, []);

  // fix hide with live reloading app
  useEffect(() => {
    setTimeout(() => {
      onReady();
    }, 1000);
  }, [onReady]);

  return (
    <ThemeProvider>
      <StatusBar />
      <SafeAreaProvider>
        <Host>
          <Notification>
            <NavigationContainer onStateChange={onReady} onReady={onReady}>
              <AppScreens />
            </NavigationContainer>
          </Notification>
        </Host>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
