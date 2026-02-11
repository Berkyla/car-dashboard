using System;
using System.Collections.Generic;
using Fleck;
using СontrolBlock;

namespace ControlBlock
{
    public class WebSocketServerManager
    {
        private WebSocketServer server;
        private List<IWebSocketConnection> clients = new List<IWebSocketConnection>();

        public WebSocketServerManager()
        {
            server = new WebSocketServer("ws://0.0.0.0:8080");

            // Обработка подключения и отключения клиентов
            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    clients.Add(socket);
                    Program.Log("Клиент подключен");
                };

                socket.OnClose = () =>
                {
                    clients.Remove(socket);
                    Program.Log("Клиент отключен");
                };
            });

            Program.Log("WebSocket сервер запущен на ws://0.0.0.0:8080");
        }

        // Отправка строки данных всем подключённым клиентам
        public void SendData(string data)
        {
            if (clients.Count > 0)
            {
                Program.Log($"Отправка данных: {data}");
                foreach (var client in clients)
                {
                    client.Send(data);
                }
            }
        }
    }
}
