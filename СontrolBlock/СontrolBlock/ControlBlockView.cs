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
            numericUpDownPMd.Value = 3.0M;
            numericUpDownPSmGmt.Value = 1.0M;
            numericUpDownPUprGmt.Value = 15.0M;
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

        // Изменение давления РМ.ДВ
        private void numericUpDownPMd_ValueChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            car.SetPMd((double)numericUpDownPMd.Value);
            Program.Log($"РМ.ДВ установлен: {numericUpDownPMd.Value}");
        }

        // Изменение давления РСМ.ГМТ
        private void numericUpDownPSmGmt_ValueChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            car.SetPSmGmt((double)numericUpDownPSmGmt.Value);
            Program.Log($"РСМ.ГМТ установлен: {numericUpDownPSmGmt.Value}");
        }

        // Изменение давления РУПР.ГМТ
        private void numericUpDownPUprGmt_ValueChanged(object sender, EventArgs e)
        {
            if (!engineRunning) return;
            car.SetPUprGmt((double)numericUpDownPUprGmt.Value);
            Program.Log($"РУПР.ГМТ установлен: {numericUpDownPUprGmt.Value}");
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
            numericUpDownPMd.Enabled = enabled;
            numericUpDownPSmGmt.Enabled = enabled;
            numericUpDownPUprGmt.Enabled = enabled;
        }

        // Инициализация всех элементов управления
        private void InitializeControls()
        {
            InitializeFuelLevel();
            InitializeTemperature();
            InitializeVoltage();
            InitializePMd();
            InitializePSmGmt();
            InitializePUprGmt();
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

        // Настройка поля РМ.ДВ
        private void InitializePMd()
        {
            numericUpDownPMd.Minimum = 0;
            numericUpDownPMd.Maximum = 16;
            numericUpDownPMd.DecimalPlaces = 1;
            numericUpDownPMd.Increment = 0.1M;
        }

        // Настройка поля РСМ.ГМТ
        private void InitializePSmGmt()
        {
            numericUpDownPSmGmt.Minimum = 0;
            numericUpDownPSmGmt.Maximum = 5;
            numericUpDownPSmGmt.DecimalPlaces = 2;
            numericUpDownPSmGmt.Increment = 0.05M;
        }

        // Настройка поля РУПР.ГМТ
        private void InitializePUprGmt()
        {
            numericUpDownPUprGmt.Minimum = 0;
            numericUpDownPUprGmt.Maximum = 30;
            numericUpDownPUprGmt.DecimalPlaces = 1;
            numericUpDownPUprGmt.Increment = 0.1M;
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
                fuelLevel = Math.Round(car.FuelLevel, 2),
                fuellevel = Math.Round(car.FuelLevel, 2),
                p_md = Math.Round(car.PMd, 2),
                p_sm_gmt = Math.Round(car.PSmGmt, 2),
                p_upr_gmt = Math.Round(car.PUprGmt, 2)
            };

            string jsonData = JsonConvert.SerializeObject(data);
            webSocketServer.SendData(jsonData);
            Program.Log($"Данные отправлены: {jsonData}");
        }
    }
}
