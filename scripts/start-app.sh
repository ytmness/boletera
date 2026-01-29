#!/bin/bash

# Script wrapper para iniciar la aplicación con variables de entorno desde .env
# Este script carga el .env y luego ejecuta npm start

set -a  # Exportar todas las variables automáticamente
source .env
set +a  # Desactivar exportación automática

# Ejecutar npm start con las variables de entorno cargadas
exec npm start
