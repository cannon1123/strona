import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "blue" | "purple" | "red";
type AccentColor = "blue" | "purple" | "red" | "green" | "yellow";

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, user }: { children: React.ReactNode; user?: any }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || user?.theme || "dark";
    }
    return user?.theme || "dark";
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("accentColor") as AccentColor) || user?.accentColor || "blue";
    }
    return user?.accentColor || "blue";
  });

  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme);
    }
    if (user?.accentColor && user.accentColor !== accentColor) {
      setAccentColor(user.accentColor);
    }
  }, [user?.theme, user?.accentColor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("theme", theme);
    localStorage.setItem("accentColor", accentColor);

    // Remove all theme classes
    const root = document.documentElement;
    root.classList.remove("dark", "light", "theme-blue", "theme-purple", "theme-red");

    // Add current theme
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme !== "light") {
      root.classList.add(`theme-${theme}`);
    }

    // Update CSS custom properties for colors
    const themeColors = {
      dark: {
        "--background": "224 71% 4%",
        "--foreground": "213 31% 91%",
        "--primary": "210 40% 98%",
        "--primary-foreground": "222.2 47.4% 11.2%",
        "--secondary": "215 27.9% 16.9%",
        "--secondary-foreground": "210 40% 98%",
        "--muted": "215 27.9% 16.9%",
        "--muted-foreground": "217.9 10.6% 64.9%",
        "--accent": "215 27.9% 16.9%",
        "--accent-foreground": "210 40% 98%",
        "--card": "224 71% 4%",
        "--card-foreground": "213 31% 91%",
        "--border": "215 27.9% 16.9%",
        "--input": "215 27.9% 16.9%",
      },
      light: {
        "--background": "0 0% 100%",
        "--foreground": "222.2 47.4% 11.2%",
        "--primary": "222.2 47.4% 11.2%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "210 40% 96%",
        "--secondary-foreground": "222.2 47.4% 11.2%",
        "--muted": "210 40% 96%",
        "--muted-foreground": "215.4 16.3% 46.9%",
        "--accent": "210 40% 96%",
        "--accent-foreground": "222.2 47.4% 11.2%",
        "--card": "0 0% 100%",
        "--card-foreground": "222.2 47.4% 11.2%",
        "--border": "214.3 31.8% 91.4%",
        "--input": "214.3 31.8% 91.4%",
      },
      blue: {
        "--background": "221 39% 11%",
        "--foreground": "213 31% 91%",
        "--primary": "217 91% 60%",
        "--primary-foreground": "222.2 47.4% 1.2%",
        "--secondary": "215 25% 27%",
        "--secondary-foreground": "210 40% 98%",
        "--muted": "215 25% 27%",
        "--muted-foreground": "217.9 10.6% 64.9%",
        "--accent": "215 25% 27%",
        "--accent-foreground": "210 40% 98%",
        "--card": "221 39% 11%",
        "--card-foreground": "213 31% 91%",
        "--border": "215 25% 27%",
        "--input": "215 25% 27%",
      },
      purple: {
        "--background": "263 70% 7%",
        "--foreground": "253 31% 91%",
        "--primary": "263 70% 50%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "262 30% 25%",
        "--secondary-foreground": "210 40% 98%",
        "--muted": "262 30% 25%",
        "--muted-foreground": "264 10% 64.9%",
        "--accent": "262 30% 25%",
        "--accent-foreground": "210 40% 98%",
        "--card": "263 70% 7%",
        "--card-foreground": "253 31% 91%",
        "--border": "262 30% 25%",
        "--input": "262 30% 25%",
      },
      red: {
        "--background": "0 63% 8%",
        "--foreground": "10 31% 91%",
        "--primary": "0 72% 51%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "0 30% 25%",
        "--secondary-foreground": "210 40% 98%",
        "--muted": "0 30% 25%",
        "--muted-foreground": "10 10% 64.9%",
        "--accent": "0 30% 25%",
        "--accent-foreground": "210 40% 98%",
        "--card": "0 63% 8%",
        "--card-foreground": "10 31% 91%",
        "--border": "0 30% 25%",
        "--input": "0 30% 25%",
      },
    };

    const colors = themeColors[theme];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set accent color
    const accentColorValues = {
      blue: "217 91% 60%",
      purple: "263 70% 50%",
      red: "0 72% 51%",
      green: "142 69% 58%",
      yellow: "48 96% 53%",
    };
    
    root.style.setProperty("--accent-color", accentColorValues[accentColor]);
  }, [theme, accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values instead of throwing error
    return {
      theme: "dark" as Theme,
      accentColor: "blue" as AccentColor,
      setTheme: () => {},
      setAccentColor: () => {},
    };
  }
  return context;
}