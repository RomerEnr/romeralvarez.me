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

# Arquitectura Kafka vs RabbitMQ

Cuando hablamos de sistemas distribuidos y alta concurrencia y aplicaciones que tienen que escalar a un volumen elevado de peticiones por segundo, operaciones asíncronas aparece un elemento que tiene que ver con las colas de mensajería, a partir de ahí hay varias tecnologías con sus pros y sus contras, las principales son `Kafka` y `RabbitMQ`. En este articulo de blog, vamos a explorar ambas tecnologías, algunos casos de uso que nos ayudaran a determinar cuando es "mejor" utilizar una tecnología u otra.

## Kafka

Apache Kafka es una plataforma de transmisión de eventos distribuida de código abierto conocida por sus capacidades de alto rendimiento, tolerancia a fallos y procesamiento de datos en tiempo real. Kafka sigue un modelo de publicación-suscripción donde los productores escriben mensajes en `topics`, y los consumidores se suscriben a esos `topics` para recibir los mensajes. Kafka almacena los mensajes en un `distributed commit log`, permitiendo una alta escalabilidad y tolerancia a fallos. Esto permite un alto rendimiento y capacidades de reproducción de mensajes, haciéndolo ideal para el procesamiento de datos en tiempo real y el `event sourcing`.

La arquitectura de Kafka consta de tres componentes principales: `producers`, `brokers` y `consumers`. Los `producers` publican mensajes en los `topics` de Kafka, y los `brokers` son responsables de almacenar y replicar los datos en el clúster de Kafka. Los `consumers` leen datos de uno o más `topics`, permitiendo el procesamiento paralelo y la escalabilidad.

## RabbitMQ

RabbitMQ es un `message broker` flexible y de código abierto que implementa el protocolo `AMQP`. Sigue un modelo tradicional de `message queue`, permitiendo que las aplicaciones se comuniquen de forma asíncrona mediante el envío y la recepción de mensajes y la entrega de mensajes en orden a consumidores específicos. Esto garantiza un orden de mensajes confiable y flexibilidad en el `message routing`, haciéndolo adecuado para el procesamiento de tareas y la comunicación de microservicios.

La arquitectura de RabbitMQ se centra en un `message broker` central, que actúa como intermediario entre productores y consumidores. Para la replicación y retención de mensajes, los productores envían mensajes a los `exchanges`, y esos `exchanges` enrutan los mensajes a las `queues` basándose en reglas predefinidas. Los consumidores luego recuperan los mensajes de las colas y los procesan.

## Entre Kafka y RabbitMQ hay 2 diferencias fundamentales:

Está el sistema del `Broker` que es el intermediario, es la infraestructura y como funciona por dentro cada una de las tecnologías ya mencionadas. Por otro lado esta la parte del `Consumer`que indica como consumimos de este `Broker` que cambia mucho.

### RabbitMQ
  * En RabbitMQ el `Broker` se le considera un `Smart Broker` el `Broker` hace mucho trabajo como el enrutamiento, la persistencia, la entrega de mensajes, etc. Mientras que los `Consumers` son `Dumb Consumers` que solo consumen mensajes.
  * 

## Rendimiento

En cuanto al rendimiento, Kafka y RabbitMQ tienen una funcionalidad similar pero diferentes fortalezas.

### Kafka

Sobresale en escenarios de transmisión de datos en tiempo real y de alto rendimiento, alardeando de una excelente escalabilidad y baja latencia. Puede manejar millones de mensajes por segundo, haciéndolo adecuado para casos de uso que requieren un procesamiento de datos rápido y continuo. Su arquitectura permite la escalabilidad horizontal distribuyendo la carga de trabajo entre múltiples `brokers`, manejando grandes volúmenes de datos de manera eficiente. También proporciona fuertes garantías de durabilidad al persistir los mensajes en disco, asegurando la tolerancia a fallos y la durabilidad de los datos.

### RabbitMQ

Ofrece una entrega de mensajes confiable al proporcionar características como `acknowledgements` y persistencia de mensajes. Puede manejar miles de mensajes por segundo, haciéndolo adecuado para casos de uso con requisitos de rendimiento moderados. Su arquitectura centralizada puede introducir cierta sobrecarga de rendimiento, pero ofrece robustez e integridad de mensajes. Aunque escala verticalmente, las capacidades de escalamiento horizontal son limitadas en comparación con Kafka.

## Casos de Uso

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

## Tomando la Decisión

En última instancia, la elección óptima depende de tus necesidades específicas:

- ¿Priorizas el alto rendimiento y el procesamiento de datos en tiempo real? Usa Kafka.
- ¿Necesitas una entrega de mensajes confiable y un enrutamiento flexible para cargas de trabajo moderadas? Usa RabbitMQ.
- ¿Consideras el `message replay` y la `log aggregation`? Kafka emerge como el candidato fuerte.
- ¿Buscas una escalabilidad perfecta para la comunicación de microservicios con alto volumen? Kafka los soporta.

Recuerda: Ninguno es inherentemente "mejor". Analizar tus requisitos específicos y considerar factores como la redundancia, la escalabilidad, el alto rendimiento, la alta disponibilidad, una API a gran escala y la seguridad son vitales para tomar una decisión informada.

## Consideraciones Adicionales

- Complejidad: La arquitectura distribuida y el registro `append-only` de Kafka podrían requerir más experiencia operativa en comparación con el enfoque más simple basado en colas de RabbitMQ.
- Comunidad y Soporte: Ambas plataformas disfrutan de comunidades considerables y desarrollo activo.
- Integración: Evalúa las integraciones disponibles con tu infraestructura y herramientas existentes.

## Conclusión

Con una comprensión clara de las diferencias arquitectónicas, los puntos de referencia de rendimiento y los casos de uso ideales, puedes elegir con confianza entre Kafka y RabbitMQ. Entonces, sumérgete en las necesidades específicas de tu proyecto y embárcate en el viaje hacia una arquitectura robusta y eficiente basada en eventos.