# 1. Usamos la imagen oficial de Node.js (versión latest) basada en Debian
# Esto garantiza que tengas la última versión de Node y npm/yarn/pnpm
FROM node:latest

# Metadatos opcionales
LABEL description="Entorno de desarrollo con Node.js y Aiken (últimas versiones)"

# 2. Instalamos dependencias básicas del sistema
# curl y ca-certificates son necesarios para descargar el instalador de Aiken
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 3. Instalamos Aiken
# Paso A: Descargar y ejecutar el script de instalación de 'aikup'
RUN curl -sSfL https://install.aiken-lang.org | bash

# Paso B: Agregar el directorio de binarios de Aiken al PATH del sistema
# Esto permite ejecutar 'aiken' y 'aikup' desde cualquier lugar
ENV PATH="/root/.aiken/bin:${PATH}"

# Paso C: Ejecutar 'aikup' para instalar la última versión estable del compilador
RUN aikup

# 4. Configuración del entorno de trabajo
WORKDIR /app

# Verificamos las versiones instaladas durante la construcción (opcional, para log)
RUN echo "Node version:" && node -v && \
    echo "Aiken version:" && aiken --version

# Comando por defecto al iniciar el contenedor
CMD ["bash"]