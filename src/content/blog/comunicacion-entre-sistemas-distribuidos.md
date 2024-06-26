---
title: Comunicación entre sistemas distribuidos. Kafka vs RabbitMQ.
author: Romer Alvarez
pubDatetime: 2024-03-28T22:00:00Z
postSlug: comunicacion-entre-sistemas-distribuidos
featured: true
draft: false
tags:
  - sistemas-distribuidos
  - Kafka
  - RabbitMQ
ogImage: /assets/comunicacion-entre-sistemas-distribuidos/kafka-vs-rabbitmq.png
description: En el mundo de las arquitecturas basadas en eventos y de sistemas distribuidos, elegir el message broker adecuado es crucial para una comunicación eficiente y escalable. Dos de los contendientes más populares son Kafka y RabbitMQ. En este post exploraremos algunos casos de uso comunes para ambas tecnologías y ayudarte a la hora de tomar una decisión de cual utilizar.
---

# Kafka vs RabbitMQ: Seleccionando el Message Broker Adecuado

Cuando hablamos de sistemas distribuidos y alta concurrencia y aplicaciones que tienen que escalar a un volumen elevado de peticiones por segundo, operaciones asíncronas aparece un elemento que tiene que ver con las colas de mensajería, a partir de ahí hay varias tecnologías con sus pros y sus contras, las principales son `Kafka` y `RabbitMQ`. En este articulo de blog, vamos a explorar ambas tecnologías, algunos casos de uso que nos ayudaran a determinar cuando es "mejor" utilizar una tecnología u otra.

## Comprendiendo Kafka: Un Sistema de Streaming Distribuido

Apache Kafka es una plataforma de transmisión de eventos distribuida de código abierto conocida por sus capacidades de alto rendimiento, tolerancia a fallos y procesamiento de datos en tiempo real. Kafka sigue un modelo de publicación-suscripción donde los productores escriben mensajes en `topics`, y los consumidores se suscriben a esos `topics` para recibir los mensajes. Kafka almacena los mensajes en un `distributed commit log`, permitiendo una alta escalabilidad y tolerancia a fallos. Esto permite un alto rendimiento y capacidades de reproducción de mensajes, haciéndolo ideal para el procesamiento de datos en tiempo real y el `event sourcing`.

La arquitectura de Kafka consta de tres componentes principales: `producers`, `brokers` y `consumers`. Los `producers` publican mensajes en los `topics` de Kafka, y los `brokers` son responsables de almacenar y replicar los datos en el clúster de Kafka. Los `consumers` leen datos de uno o más `topics`, permitiendo el procesamiento paralelo y la escalabilidad.

## RabbitMQ: Un Message Broker Flexible y Confiable

RabbitMQ es un `message broker` flexible y de código abierto que implementa el protocolo `AMQP`. Sigue un modelo tradicional de `message queue`, permitiendo que las aplicaciones se comuniquen de forma asíncrona mediante el envío y la recepción de mensajes y la entrega de mensajes en orden a consumidores específicos. Esto garantiza un orden de mensajes confiable y flexibilidad en el `message routing`, haciéndolo adecuado para el procesamiento de tareas y la comunicación de microservicios.

La arquitectura de RabbitMQ se centra en un `message broker` central, que actúa como intermediario entre productores y consumidores. Para la replicación y retención de mensajes, los productores envían mensajes a los `exchanges`, y esos `exchanges` enrutan los mensajes a las `queues` basándose en reglas predefinidas. Los consumidores luego recuperan los mensajes de las colas y los procesan.

## Diferencias Fundamentales: Arquitectura y Modelo de Consumo

Está el sistema del `Broker` que es el intermediario, es la infraestructura y como funciona por dentro cada una de las tecnologías ya mencionadas. Por otro lado esta la parte del `Consumer`que indica como consumimos de este `Broker` que cambia mucho.

### RabbitMQ

* En RabbitMQ, el `Broker` se considera un `Smart Broker` porque realiza una gran cantidad de trabajo, como el enrutamiento de mensajes, la persistencia y la entrega de mensajes a los consumidores apropiados. 

* El `Broker` utiliza `Exchanges` para recibir mensajes de los productores. Cada mensaje contiene una `Routing Key`, que el `Exchange` examina para determinar a qué `Queues` debe enviar el mensaje basándose en las reglas de `Bindings` establecidas.

* Un `Binding` es una relación entre un `Exchange` y una `Queue`, y define qué mensajes deben enrutarse a una `Queue` específica. Esta relación se establece mediante una `Binding Key`.

