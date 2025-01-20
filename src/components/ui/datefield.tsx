import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function DateField({ value = "", onChange }: DateFieldProps) {
  const [year, month, day] = value.split("-");
  const { t } = useTranslation();

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value;
    if (onChange) {
      onChange(`${year || ""}-${month || ""}-${newDay}`);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    if (onChange) {
      onChange(`${year || ""}-${newMonth}-${day || ""}`);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    if (onChange) {
      onChange(`${newYear}-${month || ""}-${day || ""}`);
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
          data-cy="dob-day-input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t("month")}</Label>
        <Input
          type="number"
          placeholder="MM"
          value={month}
          onChange={handleMonthChange}
          data-cy="dob-month-input"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t("year")}</Label>
        <Input
          type="number"
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          data-cy="dob-year-input"
        />
      </div>
    </div>
  );
}
