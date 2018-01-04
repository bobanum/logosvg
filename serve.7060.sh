#!/bin/bash

# On change le dossier courant pour le même que le fichier .sh
chemin=$(dirname "$0")
cd "${chemin}"

# On cherche le numero de port dans le nom du fichier
port=`expr "$0" : '.*[_\.\-]\([0-9]*\)\.sh'`

# On prend le port 8000 par défaut
if [ ! $port ]
then
	((port=8000))
fi

# On cherche le premier port non ouvert
while [ -n "`netstat -atn | grep \".$port \"`" ]
do
	echo "Le port '$port' est pris."
	((port=port+1))
done
echo "On utilise le port '$port'."

# On ouvre le fureteur et on démarre le serveur
start "" "http://localhost:$port"
php -S 0.0.0.0:$port
