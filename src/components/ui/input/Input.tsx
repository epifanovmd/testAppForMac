import React, {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
} from "react-native";
import { Placeholder } from "../placeholder";
import { FlexComponentProps, useFlexProps } from "../../elements";
import { Touchable } from "../touchable";

const visibilityIcon = require("../../icons/input/visibilityIcon.png");
const visibilityOffIcon = require("../../icons/input/visibilityOffIcon.png");

export interface IInputProps extends FlexComponentProps {
  value?: string;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onChangeText?: (text: string) => void;
  disabled?: boolean;
  isPassword?: boolean;
  placeholder?: string;
}

export const Input: FC<IInputProps> = forwardRef<TextInput, IInputProps>(
  (
    {
      value,
      onBlur,
      onFocus,
      isPassword,
      onChangeText,
      placeholder,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const { style, ownProps } = useFlexProps(rest);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isActive, setActive] = useState(false);
    const _value = useRef(value);

    useEffect(() => {
      _value.current = value;
    }, [value]);

    const handleFocus = useCallback(
      event => {
        onFocus?.(event);
        setActive(true);
      },
      [onFocus],
    );

    const onFocusHandler = useCallback(() => {
      setActive(true);
    }, []);

    const handleBlur = useCallback(
      event => {
        onBlur?.(event);
        if (!_value.current && !value) {
          setActive(false);
        }
      },
      [onBlur, value],
    );

    const handleChange = useCallback(
      (text: string) => {
        _value.current = text;
        onChangeText && onChangeText(text);
      },
      [onChangeText],
    );

    const visibilityOn = useCallback(() => {
      setSecureTextEntry(true);
    }, []);
    const visibilityOff = useCallback(() => {
      setSecureTextEntry(false);
    }, []);

    const icon = useMemo(
      () =>
        isPassword ? (
          secureTextEntry ? (
            <Touchable pa={16} disabled={disabled} onPress={visibilityOff}>
              <Image source={visibilityIcon} />
            </Touchable>
          ) : (
            <Touchable pa={16} disabled={disabled} onPress={visibilityOn}>
              <Image source={visibilityOffIcon} />
            </Touchable>
          )
        ) : null,
      [disabled, isPassword, secureTextEntry, visibilityOff, visibilityOn],
    );

    return (
      <Placeholder
        style={style}
        active={isActive}
        onFocus={onFocusHandler}
        rightIcon={icon}
        placeholder={placeholder}
        disabled={disabled}
        {...ownProps}
      >
        <TextInput
          style={[styles.input, { paddingRight: icon ? 48 : 16 }]}
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChange}
          editable={!disabled}
          textContentType={isPassword ? "password" : "none"}
          secureTextEntry={isPassword && secureTextEntry}
        />
      </Placeholder>
    );
  },
);

const styles = StyleSheet.create({
  input: {
    height: "100%",
    flexGrow: 1,
    paddingHorizontal: 16,
  },
});
