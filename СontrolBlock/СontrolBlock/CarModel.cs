using System;
using System.Threading.Tasks;
using Newtonsoft.Json;
using СontrolBlock;

namespace ControlBlock
{
    public class CarModel
    {
        private readonly WebSocketServerManager webSocketServer;

        public double Speed { get; private set; }
        public double Temperature { get; private set; }
        public double Mileage { get; private set; } = 0;
        public double FuelLevel { get; private set; }
        public double Voltage { get; private set; }
        public double RPM { get; private set; }

        public bool EngineRunning => engineRunning;
        public event Action<string>? GearChanged;

        private readonly string[] gears = { "N", "1", "2", "3", "4", "5" };
        private int gearIndex = 0;
        private string CurrentGear => gears[gearIndex];
        private double transmissionRatio;

        private bool isGasPressed = false;
        private bool isBraking = false;
        private bool engineRunning = false;

        private double lastSpeedSent = -1;
        private double lastRPMSent = -1;

        private const double TyreCircumference = 2.0;
        private const double FinalDrive = 4.13;

        public CarModel(WebSocketServerManager wsServer)
        {
            webSocketServer = wsServer;
            RPM = 0;
            Speed = 0;
            transmissionRatio = GetGearRatio(CurrentGear);
        }

        // Плавный запуск двигателя с прогревом температуры, топлива и напряжения
        public async Task StartEngine(double targetTemp, double targetFuel, double targetVoltage)
        {
            Program.Log("Запуск двигателя");
            engineRunning = true;

            double temp = 0;
            double fuel = 0;
            double voltage = 0;

            while (temp < targetTemp || fuel < targetFuel || voltage < targetVoltage)
            {
                if (temp < targetTemp)
                    Temperature = temp = Math.Min(temp + 1, targetTemp);
                if (fuel < targetFuel)
                    FuelLevel = fuel = Math.Min(fuel + 0.5, targetFuel);
                if (voltage < targetVoltage)
                    Voltage = voltage = Math.Min(voltage + 0.2, targetVoltage);

                SendData(force: true);
                await Task.Delay(50);
            }

            RPM = 800;
            SendData(force: true);
            Program.Log("Двигатель успешно запущен");
        }

        // Плавное отключение двигателя с постепенным обнулением параметров
        public async Task StopEngine()
        {
            Program.Log("Остановка двигателя");
            engineRunning = false;

            _ = Task.Run(async () =>
            {
                while (Speed > 0)
                {
                    Speed = Math.Max(Speed - 0.5, 0); 
                    UpdateMileage();
                    SendData(force: true);
                    await Task.Delay(30);
                }
            });

            while (Temperature > 0 || FuelLevel > 0 || Voltage > 0 || RPM > 0)
            {
                if (Temperature > 0)
                    Temperature = Math.Max(0, Temperature - 1);
                if (FuelLevel > 0)
                    FuelLevel = Math.Max(0, FuelLevel - 0.5);
                if (Voltage > 0)
                    Voltage = Math.Max(0, Voltage - 0.2);
                if (RPM > 0)
                    RPM = Math.Max(0, RPM - 100);

                SendData(force: true);
                await Task.Delay(50);
            }

            Program.Log("Двигатель остановлен");
        }

        // Установка температуры
        public void SetTemperature(double value)
        {
            Temperature = value;
            Program.Log($"Температура установлена: {value}");
            SendData(force: true);
        }

        // Установка уровня топлива
        public void SetFuelLevel(double value)
        {
            FuelLevel = value;
            Program.Log($"Уровень топлива установлен: {value}");
            SendData(force: true);
        }

        // Установка напряжения
        public void SetVoltage(double value)
        {
            Voltage = value;
            Program.Log($"Напряжение установлено: {value}");
            SendData(force: true);
        }

        // Смена передачи
        public void SetGear(string gear)
        {
            int index = Array.IndexOf(gears, gear);
            if (index >= 0)
            {
                string previous = CurrentGear;
                gearIndex = index;
                transmissionRatio = GetGearRatio(CurrentGear);
                GearChanged?.Invoke(CurrentGear);
                UpdateRPM();
                SendData(force: true);
                Program.Log($"Передача переключена: {previous} → {CurrentGear}");

                if (CurrentGear == "N" && engineRunning && !isGasPressed && !isBraking)
                {
                    Task.Run(async () =>
                    {
                        while (CurrentGear == "N" && Speed > 0 && !isGasPressed && !isBraking && engineRunning)
                        {
                            Speed = Math.Max(Speed - 0.2, 0);
                            UpdateRPM();
                            UpdateMileage();
                            SendData();
                            await Task.Delay(30);
                        }
                    });
                }
            }
        }

        // Нажатие/отпускание газа
        public void SetGasPedal(bool pressed)
        {
            if (!engineRunning) return;

            isGasPressed = pressed;
            Program.Log(pressed ? "Газ нажат" : "Газ отпущен");

            Task.Run(async () =>
            {
                while (!isBraking && (pressed ? isGasPressed : !isGasPressed))
                {
                    if (!engineRunning) break;

                    if (CurrentGear == "N" || transmissionRatio == 0)
                    {
                        // Нейтраль — регулируем только RPM, скорость постепенно снижается
                        double targetRPM = pressed ? 7000 : 800;
                        RPM += (targetRPM - RPM) * 0.2;
                        Speed = Math.Max(Speed - 0.3, 0);
                    }
                    else
                    {
                        double targetSpeed = pressed
                            ? Math.Min(Speed + 1.5, 200)
                            : Math.Max(Speed - 0.7, 0);

                        Speed += (targetSpeed - Speed) * 0.5;

                        UpdateRPM();
                        UpdateMileage();
                        await AutoShift();
                    }

                    SendData();
                    await Task.Delay(40);
                }
            });
        }

