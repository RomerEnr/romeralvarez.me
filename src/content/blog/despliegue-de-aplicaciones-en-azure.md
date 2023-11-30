---
title: Despliegue de aplicaciones básicas en Azure Kuberentes Service (AKS)
author: Romer Alvarez
pubDatetime: 2023-11-30T21:19:00Z
postSlug: despliegue-en-azure-kubernetes-service
featured: true
draft: false
tags:
  - Azure
  - Cloud
  - Kubernetes
  - DevOps
ogImage: https://learn.microsoft.com/en-us/azure/architecture/guide/aks/media/aks-cicd-azure-pipelines-architecture.svg#lightbox
description: Aprende a desplegar aplicaciones de manera eficiente en Azure Kubernetes Service (AKS). Esta guía paso a paso te llevará desde la creación de un Azure Container Registry hasta la implementación de imágenes de contenedores en AKS, ilustrado con ejemplos prácticos y diagramas explicativos.
---

# Despliegue de Aplicaciones en Azure Kubernetes Service (AKS): Introducción básica.  

## Introducción

En este artículo exploraremos cómo desplegar aplicaciones utilizando Azure Kubernetes Service (AKS). Cubriremos desde la creación de un **Azure Container Registry** hasta el despliegue de imágenes de contenedores en AKS, ilustrado con ejemplos prácticos y diagramas explicativos.

![Relation between ACR and AKS](/assets/Azure/acr-aks.png)

Estaremos realizando el <a href="https://learn.microsoft.com/en-gb/training/modules/project-deploy-applications-azure-kubernetes-service/2-exercise-provision-azure-container-registry-azure-kubernet" target="_blank">ejercicio propuesto por Microsoft</a>.

Se compone de 4 ejercicios: 

* Ejercicio 1: Aprovisionamiento de **Azure Container Registry (ACR)** y **Azure Kubernetes Service (AKS).**
* Ejercicio 2: Crear imágenes de contenedores **Linux** y **Windows** y almacenarlas en **Azure Container Registry.**
* Ejercicio 3: Desplegar contenedores en **Azure Kubernetes Service.**
* Ejercicio 4: Revisar el despliegue y **eliminar** todos los recursos.

## Ejercicio 1: Aprovisionamiento de Azure Container Registry (ACR) y Azure Kubernetes Service (AKS)

### Paso 1: Crear un Azure Container Registry (ACR)

