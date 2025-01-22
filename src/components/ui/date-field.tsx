import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  date?: Date;
  onChange?: (date?: Date) => void;
  disabled: boolean;
  id: string;
}

export default function DateField({
  date,
  onChange,
  disabled,
}: DateFieldProps) {
  const { t } = useTranslation();

  const year = date ? date.getFullYear().toString() : "";
  const month = date ? (date.getMonth() + 1).toString().padStart(2, "0") : "";
  const day = date ? date.getDate().toString().padStart(2, "0") : "";

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value;
    if (newDay.length > 0 && onChange) {
      const updatedDate = new Date(
        parseInt(year || "1900", 10),
        (parseInt(month || "01", 10) || 1) - 1,
        parseInt(newDay, 10) || 1,
      );
      onChange(updatedDate);
    }

    const dayValue = parseInt(newDay, 10);
    if (newDay.length <= 2 && dayValue >= 1 && dayValue <= 31) {
      document.getElementById("dob-month-input")?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    if (onChange) {
      const updatedDate = new Date(
        parseInt(year, 10) || 0,
        (parseInt(newMonth, 10) || 1) - 1,
        parseInt(day, 10) || 1,
      );
      onChange(updatedDate);
    }

    const monthValue = parseInt(newMonth, 10);
    if (newMonth.length <= 2 && monthValue >= 1 && monthValue <= 12) {
      document.getElementById("dob-year-input")?.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    if (onChange) {
      const updatedDate = new Date(
        parseInt(newYear, 10) || 0,
        (parseInt(month, 10) || 1) - 1,
        parseInt(day, 10) || 1,
      );
      onChange(updatedDate);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1">
        <Label>{t("day")}</Label>
        <Input
          type="number"
          placeholder="DD"
          value={day}
          onChange={handleDayChange}
          disabled={disabled}
          min={1}
          max={31}
          id="dob-day-input"
          className="w-[10rem]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t("month")}</Label>
        <Input
          type="number"
          placeholder="MM"
          value={month}
          onChange={handleMonthChange}
          disabled={disabled}
          min={1}
          max={12}
          id="dob-month-input"
          className="w-[10rem]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t("year")}</Label>
        <Input
          type="number"
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          disabled={disabled}
          min={1900}
          max={2100}
          id="dob-year-input"
          className="w-[10rem]"
        />
      </div>
    </div>
  );
}
