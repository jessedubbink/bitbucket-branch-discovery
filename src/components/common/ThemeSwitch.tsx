import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  const handleChange = (checked: boolean) => {
    setIsDark(checked);
    setTheme(checked ? "dark" : "light");
  };

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <Sun className="w-4 h-4 text-yellow-500" />
      <Switch checked={isDark} onCheckedChange={handleChange} />
      <Moon className="w-4 h-4 text-blue-500" />
    </div>
  );
}