1. Iniciar sesión en el [portal de Azure](https://portal.azure.com/).
2. Buscar en la barra de búsqueda `Container Registries`. Haz clic en `+ Create` y completa los siguientes datos:  

| Configuración         | Valor                             |
| --------------------- | --------------------------------- |
| Subscription          | Tu suscripción de Azure           |
| Resource Group        | acr-01-RG                         |
| Registry name         | Debe ser un nombre único, en nuestro será romeralvarezme                    |
| Region                | Europe West                   |
| Availability zones    | Ninguno                           |
| SKU                   | Basic                             |

### Paso 2: Crear una Azure Virtual Network and an AKS Cluster

Creación de una red virtual y un clúster de AKS.

1. Buscar en la barra de búsqueda `Virtual Network`. Haz clic en `+ Create` y completa los siguientes datos:  

| Configuración    | Valor                         |
| ---------------- | ----------------------------- |
| Subscription     | Tu suscripción de Azure    |
| Resource Group   | aks-01-RG                     |
| Virtual network name | vnet-01                  |
| Region           | [La misma región que antes]   |

* Avanza a través de las pestañas "Security" y acepta todo por defecto. Luego, "IP Addresses" y acepta todo por defecto asegurarse que el address space esté puesto en `10.0.0.0/16 y eliminar por la subred predeterminada.
* Selecciona `Review + Create` y luego `Create`.

2. Buscar en la barra de búsqueda `Kubernetes Service`. Haz clic en `+ Create` y completa los siguientes datos:

| Configuración              | Valor                   |
| -------------------------- | ----------------------- |
| Subscription               | Tu suscripción de Azure        |
| Resource Group             | aks-01-RG               |
| Cluster preset configuration    | Dev/Test                  |
| Kubernetes cluster name    | aks-01                  |
| Region                     | [La misma región que antes] |
| Availability zones         | Ninguno                 |
| AKS pricing tier           | Free                    |
| Kubernetes version         | [Valor por defecto]     |
| Automatic upgrade          | Disabled                |
| Node size                  | Standard B4ms           |
| Scale method               | Manual                  |
| Node count                 | 2                       |

* En la pestaña "Networking", selecciona `Azure CNI` y elige la red virtual vnet-01.
* Crea una subred (aks-subnet) con el rango de direcciones `10.0.0.0/20`.
* Luego, hay que completar los siguientes datos:

| Configuración                        | Valor                   |
| ------------------------------------ | ----------------------- |
| Cluster subnet                       | aks-subnet (10.0.0.0/20)|
| Kubernetes service address range     | 172.16.0.0/22           |
| Kubernetes DNS service IP address    | 172.16.3.254            |
| DNS name prefix                      | aks-01-dns              |
| Enable private cluster               | Disabled                |
| Set authorized IP ranges             | Disabled                |
| Network policy                       | None                    |

3. Crearemos el Pool de Nodos Windows:

* En la ventana de "Node Pools", agrega un nuevo pool de nodos para Windows, rellenando los siguientes datos:

| Configuración               | Valor          |
| --------------------------- | -------------- |
| Node pool name              | w1pool         |
| Mode                        | User           |
| OS type                     | Windows        |
| Availability zone           | Ninguno        |
| Enable Azure spot instances | Disabled       |
| Node size                   | Standard B4s_v2|
| Scale method                | Manual         |
| Node count                  | 2              |
| Max pods per node           | 30             |
| Enable public IP per node   | Disabled       |


4. En la pestaña de `Integrations` seleccionaremos el Registry que hemos creado anteriormente, nos aseguraremos de desactivar `Azure Monitor` y `Azure Policy` y seleccionaremos `Review + Create` y luego `Create`.

Ahora, esperaremos a que se aprovisionen los recursos, y podemos dar por concluido el ejercicio 1. Habremos completado lo siguiente:

* Se creó un Azure Container Registry (ACR) y se configuraron los detalles de la Red Virtual de Azure y un cluster de AKS.
* Se creó un pool de nodos de Windows para el clúster de AKS.
* Hemos asociado el Azure Container Registry (ACR) con el clúster de AKS.

Y se nos quedaría algo de este estilo:
![ACR and AKS](/assets/Azure/acr-aks-connected.png)

## Ejercicio 2: Crear imágenes de contenedores Linux y Windows y almacenarlas en Azure Container Registry

En este ejercicio, crearemos imágenes de contenedores Linux y Windows y las almacenaremos en Azure Container Registry (ACR).

### Paso 1: Configuración del entorno

* Accederemos a Azure Cloud Shell desde el portal de Azure y seleccionaremos `Bash` como shell.
* Crearemos ejecutaremos los siguientes comandos para crear un directorio y navegar a él:

```bash
mkdir ~/image-l01
cd ~/image-l01
```

* Crearemos el siguiente archivo de Javascript utilizando el editor que más nos guste, en mi caso `vim`:

```bash
vim server.js
```
### Paso 2: Creación de archivos para el proyecto de Linux 

* Dentro del server.js pegaremos el siguiente código:

```javascript
const http = require('http')
const port = 80
const server = http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'})
  response.write('Hello World from Node\n')
  response.end('Version: ' + process.env.NODE_VERSION + '\n')
})
server.listen(port)
console.log(`Server running at http://localhost: ${port}`)
```

* Crearemos el siguiente package.json de nuevo con nuestro editor favorito:

```json
{
  "name": "helloworld",
  "version": "1.0.0",
  "description": "Sample app for ACR Build",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "license": "MIT"
}
```

* Crearemos el siguiente Dockerfile con nuestro editor favorito:

```bash
FROM node:20.2-alpine
COPY . /src
RUN cd /src && npm install
EXPOSE 80
CMD ["node", "/src/server.js"]
```

* En nuestra sesión de bash, identificaremos el nombre de nuestro Azure Container Registry (ACR) y lo guardaremos en una variable de entorno:

```bash
ACR_RG='acr-01-RG'
ACR_NAME=$(az acr list --resource-group $ACR_RGNAME --query "[].name" --output tsv)
```

* De nuestra sesión de bash, crearemos la imagen de Docker basada en el Dockerfile que hemos creado y la pushearemos directamente a nuestro Azure Container Registry (ACR), que le hemos almacenado en la variable `ACR_NAME`:

```bash
az acr build --registry $ACR_NAME --image hellofromnode:v1.0 .
```

### Paso 3: Creación de archivos para el proyecto de Windows

* Crearemos el directorio para el proyecto de Windows:

```bash
mkdir ~/image-w01
cd ~/image-w01
```

* Clonaremos el siguiente repositorio que tiene los archivos necesarios para construir una imagen de Windows con Docker:

```bash
git clone https://github.com/Azure-Samples/dotnetcore-docs-hello-world.git
cd ~/image-w01/dotnetcore-docs-hello-world
```

* Dentro del directorio ejecutaremos el siguiente comando para construir la imagen:

```bash
az acr build --registry $ACR_NAME --image hellofromdotnet:v1.0 --platform windows --file Dockerfile.windows .
```

Al ir a nuestro Registry, veremos que tenemos las dos imágenes creadas:

![ACR Repository](/assets/Azure/acr-repository.png)

## Ejercicio 3: Desplegar contenedores en Azure Kubernetes Service

En esta tarea crearemos dos namespaces en nuestro cluster de AKS y desplegaremos las imágenes que hemos creado en el ejercicio anterior.

### Paso 1: Crear namespaces

1. En el portal de Azure, buscaremos `Kubernetes Services` y seleccionaremos nuestro cluster de AKS.
2. En la pestaña de `Kubernetes Resources` seleccionaremos `Namespaces` y crearemos uno llamado `dev-node` y otro llamado `dev-dotnet`.

### Paso 2: Creare manifiestos para desplegar la imagen de y Windows

1. En nuestro Cloud Shell, crearemos el siguiente directorio:

```bash
mkdir ~/aks-l01
cd ~/aks-l01
```

2. Crearemos el siguiente archivo de manifiesto de Kubernetes aks-deployment-l01.yaml:


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hellofromnode-deployment
  labels:
    environment: dev
    app: hellofromnode
spec:
  replicas: 1
  template:
    metadata:
      name: hellofromnode
      labels:
        app: hellofromnode
    spec:
      nodeSelector:
        "kubernetes.io/os": linux
      containers:
      - name: hellofromnode
        image: ACR_NAME.azurecr.io/hellofromnode:v1.0
        resources:
          limits:
            cpu: 1
            memory: 800M
        ports:
          - containerPort: 80
  selector:
    matchLabels:
      app: hellofromnode
---
apiVersion: v1
kind: Service
metadata:
  name: hellofromnode-service
spec:
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
  selector:
    app: hellofromnode
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hellofromdotnet-deployment
  labels:
    environment: dev
    app: hellofromdotnet
spec:
  replicas: 1
  template:
    metadata:
      name: hellofromdotnet
      labels:
        app: hellofromdotnet
    spec:
      nodeSelector:
        "kubernetes.io/os": windows
      containers:
      - name: hellofromdotnet
        image: ACR_NAME.azurecr.io/hellofromdotnet:v1.0
        resources:
          limits:
            cpu: 1
            memory: 800M
        ports:
          - containerPort: 80
  selector:
    matchLabels:
      app: hellofromdotnet
---
apiVersion: v1
kind: Service
metadata:
  name: hellofromdotnet-service
spec:
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
  selector:
    app: hellofromdotnet
´´´

3. Reemplazaremos `ACR_NAME` con el nombre de nuestro Azure Container Registry (ACR) y ejecutaremos el siguiente comando para desplegar la imagen de Linux:

```bash
sed -i "s/ACR_NAME/$ACR_NAME/" ./aks-deployment-w01.yaml
kubectl apply -f ./aks-deployment-w01.yaml -n dev-node
```

### Paso 3: Desplegar los manifiestos en sus respectivos namespaces:

1. En nuestra sesión de bash, nos conectaremos al cluster con los siguientes comandos:
    
```bash
AKSRG='aks-01-RG'
AKSNAME='aks-01'
az aks get-credentials --resource-group $AKSRG --name $AKSNAME
```

2. Verificar que la conexión se ha realizado correctamente:

```bash
kubectl get nodes
```

3. Desplegaremos los manifiestos en sus respectivos namespaces:

```bash
kubectl apply -f aks-l01/aks-deployment-l01.yaml -n dev-node
kubectl apply -f aks-w01/aks-deployment-w01.yaml -n dev-dotnet
```

4. Verificaremos que los pods se han creado correctamente:

```bash
kubectl get pods -n dev-node
kubectl get pods -n dev-dotnet
```

5. Verificaremos que los servicios se han creado correctamente:

```bash
kubectl get services -n dev-node
kubectl get services -n dev-dotnet
```

Y finalmente, podremos ver que tenemos los pods y los servicios creados correctamente:

![AKS Pods](/assets/Azure/aks-verification.png)

## Ejercicio 4: Eliminar todos los recursos

Es sumamente importante eliminar todos los recursos que hemos creado para no incurrir en costes innecesarios. Lo podremos hacer de la siguiente manera, en la misma sesión de bash:

```bash
az group delete --resource-group $ACR_RG --yes --no-wait
az group delete --resource-group $AKSRG --yes --no-wait
```
