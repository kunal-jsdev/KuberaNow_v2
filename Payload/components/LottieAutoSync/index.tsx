'use client';

import { type FC, useEffect, useRef } from 'react';

import { useField } from '@payloadcms/ui';

export const LottieAutoSync: FC = () => {
  const { value: desktopValue, setValue: setDesktopValue } = useField<unknown>({
    path: 'desktopLottieJson',
  });
  const { value: mobileValue, setValue: setMobileValue } = useField<unknown>({
    path: 'mobileLottieJson',
  });

  const prevDesktopRef = useRef<unknown>(desktopValue);
  const prevMobileRef = useRef<unknown>(mobileValue);
  const mobileCustomizedRef = useRef<boolean>(Boolean(mobileValue));
  const desktopCustomizedRef = useRef<boolean>(Boolean(desktopValue));

  useEffect(() => {
    const prevDesktop = prevDesktopRef.current;
    prevDesktopRef.current = desktopValue;

    if (!prevDesktop && desktopValue) {
      desktopCustomizedRef.current = true;
      if (!mobileValue && !mobileCustomizedRef.current) {
        setMobileValue(desktopValue);
      }
    } else if (prevDesktop && !desktopValue) {
      desktopCustomizedRef.current = true;
    }
  }, [desktopValue, mobileValue, setMobileValue]);

  useEffect(() => {
    const prevMobile = prevMobileRef.current;
    prevMobileRef.current = mobileValue;

    if (!prevMobile && mobileValue) {
      mobileCustomizedRef.current = true;
      if (!desktopValue && !desktopCustomizedRef.current) {
        setDesktopValue(mobileValue);
      }
    } else if (prevMobile && !mobileValue) {
      mobileCustomizedRef.current = true;
    }
  }, [mobileValue, desktopValue, setDesktopValue]);

  return null;
};

export default LottieAutoSync;
