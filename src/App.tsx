import {
  ThemeProvider,
  CssBaseline,
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { DateRangeFilter } from "./components/DateRangeFilter";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  getTokenUsage,
  getTokenUsageSummary,
  TokenUsage,
  TokenUsageSummary,
} from "./services/tokenUsageService";
import dayjs from "dayjs";
import axios from "axios";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

function App() {
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [userId, setUserId] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [summary, setSummary] = useState<TokenUsageSummary | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [displayType, setDisplayType] = useState<"tokens" | "cost">("tokens");
  const [showToast, setShowToast] = useState(false);
  const [groupingType, setGroupingType] = useState<"grouped" | "byQuestion">(
    "grouped"
  );
  const [invalidUserId, setInvalidUserId] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                primary: {
                  main: "#90caf9",
                },
                secondary: {
                  main: "#ce93d8",
                },
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
              }
            : {
                primary: {
                  main: "#1976d2",
                },
                secondary: {
                  main: "#9c27b0",
                },
                background: {
                  default: "#f5f5f5",
                  paper: "#ffffff",
                },
              }),
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Carregar dados iniciais
  useEffect(() => {
    console.log("App montado - Carregando dados iniciais...");
    loadData();
  }, []);

  const handleStartDateChange = (date: Date | null) => {
    console.log("Data inicial alterada:", date);
    setDateRange((prev) => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = (date: Date | null) => {
    console.log("Data final alterada:", date);
    setDateRange((prev) => ({ ...prev, endDate: date }));
  };

  const loadData = async () => {
    setLoading(true);
    console.log("Iniciando carregamento de dados...");
    console.log("Estado atual:", {
      dateRange,
      userId,
      assistantId,
      loading,
      tokenUsage: tokenUsage.length,
      summary,
    });

    // Se há um userId mas ele é inválido, não carrega dados
    if (userId && invalidUserId) {
      setLoading(false);
      setShowErrorToast(true);
      return;
    }

    try {
      const [usageData, summaryData] = await Promise.all([
        getTokenUsage({
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
          userId: userId || undefined,
          assistantId: assistantId || undefined,
        }),
        getTokenUsageSummary({
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
          userId: userId || undefined,
          assistantId: assistantId || undefined,
        }),
      ]);

      console.log("Dados recebidos:", {
        usageData: {
          length: usageData.length,
          first: usageData[0],
          last: usageData[usageData.length - 1],
        },
        summaryData,
      });

      setTokenUsage(usageData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      if (error instanceof Error) {
        console.error("Detalhes do erro:", error.message);
      }
      if (axios.isAxiosError(error)) {
        console.error("Erro da API:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    alert("Botão APLICAR clicado!");
    console.log("=== TESTE DE CLIQUE ===");
    console.log("Botão APLICAR foi clicado");
    console.log("Estado atual:", {
      dateRange,
      userId,
      assistantId,
    });
    console.log("=====================");
    loadData();
  };

  const handleClear = () => {
    setUserId("");
    setAssistantId("");
    setDateRange({ startDate: null, endDate: null });
    setTokenUsage([]);
    setSummary(null);
  };

  // Dados para o gráfico
  const chartData = useMemo(() => {
    if (groupingType === "byQuestion") {
      // Sem agrupamento, usar dados diretos com formatação
      return tokenUsage
        .map((usage) => {
          const inputCost = (usage.prompt_tokens * 0.15) / 1000000;
          const outputCost = (usage.completion_tokens * 0.6) / 1000000;
          const totalCost = inputCost + outputCost;

          return {
            date: dayjs(usage.created_at).format("DD/MM/YYYY HH:mm"),
            user_id: usage.user_id,
            question: usage.question,
            // Dados de tokens
            prompt: usage.prompt_tokens,
            completion: usage.completion_tokens,
            total: usage.total_tokens,
            stackedInput: usage.prompt_tokens,
            stackedOutput: usage.completion_tokens,
            // Dados de custo
            promptCost: inputCost,
            completionCost: outputCost,
            totalCost: totalCost,
            stackedInputCost: inputCost,
            stackedOutputCost: outputCost,
          };
        })
        .sort(
          (a, b) =>
            dayjs(a.date, "DD/MM/YYYY HH:mm").valueOf() -
            dayjs(b.date, "DD/MM/YYYY HH:mm").valueOf()
        );
    }

    // Agrupamento por dia e usuário (código existente)
    const groupedData = tokenUsage.reduce(
      (acc, usage) => {
        const date = dayjs(usage.created_at).format("DD/MM/YYYY");
        const key = `${date}_${usage.user_id}`;

        if (!acc[key]) {
          acc[key] = {
            date,
            user_id: usage.user_id,
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          };
        }

        acc[key].prompt_tokens += usage.prompt_tokens;
        acc[key].completion_tokens += usage.completion_tokens;
        acc[key].total_tokens += usage.total_tokens;

        return acc;
      },
      {} as Record<
        string,
        {
          date: string;
          user_id: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        }
      >
    );

    return Object.values(groupedData)
      .map((usage) => {
        const inputCost = (usage.prompt_tokens * 0.15) / 1000000;
        const outputCost = (usage.completion_tokens * 0.6) / 1000000;
        const totalCost = inputCost + outputCost;

        return {
          date: usage.date,
          user_id: usage.user_id,
          // Dados de tokens
          prompt: usage.prompt_tokens,
          completion: usage.completion_tokens,
          total: usage.total_tokens,
          stackedInput: usage.prompt_tokens,
          stackedOutput: usage.completion_tokens,
          // Dados de custo
          promptCost: inputCost,
          completionCost: outputCost,
          totalCost: totalCost,
          stackedInputCost: inputCost,
          stackedOutputCost: outputCost,
        };
      })
      .sort(
        (a, b) =>
          dayjs(a.date, "DD/MM/YYYY").valueOf() -
          dayjs(b.date, "DD/MM/YYYY").valueOf()
      );
  }, [tokenUsage, groupingType]);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);

    // Validar ID do usuário (exemplo: deve ter pelo menos 5 caracteres e ser alfanumérico)
    const isValid = /^[a-zA-Z0-9]{5,}$/.test(value);
    if (value && !isValid) {
      setInvalidUserId(true);
      setShowErrorToast(true);
    } else {
      setInvalidUserId(false);
      setShowErrorToast(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Visualização de Consumo
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="ID do Usuário"
              value={userId}
              onChange={handleUserIdChange}
              size="small"
              error={invalidUserId}
              sx={{
                bgcolor: "background.paper",
                "& input": {
                  color: invalidUserId ? "error.main" : "inherit",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="ID do Assistente"
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              size="small"
              sx={{ bgcolor: "background.paper" }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, newValue) => newValue && setChartType(newValue)}
                aria-label="tipo de gráfico"
                size="small"
              >
                <ToggleButton value="line" aria-label="gráfico de linhas">
                  Linhas
                </ToggleButton>
                <ToggleButton value="bar" aria-label="gráfico de barras">
                  Barras
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={displayType}
                exclusive
                onChange={(_, newValue) => newValue && setDisplayType(newValue)}
                aria-label="tipo de visualização"
                size="small"
              >
                <ToggleButton value="tokens" aria-label="visualizar tokens">
                  Tokens
                </ToggleButton>
                <ToggleButton value="cost" aria-label="visualizar custo">
                  Custo
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApply}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "APLICAR"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClear}
                disabled={loading}
              >
                LIMPAR
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6">
                {displayType === "tokens"
                  ? "Tokens de Entrada"
                  : "Custo de Entrada"}
              </Typography>
              <Typography variant="h3">
                {displayType === "tokens"
                  ? (summary?.total_prompt_tokens || 0).toLocaleString()
                  : (
                      ((summary?.total_prompt_tokens || 0) * 0.15) /
                      1000000
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "USD",
                    })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6">
                {displayType === "tokens"
                  ? "Tokens de Saída"
                  : "Custo de Saída"}
              </Typography>
              <Typography variant="h3">
                {displayType === "tokens"
                  ? (summary?.total_completion_tokens || 0).toLocaleString()
                  : (
                      ((summary?.total_completion_tokens || 0) * 0.6) /
                      1000000
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "USD",
                    })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6">
                {displayType === "tokens" ? "Total de Tokens" : "Custo Total"}
              </Typography>
              <Typography variant="h3">
                {displayType === "tokens"
                  ? (summary?.total_tokens || 0).toLocaleString()
                  : (
                      ((summary?.total_prompt_tokens || 0) * 0.15) / 1000000 +
                      ((summary?.total_completion_tokens || 0) * 0.6) / 1000000
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "USD",
                    })}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
            >
              <Tab label="GRÁFICO" />
              <Tab label="LISTA" />
            </Tabs>

            <ToggleButtonGroup
              value={groupingType}
              exclusive
              onChange={(_, newValue) => newValue && setGroupingType(newValue)}
              aria-label="tipo de agrupamento"
              size="small"
            >
              <ToggleButton value="grouped" aria-label="agrupar por dia">
                Agrupar
              </ToggleButton>
              <ToggleButton value="byQuestion" aria-label="por questão">
                Por Questão
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {activeTab === 0 && (
            <Box sx={{ height: 400, p: 2 }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={
                          displayType === "tokens" ? "prompt" : "promptCost"
                        }
                        name={
                          displayType === "tokens"
                            ? "Tokens de Entrada"
                            : "Custo de Entrada"
                        }
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey={
                          displayType === "tokens"
                            ? "completion"
                            : "completionCost"
                        }
                        name={
                          displayType === "tokens"
                            ? "Tokens de Saída"
                            : "Custo de Saída"
                        }
                        stroke="#82ca9d"
                      />
                      <Line
                        type="monotone"
                        dataKey={
                          displayType === "tokens" ? "total" : "totalCost"
                        }
                        name={
                          displayType === "tokens"
                            ? "Total de Tokens"
                            : "Custo Total"
                        }
                        stroke="#ffc658"
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey={
                          displayType === "tokens"
                            ? "stackedOutput"
                            : "stackedOutputCost"
                        }
                        name={
                          displayType === "tokens"
                            ? "Tokens de Saída"
                            : "Custo de Saída"
                        }
                        stackId="a"
                        fill="#82ca9d"
                      />
                      <Bar
                        dataKey={
                          displayType === "tokens"
                            ? "stackedInput"
                            : "stackedInputCost"
                        }
                        name={
                          displayType === "tokens"
                            ? "Tokens de Entrada"
                            : "Custo de Entrada"
                        }
                        stackId="a"
                        fill="#8884d8"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ p: 2 }} color="text.secondary" align="center">
                  Nenhum dado disponível para exibição
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Usuário</TableCell>
                    {groupingType === "byQuestion" && (
                      <TableCell>Questão</TableCell>
                    )}
                    <TableCell align="right">
                      {displayType === "tokens"
                        ? "Tokens Entrada"
                        : "Custo Entrada"}
                    </TableCell>
                    <TableCell align="right">
                      {displayType === "tokens"
                        ? "Tokens Saída"
                        : "Custo Saída"}
                    </TableCell>
                    <TableCell align="right">
                      {displayType === "tokens"
                        ? "Total Tokens"
                        : "Custo Total"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={groupingType === "byQuestion" ? 6 : 5}
                        align="center"
                      >
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : chartData.length > 0 ? (
                    chartData.map((data, index) => (
                      <TableRow key={`${data.date}_${data.user_id}_${index}`}>
                        <TableCell>{data.date}</TableCell>
                        <TableCell>{data.user_id}</TableCell>
                        {groupingType === "byQuestion" && (
                          <TableCell>{data.question}</TableCell>
                        )}
                        <TableCell align="right">
                          {displayType === "tokens"
                            ? data.prompt.toLocaleString()
                            : data.promptCost.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "USD",
                              })}
                        </TableCell>
                        <TableCell align="right">
                          {displayType === "tokens"
                            ? data.completion.toLocaleString()
                            : data.completionCost.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "USD",
                              })}
                        </TableCell>
                        <TableCell align="right">
                          {displayType === "tokens"
                            ? data.total.toLocaleString()
                            : data.totalCost.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "USD",
                              })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={groupingType === "byQuestion" ? 6 : 5}
                        align="center"
                      >
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Snackbar
          open={showToast}
          autoHideDuration={6000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowToast(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Selecione um ID de assistente para o usuário
          </Alert>
        </Snackbar>

        <Snackbar
          open={showErrorToast}
          autoHideDuration={6000}
          onClose={() => setShowErrorToast(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowErrorToast(false)}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            ID do usuário inválido. Use pelo menos 5 caracteres alfanuméricos.
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
