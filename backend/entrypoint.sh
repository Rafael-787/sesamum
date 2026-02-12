#!/bin/sh

# Encerra o script se houver erro
set -e

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

echo "Aplicando migrações do banco de dados..."
python manage.py migrate

echo "Iniciando servidor Gunicorn..."
# 4 workers é um bom ponto de partida
exec gunicorn api.wsgi:application --bind 0.0.0.0:8000 --workers 4
