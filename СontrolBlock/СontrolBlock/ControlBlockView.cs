using ControlBlock;
using System;
using System.Threading.Tasks;
using System.Windows.Forms;
using Newtonsoft.Json;

namespace СontrolBlock
{
    public partial class ControlBlockView : Form
    {
        private readonly CarModel car;
        private bool engineRunning = false;
        private readonly WebSocketServerManager webSocketServer;

        public ControlBlockView()
        {
            InitializeComponent();
            webSocketServer = new WebSocketServerManager();
            car = new CarModel(webSocketServer);
            car.GearChanged += OnGearChanged;
            InitializeControls();
            SetControlsEnabled(false); // Отключаем элементы до запуска двигателя
        }

        // Установка начальных значений при запуске формы
        private void ControlBlockView_Load(object sender, EventArgs e)
        {
            numericUpDownTemperature.Value = 90;
            numericUpDownFuelLevel.Value = 40;
            numericUpDownVoltage.Value = 13.5M;
        }

        // Запуск или остановка двигателя
        private async void buttonStartStop_Click(object sender, EventArgs e)
        {
            engineRunning = !engineRunning;
            buttonStartStop.Text = engineRunning ? "Заглушить двигатель" : "Запустить двигатель";
            Program.Log(engineRunning ? "Двигатель запущен" : "Двигатель остановлен");

            SetControlsEnabled(engineRunning);

            if (engineRunning)
            {
                await car.StartEngine(
                    (double)numericUpDownTemperature.Value,
                    (double)numericUpDownFuelLevel.Value,
                    (double)numericUpDownVoltage.Value
                );

                car.SetGear("N");
                car.SetGasPedal(false);
                car.SetBrake(false);
            }
            else
            {
                await car.StopEngine();
            }
        }

        // Нажатие газа
        private void buttonGas_MouseDown(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            Program.Log("Педаль газа нажата");
            car.SetGasPedal(true);
        }

        // Отпускание газа
        private void buttonGas_MouseUp(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            Program.Log("Педаль газа отпущена");
            car.SetGasPedal(false);
        }

        // Нажатие тормоза
        private void buttonBrake_MouseDown(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            Program.Log("Тормоз нажат");
            car.SetBrake(true);
        }

        // Отпускание тормоза
        private void buttonBrake_MouseUp(object sender, MouseEventArgs e)
        {
            if (!engineRunning) return;
            Program.Log("Тормоз отпущен");
            car.SetBrake(false);
            SendData();
        }

        // Изменение температуры
        private void numericUpDownTemperature_ValueChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            car.SetTemperature((double)numericUpDownTemperature.Value);
            Program.Log($"Температура установлена: {numericUpDownTemperature.Value}");
        }

        // Изменение топлива
        private void numericUpDownFuelLevel_ValueChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            car.SetFuelLevel((double)numericUpDownFuelLevel.Value);
            Program.Log($"Уровень топлива установлен: {numericUpDownFuelLevel.Value}");
        }

        // Изменение напряжения
        private void numericUpDownVoltage_ValueChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            car.SetVoltage((double)numericUpDownVoltage.Value);
            Program.Log($"Напряжение установлено: {numericUpDownVoltage.Value}");
        }

        // Смена передачи вручную
        private void comboBoxGear_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;

            string selectedGear = comboBoxGear.SelectedItem?.ToString() ?? "N";
            car.SetGear(selectedGear);
            Program.Log($"Передача установлена: {selectedGear}");
        }

        // Получение передачи из CarModel и отображение её в UI
        private void OnGearChanged(string gear)
        {
            if (comboBoxGear.InvokeRequired)
                comboBoxGear.Invoke(() => comboBoxGear.SelectedItem = gear);
            else
                comboBoxGear.SelectedItem = gear;
        }

        // Включение или отключение всех элементов, кроме кнопки запуска
        private void SetControlsEnabled(bool enabled)
        {
            buttonGas.Enabled = enabled;
            buttonBrake.Enabled = enabled;
            comboBoxGear.Enabled = enabled;
            numericUpDownTemperature.Enabled = enabled;
            numericUpDownFuelLevel.Enabled = enabled;
            numericUpDownVoltage.Enabled = enabled;
        }

        // Инициализация всех элементов управления
        private void InitializeControls()
        {
            InitializeFuelLevel();
            InitializeTemperature();
            InitializeVoltage();
            InitializeGearSelector();
        }

        // Настройка поля топлива
        private void InitializeFuelLevel()
        {
            numericUpDownFuelLevel.Minimum = 0;
            numericUpDownFuelLevel.Maximum = 50;
            numericUpDownFuelLevel.DecimalPlaces = 2;
            numericUpDownFuelLevel.Increment = 0.2M;
        }

        // Настройка поля температуры
        private void InitializeTemperature()
        {
            numericUpDownTemperature.Minimum = 0;
            numericUpDownTemperature.Maximum = 130;
            numericUpDownTemperature.DecimalPlaces = 2;
            numericUpDownTemperature.Increment = 0.5M;
        }

        // Настройка поля напряжения
        private void InitializeVoltage()
        {
            numericUpDownVoltage.Minimum = 0;
            numericUpDownVoltage.Maximum = 15;
            numericUpDownVoltage.DecimalPlaces = 2;
            numericUpDownVoltage.Increment = 0.01M;
        }

        // Настройка селектора передач
        private void InitializeGearSelector()
        {
            comboBoxGear.Items.Clear();
            comboBoxGear.Items.AddRange(new string[] { "N", "1", "2", "3", "4", "5" });
            comboBoxGear.SelectedIndex = 0;
            comboBoxGear.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBoxGear.SelectedIndexChanged += comboBoxGear_SelectedIndexChanged;
        }

        // Отправка текущего состояния модели по WebSocket
        private void SendData()
        {
            var data = new
            {
                speed = Math.Round(car.Speed, 2),
                rpm = Math.Round(car.RPM, 2),
                gear = comboBoxGear.SelectedItem?.ToString() ?? "N",
                voltage = Math.Round(car.Voltage, 2),
                mileage = Math.Round(car.Mileage, 4),
                temperature = Math.Round(car.Temperature, 2),
                fuellevel = Math.Round(car.FuelLevel, 2)
            };

            string jsonData = JsonConvert.SerializeObject(data);
            webSocketServer.SendData(jsonData);
            Program.Log($"Данные отправлены: {jsonData}");
        }
    }
}