* RabbitMQ soporta diferentes tipos de `Exchanges`, como `Direct`, `Fanout`, `Topic` y `Headers`, cada uno con su propio algoritmo para comparar la `Routing Key` del mensaje con las `Binding Keys` para decidir el enrutamiento.

* Una característica potente de RabbitMQ es la `Multiplexación` de mensajes, donde un solo mensaje puede entregarse a múltiples `Queues` si sus `Binding Keys` coinciden con la `Routing Key` del mensaje. Esto permite que múltiples `Consumers` manejen el mismo mensaje para diferentes propósitos.

* En contraste con el `Smart Broker`, los `Consumers` en RabbitMQ son considerados `Dumb Consumers` porque su única responsabilidad es consumir mensajes de las `Queues` a las que están suscritos. RabbitMQ entrega los mensajes a los `Consumers` de manera equitativa mediante un algoritmo de `Round-Robin` por defecto.

* Este diseño de `Smart Broker` y `Dumb Consumer` permite un sistema de mensajería altamente flexible y escalable, donde los componentes pueden ser modificados o reemplazados independientemente, siempre que adhieran a las convenciones de mensajería establecidas.

![Diagrama de Flujo RabbitMQ](/assets/comunicacion-entre-sistemas-distribuidos/rabbit-flow.png)

En este diagrama, podemos ver un ejemplo del flujo de mensajes en RabbitMQ. El `Producer` envía varios eventos (`sales_event`, `inventory_update`, `price_change`) al `Exchange`. El `Exchange` enruta estos mensajes a las `Queues` apropiadas basado en las `Routing Keys` y `Bindings`. 

Luego, los mensajes son consumidos por diferentes `Consumers` para realizar varias tareas, como actualizar la base de datos de ventas (`CRM`), procesar actualizaciones de inventario (`Inventory`), actualizar precios en el sitio web (`Website`), y generar informes de ventas (`Analytics`).

Este ejemplo ilustra cómo RabbitMQ facilita la comunicación desacoplada entre diferentes componentes de un sistema, permitiendo un procesamiento asíncrono y escalable de eventos y tareas.

### Kafka

* En Kafka, los mensajes no van a un `Broker` central, sino que se almacenan en `Topics` en un `Log` distribuido. Kafka sigue un modelo de `Publish-Subscribe`, donde los `Producers` publican mensajes en `Topics`, y los `Consumers` se suscriben a esos `Topics` para recibir los mensajes. 

* Un `Topic` en Kafka es una categoría o feed de nombre al que se publican los registros. Los `Topics` en Kafka son siempre multiproductor y multiconsumidor; es decir, un `Topic` puede tener cero, uno o muchos `Producers` escribiendo en él, y cero, uno o muchos `Consumers` leyendo de él.

* Para cada `Topic`, el cluster Kafka mantiene un `Log` particionado. Cada partición es una secuencia ordenada e inmutable de registros que se appende continuamente a un commit log estructurado. Cada registro en la partición se asigna con un número de identificación secuencial llamado `Offset` que identifica únicamente cada registro dentro de la partición.

* Kafka es un sistema distribuido, por lo que un `Topic` generalmente tiene varias particiones repartidas en varios servidores del cluster Kafka. Esto permite escalabilidad más allá de la capacidad de un solo servidor.

* Los `Consumers` etiquetan a sí mismos con un nombre de `Consumer Group` y cada registro publicado a un `Topic` es entregado a una instancia consumidora dentro de cada `Consumer Group` suscrito. Los `Consumer Instances` pueden estar en procesos separados o en máquinas separadas.

* Si todas las instancias de `Consumer` tienen el mismo `Consumer Group`, entonces los registros se balancearán carga efectivamente sobre las instancias de `Consumer`. Si todas las instancias de `Consumer` tienen diferentes `Consumer Groups`, entonces cada registro se transmitirá a todos los procesos `Consumer`.

![Diagrama de Flujo Kafka](/assets/comunicacion-entre-sistemas-distribuidos/kafka-flow.png)

1. El `Producer` publica mensajes en tres `Topics`: `sales_topic`, `inventory_topic`, y `price_topic`.

2. Cada `Topic` tiene su propio `Consumer Group`: `sales_consumer_group`, `inventory_consumer_group`, y `price_consumer_group`. Los `Consumer Groups` se suscriben a los `Topics` para consumir mensajes.

3. Dentro de cada `Consumer Group`, hay `Consumers` individuales que realizan acciones específicas:

   - `Analytics` procesa las ventas.
   - `CRM` actualiza la información del cliente.
   - `Inventory` actualiza el `inventario`.
   - `Website` actualiza los precios.

