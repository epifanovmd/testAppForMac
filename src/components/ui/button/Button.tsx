import React, { FC, memo, useMemo } from "react";
import {
  ActivityIndicator,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { Text } from "../text";
import { FlexComponentProps, useFlexProps } from "../../elements";
import { useTheme } from "../../../common";
import { Touchable } from "../touchable";

interface IProps extends FlexComponentProps<TouchableOpacityProps> {
  loading?: boolean;
  title: string;
  fontSize?: number;
  textStyle?: TextStyle;
}

export const Button: FC<IProps> = memo(
  ({ loading, title, fontSize, color, textStyle, ...rest }) => {
    const { theme } = useTheme();
    const { style, ownProps } = useFlexProps(rest, {
      radius: 4,
      bg:
        rest.disabled || loading
          ? theme.color.primary.light
          : theme.color.primary.main,
      height: 52,
      justifyContent: "center",
      alignItems: "center",
      pv: 8,
      ph: 12,
    });

    const buttonColor = useMemo(
      () =>
        color
          ? color
          : rest.disabled || loading
          ? theme.color.primary.contrastText
          : theme.color.grey.grey600,
      [
        color,
        rest.disabled,
        theme.color.grey.grey600,
        theme.color.primary.contrastText,
      ],
    );

    return (
      <Touchable
        activeOpacity={0.7}
        delayPressIn={100}
        style={style}
        {...ownProps}
        disabled={ownProps.disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={buttonColor || theme.color.primary.main}
          />
        ) : (
          <Text
            lineBreakMode={"tail"}
            fontSize={14}
            fontWeight={"bold"}
            color={buttonColor}
            textTransform={"uppercase"}
          >
            {title}
          </Text>
        )}
      </Touchable>
    );
  },
);
