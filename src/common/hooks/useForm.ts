import React, { useCallback, useEffect, useMemo } from "react";
import { ObjectSchema, Shape } from "yup";

export const useForm = <
  T extends object,
  M extends { [key: string]: any } = { [key: string]: any },
>(
  {
    initialValues,
    initialMeta,
    onSubmit,
    onChange,
    validate,
    validateSchema,
    validateOnInit,
    validateOnChange,
    enableReinitialize,
  }: IUseForm<T, M>,
  watch?: (keyof T)[],
): IForm<T, M> => {
  const [values, setValues] = React.useState<T>({ ...initialValues });
  const [meta, changeMeta] = React.useState<M & { [key: string]: any }>(
    initialMeta || ({} as M),
  );
  const [dirty, setDirty] = React.useState<boolean>(false);
  const [touchedValues, setTouchedValues] = React.useState<
    Partial<Record<keyof T | string, boolean>>
  >({});
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof T | string, string>>
  >({});
  const getDirty = useCallback((a, b) => {
    setDirty(JSON.stringify(a) !== JSON.stringify(b));
  }, []);

  const [isInit, setInit] = React.useState(false);

  useEffect(() => {
    if (enableReinitialize) {
      const newInitialValues = { ...initialValues };

      setValues(newInitialValues);
      validateOnChange && validateOnInit && validateValues(newInitialValues);
    }
    // eslint-disable-next-line
  }, [initialValues]);

  useEffect(() => {
    if (enableReinitialize && initialMeta) {
      const newInitialMeta = { ...initialMeta };

      changeMeta(newInitialMeta);
    }
    // eslint-disable-next-line
  }, [initialMeta]);

  useEffect(() => {
    onChange && onChange(values, meta, errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, errors, meta]);

  useEffect(() => {
    validateOnInit && validateValues(values);
    setInit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (validateOnChange && isInit) {
      validateValues(values).then().catch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateSchema, validate]);

  const validateValues = useCallback(
    async (
      validationValues: T,
      afterValidate?: (
        _values: Partial<T>,
        errors: Partial<Record<keyof T | string, string>>,
      ) => void,
    ) => {
      let newErrors = {};

      getDirty(validationValues, initialValues);
      if (validateSchema) {
        await validateSchema
          .validate(validationValues, {
            strict: true,
            abortEarly: false,
          })
          .then(() => {
            setErrors(e => {
              if (Object.keys(e).length > 0) {
                return {};
              }
              Object.keys(e).forEach(key => {
                delete e[key];
              });

              return { ...e };
            });
            afterValidate && afterValidate(validationValues, {});
          })
          .catch(err => {
            if (err.sourceURL) {
              throw new Error(
                `ERROR in - column:${err.column}, line:${err.line}, sourceURL:${err.sourceURL}`,
              );
            }
            setErrors(e => {
              const inner = (err.inner || []) as {
                path: keyof T;
                errors: string[];
              }[];
              const prevErrors = { ...e };

              Object.keys(e).forEach(key => {
                delete e[key];
              });

              inner.forEach(item => {
                const split = (item.path as string).split(".");

                if (split[1]) {
                  if (split[0][split[0].length - 1] !== "]") {
                    e[split[0] as keyof T] = `${(item.errors || [])[0]}`;
                  } else {
                    e[`${split[0]}.${split[1]}` as keyof T] = `${
                      (item.errors || [])[0]
                    }`;
                  }
                } else {
                  e[item.path] = (item.errors || [])[0];
                }
              });

              const prevKeys = Object.keys(prevErrors);
              const eKeys = Object.keys(e);

              if (
                prevKeys.length !== eKeys.length ||
                prevKeys.some(key => prevErrors[key] !== e[key])
              ) {
                // eslint-disable-next-line no-param-reassign
                e = { ...e };
              }

              newErrors = e;
              afterValidate && afterValidate(validationValues, e);

              return e;
            });
          });
      } else {
        const e: Partial<Record<keyof T | string, string>> | null = validate
          ? validate(validationValues, meta)
          : null;

        if (e) {
          newErrors = e;
        }
        setErrors(err => (e ? e : err));
        afterValidate && afterValidate(validationValues, { ...(e as any) });
      }

      const keys = Object.keys(newErrors);

      return Promise.resolve({
        hasErrors: keys.length > 0,
        count: keys.length,
        errors: newErrors,
      });
    },
    [getDirty, initialValues, meta, validate, validateSchema],
  );

  const onSetValues = useCallback(
    (newValues: T) => {
      setValues(newValues);
      validateValues(newValues).then().catch();
    },
    [validateValues],
  );

  const getFields = useCallback(() => {
    const obj: Record<keyof T, string> = {} as Record<keyof T, string>;

    Object.keys(initialValues).forEach(key => {
      obj[key as keyof T] = key;
    });

    return obj;
  }, [initialValues]);

  const fieldNames = useMemo(() => getFields(), [getFields]);

  const fieldsHelper = useMemo(
    () => ({
      remove: (name: keyof T, index: number) => {
        setValues(state => {
          if (state[name]) {
            const newState = {
              ...state,
              [name]: ((state[name] as any) || []).filter(
                ({}, ind: number) => ind !== index,
              ),
            };

            validateOnChange && validateValues(newState);

            return newState;
          }

          return state;
        });
        setErrors(state => {
          const newErrors = { ...state };

          Object.keys(newErrors).forEach(key => {
            if (key.includes(`[${index}]`)) {
              delete newErrors[key];
            }
          });

          return newErrors;
        });
        setTouchedValues(state => {
          const newTouchedValues = { ...state };

          Object.keys(newTouchedValues).forEach(key => {
            if (key.includes(`[${index}]`)) {
              delete newTouchedValues[key];
            }
          });

          return newTouchedValues;
        });
      },
      append: <K extends keyof T>(
        name: K,
        value: TObjectPartial<TCheckArray<T[K]>>,
      ) => {
        setValues(state => {
          const newState = {
            ...state,
            [name]: [...(state[name] as any), value],
          };

          validateOnChange && validateValues(newState);

          return newState;
        });
      },
      replace: <K extends keyof T>(
        name: K,
        index: number,
        value: TObjectPartial<TCheckArray<T[K]>>,
      ) => {
        setValues(state => {
          const newState = {
            ...state,
            [name]: (state[name] as any).map((item: any, ind: number) =>
              ind === index ? value : item,
            ),
          };

          validateOnChange && validateValues(newState);

          return newState;
        });
      },
      setFieldValue: <K extends keyof T, A extends T[K]>(
        name: K,
        key: keyof TCheckArray<A>,
        value:
          | ((state: T) => TCheckArray<A>[keyof TCheckArray<A>])
          | TCheckArray<A>[keyof TCheckArray<A>],
        index: number,
        touch?: boolean,
      ) => {
        setValues(state => {
          state[name] = ((state[name] as any) || []).map(
            (item: any, ind: number) =>
              ind === +index
                ? {
                    ...item,
                    [key]:
                      typeof value === "function"
                        ? (
                            value as (
                              state: T,
                            ) => TCheckArray<A>[keyof TCheckArray<A>]
                          )(state)
                        : value,
                  }
                : item,
          );
          let newValues = state;

          if (
            (watch && watch.some(item => item === name || item === key)) ||
            !watch
          ) {
            newValues = {
              ...state,
            };
          }

          validateOnChange && validateValues(newValues);

          return newValues;
        });
        !touchedValues[name] &&
          touch &&
          setTouchedValues(state => ({
            ...state,
            [`${name}[${index}].${key}`]: true,
          }));
      },
      setFieldBlur: <K extends keyof T, A extends T[K]>(
        name: K,
        key: keyof TCheckArray<A>,
        index: number,
      ) => {
        !touchedValues[name] &&
          setTouchedValues(state => ({
            ...state,
            [`${name}[${index}].${key}`]: true,
          }));
      },
    }),
    [touchedValues, validateOnChange, validateValues, watch],
  );

  const fieldsIterate = useCallback(
    <A extends TCheckArray<T[B]>, B extends keyof T>(
      name: B,
      fields: (val: {
        value: A;
        touched: Partial<{ [key in keyof A]: boolean }>;
        error: Partial<{ [key in keyof A]: string }>;
        fieldNames: { [key in keyof A]: string };
        fieldsHelper: typeof fieldsHelper;
        index: number;
        array: A[];
      }) => JSX.Element,
    ) =>
      ((values[name] as any) || []).map(
        (value: A, index: number, array: A[]) => {
          const touched: Partial<{ [key in keyof A]: boolean }> = {};
          const error: Partial<{ [key in keyof A]: string }> = {};
          const fieldNames: { [key in keyof A]: string } = {} as {
            [key in keyof A]: string;
          };

          Object.keys(value).forEach(item => {
            fieldNames[item as keyof A] = item;
            touched[item as keyof A] =
              touchedValues[`${name}[${index}].${item}`];
            error[item as keyof A] = errors[`${name}[${index}].${item}`];
          });

          return fields({
            fieldsHelper,
            value,
            index,
            touched,
            error,
            fieldNames,
            array,
          });
        },
      ),
    [values, fieldsHelper, touchedValues, errors],
  );

  const handleClearForm = useCallback(
    (data: T | void) => {
      const newValues = data ? { ...data } : { ...initialValues };

      setValues(newValues);
      setErrors({});
      const newTouchedValues = {};

      setTouchedValues(newTouchedValues);
    },
    [initialValues],
  );

  const setFieldValue = useCallback(
    (
      name: keyof T,
      value: ((state: T) => T[keyof T]) | T[keyof T],
      touch?: boolean,
    ) => {
      setValues(state => {
        state[name] =
          typeof value === "function"
            ? (value as (state: T) => T[keyof T])(state)
            : value;
        let newValues = state;

        if ((watch && watch.some(item => item === name)) || !watch) {
          newValues = {
            ...state,
          };
        }

        validateOnChange && validateValues(newValues);

        return newValues;
      });
      !touchedValues[name] &&
        touch &&
        setTouchedValues(state => ({
          ...state,
          [name]: true,
        }));
    },
    [touchedValues, watch, validateOnChange, validateValues],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<any>) => {
      const { target } = event;
      const { name } = target;

      if (name && !touchedValues[name]) {
        setTouchedValues(state => ({
          ...state,
          [name]: true,
        }));
        validateOnChange && validateValues(values);
      }
    },
    [touchedValues, validateOnChange, validateValues, values],
  );

  const setFieldBlur = useCallback(
    (name: keyof T | string) => {
      if (name && !touchedValues[name]) {
        setTouchedValues(state => ({
          ...state,
          [name]: true,
        }));
        validateOnChange && validateValues(values);
      }
    },
    [touchedValues, validateOnChange, validateValues, values],
  );

  const valid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const validateForm = useCallback(async () => {
    const { count, errors, hasErrors } = await validateValues(values);

    const keys = Object.keys(errors);

    keys.forEach(key => {
      setTouchedValues(state => ({
        ...state,
        [key]: true,
      }));
    });

    return Promise.resolve({ count, errors, hasErrors });
  }, [validateValues, values]);

  const setMeta = useCallback(
    (name: keyof M, value: ((state: M) => M[keyof M]) | M[keyof M]) => {
      changeMeta(state => ({
        ...state,
        [name]: typeof value === "function" ? (value as any)(state) : value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (params?: any) => {
      if (!params?.withoutValidate) {
        validateValues(values, ({}, e) => {
          setTouchedValues(() =>
            (Object.keys(values) as (keyof T)[]).reduce((acc, el) => {
              const field = values[el] as any;

              if (
                Array.isArray(field) &&
                field[0] &&
                typeof field[0] === "object" &&
                !Array.isArray(field[0])
              ) {
                const obj: any = {};

                field.forEach((val, ind) => {
                  Object.keys(val).forEach(key => {
                    obj[`${el}[${ind}].${key}`] = true;
                  });
                });

                return {
                  ...acc,
                  ...obj,
                };
              }

              return {
                ...acc,
                [el]: true,
              };
            }, {}),
          );

          Object.keys({ ...e }).length === 0 &&
            onSubmit &&
            onSubmit(values, meta, {
              dirty,
              valid,
              values,
              meta,
              touchedValues,
              errors,
              fieldNames,
              onSetValues,
              handleBlur,
              setMeta,
              setFieldValue,
              setFieldBlur,
              handleSubmit,
              fieldsIterate,
              fieldsHelper,
              handleClearForm,
              validateForm,
            });
        })
          .then()
          .catch();
      } else {
        onSubmit &&
          onSubmit(values, meta, {
            dirty,
            valid,
            values,
            meta,
            touchedValues,
            errors,
            fieldNames,
            onSetValues,
            handleBlur,
            setMeta,
            setFieldValue,
            setFieldBlur,
            handleSubmit,
            fieldsIterate,
            fieldsHelper,
            handleClearForm,
            validateForm,
          });
      }
    },
    [
      validateValues,
      values,
      onSubmit,
      meta,
      dirty,
      valid,
      touchedValues,
      errors,
      fieldNames,
      onSetValues,
      handleBlur,
      setMeta,
      setFieldValue,
      setFieldBlur,
      fieldsIterate,
      fieldsHelper,
      handleClearForm,
      validateForm,
    ],
  );

  return {
    dirty,
    valid,
    values,
    meta,
    touchedValues,
    errors,
    fieldNames,
    onSetValues,
    handleBlur,
    setMeta,
    setFieldValue,
    setFieldBlur,
    handleSubmit,
    fieldsIterate,
    fieldsHelper,
    handleClearForm,
    validateForm,
  };
};

type TCheckArray<T> = T extends any[] ? T[number] : T;
type TObjectPartial<T> = T extends object ? Partial<T> : T;

type SubType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;

interface IUseForm<
  T,
  M extends { [key: string]: any } = { [key: string]: any },
> {
  initialValues: T;
  initialMeta?: M & { [key: string]: any };
  onChange?: (
    values: T,
    meta: M,
    errors: Partial<Record<keyof T | string, string>>,
  ) => void;
  onSubmit?: (values: T, meta: M, data: IForm<T, M>) => void;
  validate?: (values: T, meta: M) => Partial<Record<keyof T | string, string>>;
  validateSchema?: ObjectSchema<
    Shape<object | undefined, Partial<Record<keyof T, any>>>,
    object
  >;
  validateOnInit?: boolean;
  validateOnChange?: boolean;
  enableReinitialize?: boolean;
}

export interface IFieldsHelper<T> {
  remove: (name: keyof SubType<T, Array<any>>, index: number) => void;
  append: <K extends keyof SubType<T, Array<any>>>(
    name: K,
    value: TObjectPartial<TCheckArray<T[K]>>,
  ) => void;
  replace: <K extends keyof SubType<T, Array<any>>>(
    name: K,
    index: number,
    value: TObjectPartial<TCheckArray<T[K]>>,
  ) => void;
  setFieldValue: <K extends keyof SubType<T, Array<any>>, A extends T[K]>(
    name: K,
    key: keyof TCheckArray<A>,
    value:
      | ((state: T) => TCheckArray<A>[keyof TCheckArray<A>])
      | TCheckArray<A>[keyof TCheckArray<A>],
    index: number,
    touch?: boolean,
  ) => void;
  setFieldBlur: <K extends keyof SubType<T, Array<any>>, A extends T[K]>(
    name: K,
    key: keyof TCheckArray<A>,
    index: number,
  ) => void;
}

export interface IForm<
  T,
  M extends { [key: string]: any } = { [key: string]: any },
> {
  dirty: boolean;
  valid: boolean;
  values: T;
  meta: M & { [key: string]: any };
  touchedValues: Partial<Record<keyof T | string, boolean>>;
  errors: Partial<Record<keyof T | string, string>>;
  fieldNames: Record<keyof T, string>;
  onSetValues: (values: T) => void;
  handleBlur: (event: React.FocusEvent<any>) => void;
  setMeta: (
    name: keyof M,
    value: ((state: M) => M[keyof M]) | M[keyof M],
  ) => void;
  setFieldValue: (
    name: keyof T,
    value: ((state: T) => T[keyof T]) | T[keyof T],
    touch?: boolean,
  ) => void;
  setFieldBlur: (name: keyof T | string) => void;
  handleSubmit: (params: { withoutValidate: boolean } | void) => void;
  fieldsIterate: <
    A extends TCheckArray<T[B]>,
    B extends keyof SubType<T, Array<any>>,
  >(
    name: B,
    fields: (val: {
      value: A;
      touched: Partial<{ [key in keyof A]: boolean }>;
      error: Partial<{ [key in keyof A]: string }>;
      fieldNames: { [key in keyof A]: string };
      fieldsHelper: IFieldsHelper<T>;
      index: number;
      array: A[];
    }) => JSX.Element,
  ) => JSX.Element[];
  fieldsHelper: IFieldsHelper<T>;
  handleClearForm: (values: T | void) => void;
  validateForm: () => Promise<{
    hasErrors: boolean;
    count: number;
    errors: Partial<Record<keyof T | string, string>>;
  }>;
}
