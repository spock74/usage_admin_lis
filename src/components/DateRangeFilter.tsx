import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

// Configurar locale do dayjs
dayjs.locale("pt-br");

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) => {
  console.log("DateRangeFilter - Props:", { startDate, endDate });

  const handleStartDateChange = (value: dayjs.Dayjs | null) => {
    console.log("DateRangeFilter - Start Date Changed:", value);
    onStartDateChange(value?.toDate() || null);
  };

  const handleEndDateChange = (value: dayjs.Dayjs | null) => {
    console.log("DateRangeFilter - End Date Changed:", value);
    onEndDateChange(value?.toDate() || null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Stack direction="row" spacing={2}>
        <DatePicker
          label="Data Inicial"
          value={startDate ? dayjs(startDate) : null}
          onChange={handleStartDateChange}
          maxDate={endDate ? dayjs(endDate) : undefined}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              sx: {
                bgcolor: "background.paper",
                "& .MuiInputBase-root": {
                  borderRadius: 1,
                },
              },
            },
          }}
        />
        <DatePicker
          label="Data Final"
          value={endDate ? dayjs(endDate) : null}
          onChange={handleEndDateChange}
          minDate={startDate ? dayjs(startDate) : undefined}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              sx: {
                bgcolor: "background.paper",
                "& .MuiInputBase-root": {
                  borderRadius: 1,
                },
              },
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
};
