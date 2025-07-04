
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Tone = 'Neutral' | 'GenZ' | 'Professional' | 'Mindful';

interface ToneContextType {
  tone: Tone;
  setTone: (tone: Tone) => void;
  tones: Tone[];
}

const ToneContext = createContext<ToneContextType | undefined>(undefined);

export const ToneContextProvider = ({ children }: { children: ReactNode }) => {
  const [tone, setToneState] = useState<Tone>('Neutral');
  const tones: Tone[] = ['Neutral', 'GenZ', 'Professional', 'Mindful'];

  useEffect(() => {
    try {
        const storedTone = localStorage.getItem('reva-tone') as Tone | null;
        if (storedTone && tones.includes(storedTone)) {
          setToneState(storedTone);
        }
    } catch (error) {
        console.warn('Could not access localStorage for tone.', error);
    }
  }, []);

  const setTone = (newTone: Tone) => {
    if (tones.includes(newTone)) {
        try {
            localStorage.setItem('reva-tone', newTone);
        } catch (error) {
            console.warn('Could not access localStorage for tone.', error);
        }
      setToneState(newTone);
    }
  };

  const value = {
    tone,
    setTone,
    tones,
  };

  return <ToneContext.Provider value={value}>{children}</ToneContext.Provider>;
};

export const useToneContext = () => {
  const context = useContext(ToneContext);
  if (context === undefined) {
    throw new Error('useToneContext must be used within a ToneContextProvider');
  }
  return context;
};
