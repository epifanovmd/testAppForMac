import React, { FC } from "react";
import {
  ILanguageType,
  langResources,
  useTranslation,
} from "../../localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TouchableOpacity } from "react-native";

export const languages: { id: keyof typeof langResources; name: string }[] = [
  {
    id: "ru",
    name: "Russian",
  },
];

export const LangSwitcher: FC = () => {
  const { i18n } = useTranslation();

  const changeLang = async (value: ILanguageType) => {
    await i18n.changeLanguage(value);
    await AsyncStorage.setItem("i18nextLng", value);
  };

  const handleSetLanguage = (lang: ILanguageType) => (): void => {
    changeLang(lang).then();
  };

  return (
    <>
      {languages.map(lang =>
        i18n.language !== lang.id ? (
          <TouchableOpacity
            activeOpacity={0.7}
            delayPressIn={100}
            key={lang.id}
            onPress={handleSetLanguage(lang.id)}
          >
            <Text>{lang.name}</Text>
          </TouchableOpacity>
        ) : null,
      )}
    </>
  );
};