4. Los `Topics` en `Kafka` son `particionados` y `replicados` para `escalabilidad` y `tolerancia a fallos`. Cada `partición` es un `log` ordenado e inmutable de mensajes.

5. Los `Consumers` mantienen su propio `offset` (posición) en cada `partición` que están consumiendo, permitiendo un consumo independiente a su propio ritmo.


## Rendimiento y Escalabilidad: Kafka vs RabbitMQ

En cuanto al rendimiento, Kafka y RabbitMQ tienen una funcionalidad similar pero diferentes fortalezas.

### Kafka

Sobresale en escenarios de transmisión de datos en tiempo real y de alto rendimiento, alardeando de una excelente escalabilidad y baja latencia. Puede manejar millones de mensajes por segundo, haciéndolo adecuado para casos de uso que requieren un procesamiento de datos rápido y continuo. Su arquitectura permite la escalabilidad horizontal distribuyendo la carga de trabajo entre múltiples `brokers`, manejando grandes volúmenes de datos de manera eficiente. También proporciona fuertes garantías de durabilidad al persistir los mensajes en disco, asegurando la tolerancia a fallos y la durabilidad de los datos.

### RabbitMQ

Ofrece una entrega de mensajes confiable al proporcionar características como `acknowledgements` y persistencia de mensajes. Puede manejar miles de mensajes por segundo, haciéndolo adecuado para casos de uso con requisitos de rendimiento moderados. Su arquitectura centralizada puede introducir cierta sobrecarga de rendimiento, pero ofrece robustez e integridad de mensajes. Aunque escala verticalmente, las capacidades de escalamiento horizontal son limitadas en comparación con Kafka.

## Casos de Uso Ideales para Kafka y RabbitMQ

### Kafka

Ideal para una amplia variedad de diferentes casos de uso:

- Análisis en tiempo real y aplicaciones de `streaming`
- `Event sourcing`, ingesta y `log aggregation`, especialmente cuando se trata de `big data`.
- `Data pipelines` y comunicación de microservicios con procesamiento de mensajes de alto volumen
- Aplicaciones que requieren alta escalabilidad y tolerancia a fallos

### RabbitMQ

Adecuado para:

- `Task processing`, integración de servicios, `workflow orchestration` y gestión de flujos de trabajo, incluidas métricas y notificaciones.
- Comunicación asíncrona entre microservicios
- Sistemas de mensajería empresarial con entrega confiable de mensajes, incluida la prioridad de mensajes y necesidades de enrutamiento complejas específicas.

La flexibilidad de RabbitMQ para soportar patrones de mensajería como `point-to-point`, `publish-subscribe` y `request-response` lo hace útil en varios escenarios de aplicación.

## Guía para tomar una decisión adecuada

En última instancia, la elección óptima depende de tus necesidades específicas:

- ¿Priorizas el alto rendimiento y el procesamiento de datos en tiempo real? Usa Kafka.
- ¿Necesitas una entrega de mensajes confiable y un enrutamiento flexible para cargas de trabajo moderadas? Usa RabbitMQ.
- ¿Consideras el `message replay` y la `log aggregation`? Kafka emerge como el candidato fuerte.
- ¿Buscas una escalabilidad perfecta para la comunicación de microservicios con alto volumen? Kafka los soporta.

**Recuerda**: Ninguno es inherentemente "mejor". Analizar tus requisitos específicos y considerar factores como la redundancia, la escalabilidad, el alto rendimiento, la alta disponibilidad, una API a gran escala y la seguridad son vitales para tomar una decisión informada.

## Aspectos Adicionales a Considerar

- **Complejidad**: La arquitectura distribuida y el registro `append-only` de Kafka podrían requerir más experiencia operativa en comparación con el enfoque más simple basado en colas de RabbitMQ.
- **Comunidad y Soporte**: Ambas plataformas disfrutan de comunidades considerables y desarrollo activo.
- **Integración**: Evalúa las integraciones disponibles con tu infraestructura y herramientas existentes.

## Eligiendo el Camino Correcto para tu Arquitectura Basada en Eventos

Con una comprensión clara de las diferencias arquitectónicas, los puntos de referencia de rendimiento y los casos de uso ideales, puedes elegir con confianza entre Kafka y RabbitMQ. Entonces, sumérgete en las necesidades específicas de tu proyecto y embárcate en el viaje hacia una arquitectura robusta y eficiente basada en eventos.