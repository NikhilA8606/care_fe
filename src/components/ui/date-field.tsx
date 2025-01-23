import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  date?: Date;
  onChange?: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
  id: string;
}

export default function DateField({
  date,
  onChange,
  disabled,
  id,
}: DateFieldProps) {
  const { t } = useTranslation();

  const [day, setDay] = useState(
    date ? date.getDate().toString().padStart(2, "0") : "",
  );
  const [month, setMonth] = useState(
    date ? (date.getMonth() + 1).toString().padStart(2, "0") : "",
  );
  const [year, setYear] = useState(date ? date.getFullYear().toString() : "");

  const isValidDate = (year: string, month: string, day: string): boolean => {
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10) - 1;
    const parsedDay = parseInt(day, 10);
    const testDate = new Date(parsedYear, parsedMonth, parsedDay);
    return (
      !isNaN(testDate.getTime()) &&
      testDate.getFullYear() === parsedYear &&
      testDate.getMonth() === parsedMonth &&
      testDate.getDate() === parsedDay
    );
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value;
    setDay(newDay);

    if (
      newDay.length === 2 &&
      parseInt(newDay, 10) >= 1 &&
      parseInt(newDay, 10) <= 31
    ) {
      if (isValidDate(year, month, newDay) && onChange) {
        const updatedDate = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(newDay, 10),
        );
        onChange(updatedDate);
      }
      document.getElementById(`${id}-month-input`)?.focus();
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setMonth(newMonth);

    if (
      newMonth.length === 2 &&
      parseInt(newMonth, 10) >= 1 &&
      parseInt(newMonth, 10) <= 12
    ) {
      if (isValidDate(year, newMonth, day) && onChange) {
        const updatedDate = new Date(
          parseInt(year, 10),
          parseInt(newMonth, 10) - 1,
          parseInt(day, 10),
        );
        onChange(updatedDate);
      }

      document.getElementById(`${id}-year-input`)?.focus();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    setYear(newYear);

    if (newYear.length === 4 && parseInt(newYear, 10) >= 1900) {
      if (isValidDate(newYear, month, day) && onChange) {
        const updatedDate = new Date(
          parseInt(newYear, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
        );
        onChange(updatedDate);
      }
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
          min={1}
          max={31}
          id={`${id}-day-input`}
          className="w-[10rem]"
          disabled={disabled ? disabled(new Date()) : false}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t("month")}</Label>
        <Input
          type="number"
          placeholder="MM"
          value={month}
          onChange={handleMonthChange}
          min={1}
          max={12}
          id={`${id}-month-input`}
          className="w-[10rem]"
          disabled={disabled ? disabled(new Date()) : false}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t("year")}</Label>
        <Input
          type="number"
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          max={2100}
          id={`${id}-year-input`}
          className="w-[10rem]"
          disabled={disabled ? disabled(new Date()) : false}
        />
      </div>
    </div>
  );
}