        // Нажатие/отпускание тормоза
        public void SetBrake(bool pressed)
        {
            isBraking = pressed;
            Program.Log(pressed ? "Тормоз нажат" : "Тормоз отпущен");

            if (pressed)
            {
                Task.Run(async () =>
                {
                    while (isBraking)
                    {
                        Speed = Math.Max(Speed - 1, 0);
                        UpdateRPM();
                        UpdateMileage();
                        await AutoShift();

                        SendData();
                        await Task.Delay(30);

                        if (Speed <= 0 && RPM <= 800)
                            break;
                    }
                });
            }
            else
            {
                UpdateRPM();
                SendData(force: true);

                if (!isGasPressed)
                {
                    Task.Run(async () =>
                    {
                        while (!isGasPressed && !isBraking)
                        {
                            Speed = Math.Max(Speed - 0.2, 0);
                            UpdateRPM();
                            UpdateMileage();
                            await AutoShift();

                            SendData();
                            await Task.Delay(30);

                            if (Speed <= 0 && RPM <= 800)
                                break;
                        }
                    });
                }
            }
        }

        // Автоматическая смена передачи
        private async Task AutoShift()
        {
            if (gearIndex == 0) return;

            double[] shiftUpThresholds = { 0, 30, 50, 80, 110 };
            double[] shiftDownThresholds = { 0, 10, 25, 45, 70 };

            if (gearIndex < gears.Length - 1 && Speed > shiftUpThresholds[gearIndex])
            {
                Program.Log("Автоматическая передача вверх");
                gearIndex++;
                transmissionRatio = GetGearRatio(CurrentGear);
                GearChanged?.Invoke(CurrentGear);
                await ShiftWithRPMDrop(true);
            }
            else if (gearIndex > 1 && Speed < shiftDownThresholds[gearIndex - 1])
            {
                Program.Log("Автоматическая передача вниз");
                gearIndex--;
                transmissionRatio = GetGearRatio(CurrentGear);
                GearChanged?.Invoke(CurrentGear);
                await ShiftWithRPMDrop(false);
            }
        }

        // Плавное изменение оборотов при переключении передачи
        private async Task ShiftWithRPMDrop(bool up)
        {
            double duration = 150;
            int steps = 20;
            double delay = duration / steps;

            double beforeRatio = up ? GetGearRatio(gears[gearIndex - 1]) : GetGearRatio(gears[gearIndex + 1]);
            double afterRatio = transmissionRatio;

            for (int i = 1; i <= steps; i++)
            {
                double ratio = beforeRatio + (afterRatio - beforeRatio) * (i / (double)steps);
                RPM = (Speed * ratio * FinalDrive * 1000) / (TyreCircumference * 60);
                RPM = Math.Clamp(RPM, 800, 7000);

                SendData(force: true);
                await Task.Delay((int)delay);
            }

            UpdateRPM();
            SendData(force: true);
        }

        // Расчёт оборотов двигателя
        private void UpdateRPM()
        {
            if (!engineRunning)
            {
                RPM = Math.Max(RPM - 100, 0);
                return;
            }

            if (CurrentGear == "N")
            {
                double targetRPM = isGasPressed ? 3000 : 800;
                RPM += (targetRPM - RPM) * 0.1;
                RPM = Math.Clamp(RPM, 800, 7000);
                return;
            }

            if (transmissionRatio == 0)
            {
                RPM = Math.Max(RPM, 800);
                return;
            }

            double calculatedRPM = (Speed * transmissionRatio * FinalDrive * 1000) / (TyreCircumference * 60);
            RPM += (calculatedRPM - RPM) * 0.3;
            RPM = Math.Clamp(RPM, 800, 7000);
        }

        // Получение передаточного числа
        private static double GetGearRatio(string gear) => gear switch
        {
            "1" => 2.92,
            "2" => 2.05,
            "3" => 1.56,
            "4" => 1.31,
            "5" => 1.13,
            _ => 0
        };

        // Обновление пробега
        private void UpdateMileage()
        {
            Mileage += Speed / 3600.0;
        }

        // Отправка данных клиенту
        private void SendData(bool force = false)
        {
            RPM = Math.Max(RPM, 0);

            if (!force && Math.Abs(Speed - lastSpeedSent) < 0.001 && Math.Abs(RPM - lastRPMSent) < 0.001)
                return;

            lastSpeedSent = Speed;
            lastRPMSent = RPM;

            var data = new
            {
                speed = Math.Round(Speed, 2),
                rpm = Math.Round(RPM, 2),
                gear = CurrentGear,
                temperature = Temperature,
                fuelLevel = FuelLevel,
                voltage = Voltage,
                mileage = Math.Round(Mileage, 4),
                engineRunning = engineRunning
            };

            string json = JsonConvert.SerializeObject(data);
            webSocketServer.SendData(json);
        }
    }
}
