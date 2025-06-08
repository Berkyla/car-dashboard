using System;
using System.IO;
using System.Windows.Forms;

namespace СontrolBlock
{
    internal static class Program
    {
        public static ControlBlockView MainForm;
        private static StreamWriter? logWriter;

        [STAThread]
        static void Main()
        {
            try
            {
                // Формируем уникальное имя лог-файла
                string timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
                string logFileName = $"log_{timestamp}.txt";
                string logPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs");

                // Создаём папку, если нужно
                if (!Directory.Exists(logPath))
                    Directory.CreateDirectory(logPath);

                logWriter = new StreamWriter(Path.Combine(logPath, logFileName), append: false)
                {
                    AutoFlush = true
                };

                Log("=== Application started ===");

                ApplicationConfiguration.Initialize();
                MainForm = new ControlBlockView();
                Application.Run(MainForm);
            }
            catch (Exception ex)
            {
                Log($"[ERROR] {ex.Message}\n{ex.StackTrace}");
                MessageBox.Show("Произошла ошибка при запуске приложения. См. папку logs", "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                Log("=== Application exited ===");
                logWriter?.Dispose();
            }
        }

        // Запись сообщения в лог с отметкой времени
        public static void Log(string message)
        {
            logWriter?.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}");
        }
    }
}
