import tkinter as tk
from tkinter import scrolledtext, font
import subprocess
import threading
import os

class ServiceManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Restaurant App Manager")
        self.root.configure(bg="#2d2d2d")
        
        # Configuración de fuentes y colores oscuros
        self.bg_color = "#2d2d2d"
        self.text_color = "#e0e0e0"
        self.font_style = font.Font(family="Consolas", size=10)
        
        self.processes = {}

        # Contenedor de botones
        self.btn_frame = tk.Frame(root, bg=self.bg_color)
        self.btn_frame.pack(pady=10)

        # Botones con estilo
        btn_config = {'bg': "#404040", 'fg': "white", 'relief': "flat", 'padx': 10, 'pady': 5}
        tk.Button(self.btn_frame, text="🚀 Encender Todo", command=self.start_all, bg="green", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(self.btn_frame, text="🛑 Apagar Todo", command=self.stop_all, bg="red", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(self.btn_frame, text="🧹 Limpiar Logs", command=self.clear_logs, **btn_config).pack(side=tk.LEFT, padx=5)

        # Log área con estilo oscuro
        self.log_area = scrolledtext.ScrolledText(
            root, width=80, height=20, 
            bg="#1e1e1e", fg="#00ff00", 
            font=self.font_style, insertbackground="white"
        )
        self.log_area.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)

    def clear_logs(self):
        self.log_area.delete('1.0', tk.END)

    def run_process(self, name, command, cwd):
        if name in self.processes: return
        
        self.log(f"--- Iniciando {name}... ---")
        # Usamos 'shell=True' para que cmd/powershell puedan ejecutar los comandos npm
        proc = subprocess.Popen(
            command, shell=True, cwd=cwd,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
        )
        self.processes[name] = proc
        threading.Thread(target=self.read_logs, args=(name, proc), daemon=True).start()

    def read_logs(self, name, proc):
        for line in iter(proc.stdout.readline, ''):
            if line:
                self.log(f"[{name}] {line.strip()}")

    def log(self, message):
        self.log_area.insert(tk.END, message + "\n")
        self.log_area.see(tk.END)

    def start_all(self):
        # Aseguramos que corra en el directorio raíz del monorepo
        root_path = os.getcwd()
        # npm necesita un shell para encontrar las herramientas
        self.run_process("Backend", "npm run dev:backend", root_path)
        self.run_process("Frontend", "npm run dev:frontend", root_path)

    def stop_all(self):
        for name, proc in self.processes.items():
            self.log(f"--- Apagando {name}... ---")
            proc.terminate()
        self.processes = {}

if __name__ == "__main__":
    root = tk.Tk()
    ServiceManager(root)
    root.mainloop()