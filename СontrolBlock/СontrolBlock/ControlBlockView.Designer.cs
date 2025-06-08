namespace СontrolBlock
{
    partial class ControlBlockView
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            buttonBrake = new Button();
            buttonGas = new Button();
            buttonStartStop = new Button();
            numericUpDownTemperature = new NumericUpDown();
            label4 = new Label();
            numericUpDownFuelLevel = new NumericUpDown();
            label5 = new Label();
            numericUpDownVoltage = new NumericUpDown();
            label6 = new Label();
            labelGear = new Label();
            comboBoxGear = new ComboBox();
            labelVersion = new Label();
            ((System.ComponentModel.ISupportInitialize)numericUpDownTemperature).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericUpDownFuelLevel).BeginInit();
            ((System.ComponentModel.ISupportInitialize)numericUpDownVoltage).BeginInit();
            SuspendLayout();
            // 
            // buttonBrake
            // 
            buttonBrake.Location = new Point(268, 46);
            buttonBrake.Name = "buttonBrake";
            buttonBrake.Size = new Size(141, 65);
            buttonBrake.TabIndex = 5;
            buttonBrake.Text = "Тормоз";
            buttonBrake.UseVisualStyleBackColor = true;
            buttonBrake.MouseDown += buttonBrake_MouseDown;
            buttonBrake.MouseUp += buttonBrake_MouseUp;
            // 
            // buttonGas
            // 
            buttonGas.Location = new Point(435, 46);
            buttonGas.Name = "buttonGas";
            buttonGas.Size = new Size(141, 65);
            buttonGas.TabIndex = 6;
            buttonGas.Text = "Газ";
            buttonGas.UseVisualStyleBackColor = true;
            buttonGas.MouseDown += buttonGas_MouseDown;
            buttonGas.MouseUp += buttonGas_MouseUp;
            // 
            // buttonStartStop
            // 
            buttonStartStop.Location = new Point(647, 46);
            buttonStartStop.Name = "buttonStartStop";
            buttonStartStop.Size = new Size(141, 65);
            buttonStartStop.TabIndex = 10;
            buttonStartStop.Text = "Запуск/остановка двигателя";
            buttonStartStop.UseVisualStyleBackColor = true;
            buttonStartStop.Click += buttonStartStop_Click;
            // 
            // numericUpDownTemperature
            // 
            numericUpDownTemperature.Location = new Point(159, 192);
            numericUpDownTemperature.Name = "numericUpDownTemperature";
            numericUpDownTemperature.Size = new Size(150, 27);
            numericUpDownTemperature.TabIndex = 11;
            numericUpDownTemperature.ValueChanged += numericUpDownTemperature_ValueChanged;
            // 
            // label4
            // 
            label4.Location = new Point(12, 192);
            label4.Name = "label4";
            label4.Size = new Size(119, 48);
            label4.TabIndex = 12;
            label4.Text = "Температура двигателя";
            // 
            // numericUpDownFuelLevel
            // 
            numericUpDownFuelLevel.Location = new Point(159, 241);
            numericUpDownFuelLevel.Name = "numericUpDownFuelLevel";
            numericUpDownFuelLevel.Size = new Size(150, 27);
            numericUpDownFuelLevel.TabIndex = 13;
            numericUpDownFuelLevel.ValueChanged += numericUpDownFuelLevel_ValueChanged;
            // 
            // label5
            // 
            label5.Location = new Point(12, 240);
            label5.Name = "label5";
            label5.Size = new Size(141, 28);
            label5.TabIndex = 14;
            label5.Text = "Уровень топлива";
            // 
            // numericUpDownVoltage
            // 
            numericUpDownVoltage.Location = new Point(159, 285);
            numericUpDownVoltage.Name = "numericUpDownVoltage";
            numericUpDownVoltage.Size = new Size(150, 27);
            numericUpDownVoltage.TabIndex = 15;
            numericUpDownVoltage.ValueChanged += numericUpDownVoltage_ValueChanged;
            // 
            // label6
            // 
            label6.Location = new Point(12, 285);
            label6.Name = "label6";
            label6.Size = new Size(141, 27);
            label6.TabIndex = 16;
            label6.Text = "Напряжение сети";
            // 
            // labelGear
            // 
            labelGear.AutoSize = true;
            labelGear.Location = new Point(12, 147);
            labelGear.Name = "labelGear";
            labelGear.Size = new Size(127, 20);
            labelGear.TabIndex = 7;
            labelGear.Text = "Выбор передачи";
            // 
            // comboBoxGear
            // 
            comboBoxGear.FormattingEnabled = true;
            comboBoxGear.Location = new Point(159, 144);
            comboBoxGear.Name = "comboBoxGear";
            comboBoxGear.Size = new Size(150, 28);
            comboBoxGear.TabIndex = 17;
            comboBoxGear.SelectedIndexChanged += comboBoxGear_SelectedIndexChanged;
            // 
            // labelVersion
            // 
            labelVersion.AutoSize = true;
            labelVersion.Location = new Point(753, 305);
            labelVersion.Name = "labelVersion";
            labelVersion.Size = new Size(35, 20);
            labelVersion.TabIndex = 18;
            labelVersion.Text = "v1.0";
            // 
            // ControlBlockView
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 334);
            Controls.Add(labelVersion);
            Controls.Add(comboBoxGear);
            Controls.Add(labelGear);
            Controls.Add(label6);
            Controls.Add(numericUpDownVoltage);
            Controls.Add(label5);
            Controls.Add(numericUpDownFuelLevel);
            Controls.Add(label4);
            Controls.Add(numericUpDownTemperature);
            Controls.Add(buttonStartStop);
            Controls.Add(buttonGas);
            Controls.Add(buttonBrake);
            Name = "ControlBlockView";
            Text = "Блок управления";
            Load += ControlBlockView_Load;
            ((System.ComponentModel.ISupportInitialize)numericUpDownTemperature).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericUpDownFuelLevel).EndInit();
            ((System.ComponentModel.ISupportInitialize)numericUpDownVoltage).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion
        private Button buttonBrake;
        private Button buttonGas;
        private Button buttonStartStop;
        private NumericUpDown numericUpDownTemperature;
        private Label label4;
        private NumericUpDown numericUpDownFuelLevel;
        private Label label5;
        private NumericUpDown numericUpDownVoltage;
        private Label label6;
        private Label labelGear;
        private ComboBox comboBoxGear;
        private Label labelVersion;
    }
}
