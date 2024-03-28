---
title: Monitorización de sistemas distribuidos
author: Romer Alvarez
pubDatetime: 2023-12-06T21:20:25Z
postSlug: monitorizacion-de-sistemas-distribuidos
featured: true
draft: false
tags:
  - Cloud
  - DevOps
  - sistemas-distribuidos
ogImage: /assets/Azure/monitoring-distribuited-systems.png
description: Descubre estrategias de los expertos SRE de Google para la monitorización eficiente de sistemas distribuidos, abarcando desde la importancia del monitoreo de caja blanca y negra hasta las cuatro señales doradas de la infraestructura en la nube.
---

# Monitorización de sistemas distribuidos

Hoy en día los **sistemas distribuidos son la norma**, no la excepción. La mayoría de las aplicaciones modernas se basan en **microservicios**, que se ejecutan en **contenedores**, que se ejecutan en **clústeres de orquestación** de **contenedores**, que se ejecutan en **la nube**. La complejidad de estos sistemas distribuidos hace que sea difícil determinar dónde se encuentra el problema cuando algo sale mal.

Para un SRE, **la observabilidad es primordial**. Los datos **no solo potencian una experiencia de desarrollo óptima sino que también brindan soporte crítico a los stakeholders**, ofreciendo métricas esenciales y aportando insights valiosos para la toma de decisiones empresariales.

![Sistema distribuido de Azure](/assets/Azure/architecture-telehealth-system.png)

La monitorización y alertas **permiten a un sistema decirnos cuando algo está roto, o quizás, cuando va a romperse.**.. 
Monitorizar una aplicación compleja **es una tarea que requiere un importante esfuerzo de ingeniería en si mismo**. Incluso con una importante infraestructura de monitorización esta tarea puede ser muy compleja.

Al abordar la monitorización en los sistemas distribuidos, es **crucial establecer expectativas razonables**; es decir, esto implica reconocer el alcance de lo que la **monitorización puede y debe hacer, cómo se debe responder a las alertas y qué nivel de precisión y complejidad es manejable sin sobrecargar al personal o al sistema**. Se busca equilibrar la necesidad de vigilancia detallada con la eficiencia operativa, para que el equipo pueda enfocarse en problemas reales y no en falsas alarmas. 

La monitorización **no debe convertirse en una tarea hercúlea**; en lugar de ellos, **debe ser un proceso ingenioso y bien orquestado**, los equipos de SRE de Google dentro de grupos de 10 a 12 miembros, por lo general uno o dos se dedican a la creación y mantenimiento de sistemas de monitoreo.

En este sentido, los sistemas que monitorizan deben ser lo suficientemente robustos para alertar sobre anomalías críticas, sin caer en la trampa de la sobrecarga informativa con jerarquías de dependencias complejas o alertas basadas en "magia" automatizada. La meta es mantener la monitorización tan simple y comprensible que cualquier miembro del equipo pueda responder eficientemente desde el primer síntoma hasta el análisis profundo de la causa raíz. Este es un principio fundamental para sostener un sistema de alerta efectivo: maximizar la señal y minimizar el ruido, asegurando que cada alerta sea significativa y que cada respuesta requiera una acción inteligente e informada.

## Sintomas vs Causas

Nuestro sistema de monitorización debe responder dos preguntas ¿Qué está pasando? y ¿Por qué está pasando?.  

Por ejemplo:

| Síntoma    | Causa                      |
| ---------------- | ----------------------------- |
|   Estoy respondiendos errores 500's o 400's   | Resulta que la base de datos está rechazando las conexiones    |
| Mis respuestas son muy lentas  | La CPU está sobrecargada                   |

## Whitebox monitoring vs Blackbox monitoring

### Whitebox monitoring

Se trata de la **monitorización basada en métricas expuestas por las partes internas del sistema**, incluyendo logs, interfaces como la Java Virtual Machine Profiling Interface, o un HTTP handler que emita señales internas.

### Blackbox monitoring

Se enfoca en **la funcionalidad externa del sistema**, **sin considerar su funcionamiento interno**. Esta metodología es crucial para evaluar la experiencia del **usuario final** y garantizar que el sistema cumpla con los requisitos operativos y de negocio.

La combinación de ambos enfoques es vital para una **estrategia de monitorización integral.** Mientras que el monitoreo de caja blanca es **proactivo y orientado a la prevención,** el de caja negra es reactivo y centrado en la **experiencia del usuario.**

## Las cuatro señales doradas

Google expone en su libro [Site Reliability Engineering](https://landing.google.com/sre/sre-book/toc/) **las cuatro señales doradas** para monitorizar y **recomienda centrarse en los siguientes cuatro parametros**:

### Latencia

Se refiere al tiempo que tarda en **procesarse una solicitud**. Es importante distinguir en las solicitudes que han sido atendidas y las solicitudes fallidas. Por ejemplo, un error **HTTP 500** por la pérdida de conexión con una base de datos u otro backend puede procesarse rápidamente, pero sigue siendo un **indicador de fallo**. Por tanto, incluir estos errores en el cálculo de la latencia general puede llevar a **interpretaciones erróneas**. Además, un error lento es aún más problemático que un error rápido, lo que hace vital **rastrear la latencia de los errores**.


### Tráfico

Mide la **demanda que se ejerce sobre el sistema**. En un servicio web, esto puede traducirse en **solicitudes HTTP por segundo**, diferenciadas según el tipo de solicitud (contenido estático versus dinámico). Para otros sistemas, como el streaming de audio o almacenamiento de clave-valor, el tráfico podría medirse en **tasa de I/O de red** o **transacciones por segundo**.

### Errores

Esta métrica **cuantifica la tasa de solicitudes fallidas**. Los errores pueden ser explícitos (como los **errores HTTP 500**), implícitos (por ejemplo, una respuesta correcta HTTP 200 con contenido erróneo), o definidos por política (por ejemplo, cualquier solicitud que exceda un tiempo de respuesta comprometido se considera un error). Monitorear errores requiere una estrategia que abarque desde la **detección de fallos completos** en el balanceador de carga hasta **pruebas de sistema de extremo a extremo** para errores más sutiles.

### Saturación

Indica cuán **"lleno"** está el servicio. Se enfoca en los **recursos más limitados del sistema** (por ejemplo, memoria en sistemas con restricciones de memoria, o I/O en sistemas con limitaciones de entrada/salida). La saturación no solo se mide por el uso actual, sino también por la **capacidad del sistema para manejar cargas crecientes**. La latencia suele ser un **indicador anticipado de saturación**, y medir tiempos de respuesta en percentiles altos (como el 99%) en ventanas cortas de tiempo puede alertar tempranamente sobre posibles saturaciones. También es importante predecir **la saturación inminente**, como un disco duro que se llenará en unas horas.

Al monitorear estas cuatro señales doradas y alertar a los responsables ante cualquier indicio de problema (o potencial problema en el caso de la saturación), se asegura una cobertura de monitoreo **adecuada y eficaz para el servicio**.


### **Preocupándose por la "Cola" de las Solicitudes: Instrumentación y Rendimiento**

Cuando se construye un sistema de monitoreo desde cero, es tentador diseñar un sistema basado en la media de alguna cantidad: la latencia media, el uso medio de CPU de tus nodos, o la plenitud media de tus bases de datos. El peligro presentado por los dos últimos casos es obvio: las CPUs y las bases de datos pueden utilizarse de manera muy desigual. Lo mismo ocurre con la latencia. Si operas un servicio web con una latencia promedio de 100 ms a 1,000 solicitudes por segundo, el 1% de las solicitudes podría tardar fácilmente 5 segundos. Si tus usuarios dependen de varios de estos servicios web para renderizar su página, el percentil 99 de una backend puede convertirse fácilmente en la respuesta mediana de tu frontend.

La forma más sencilla de diferenciar entre un promedio lento y una "cola" muy lenta de solicitudes es recolectar conteos de solicitudes agrupadas por latencias (adecuado para representar un histograma), en lugar de latencias reales: ¿cuántas solicitudes serví que tardaron entre 0 ms y 10 ms, entre 10 ms y 30 ms, entre 30 ms y 100 ms, entre 100 ms y 300 ms, y así sucesivamente? Distribuir los límites del histograma aproximadamente de manera exponencial (en este caso por factores de aproximadamente 3) es a menudo una forma fácil de visualizar la distribución de tus solicitudes.

### Eligiendo una solución apropiada de monitorización

Diferentes aspectos de un sistema deben medirse con distintos niveles de granularidad. Por ejemplo:

* Observar **la carga de CPU** durante un minuto no revelará picos de larga duración que pueden causar altas latencias en la "cola" de solicitudes.

* Por otro lado, para un servicio web que busca no más de **9 horas de tiempo de inactividad anual** (99.9% de tiempo de actividad anual), sondear un estado de éxito 200 más de una o dos veces por minuto probablemente es excesivo.

* De manera similar, verificar la plenitud del disco duro para un servicio que apunta a una disponibilidad del **99.9%** más de una vez cada 1-2 minutos probablemente también sea innecesario.

Es importante ser cuidadoso en cómo estructuras la granularidad de tus mediciones. Recopilar medidas de carga de CPU por segundo puede proporcionar datos interesantes, pero tales mediciones frecuentes pueden ser muy costosas en términos de recolección, almacenamiento y análisis. Si tu objetivo de monitoreo requiere alta resolución pero no requiere una latencia extremadamente baja, puedes reducir estos costos realizando un muestreo interno en el servidor y luego configurando un sistema externo para recolectar y agregar esa distribución a lo largo del tiempo o a través de servidores. Podrías:

* Registrar la **utilización actual de CPU** cada segundo.

* Utilizando **cubos de granularidad del 5%**, incrementar el cubo de utilización de CPU adecuado cada segundo.

* Agregar esos valores **cada minuto**.

Esta estrategia te permite observar breves picos de CPU sin incurrir en costos muy altos debido a la recolección y retención de datos.

Apilar todos estos requisitos puede resultar en un sistema de monitoreo extremadamente complejo. Tu sistema podría terminar con los siguientes niveles de complejidad:

* **Alertas** en diferentes umbrales de latencia, en distintos percentiles, en todo tipo de métricas diferentes.

* **Código adicional** para detectar y exponer posibles causas.

* **Tableros asociados** para cada una de estas posibles causas.

Las fuentes de complejidad potencial son infinitas. Como todos los sistemas de software, el monitoreo puede volverse tan complejo que se hace frágil, complicado de cambiar y una carga de mantenimiento.

Por lo tanto, diseña tu sistema de monitoreo con un enfoque en la **simplicidad**. Al elegir qué monitorear, tomamos en cuenta las siguientes pautas:

* Las reglas que detectan incidentes reales con mayor frecuencia deben ser lo más **simples, predecibles y confiables posible**.

* Las señales que se recopilan, pero no se exponen en ningún tablero predefinido ni se utilizan en ninguna alerta, deberían ser eliminadas porque no son útiles.

## Conclusión

Una canalización de monitoreo y alertas saludable es **simple y fácil de entender**. Se centra principalmente **en síntomas para las páginas**, reservando heurísticas orientadas a la causa como ayudas para depurar problemas. **Monitorear síntomas es más fácil cuanto más "arriba" en tu pila los monitorees, aunque monitorear la saturación y el rendimiento de subsistemas como bases de datos a menudo debe realizarse directamente en el subsistema en sí**. Las alertas **por correo electrónico son de valor muy limitado** y tienden a llenarse fácilmente de ruido; en su lugar, debes favorecer un **dashboard de control que monitoree todos los problemas subcríticos en curso para el tipo de información que típicamente termina en alertas por correo electrónico**. Un dashboard también podría combinarse con un registro, para analizar correlaciones históricas.

A largo plazo, lograr una rotación de guardia exitosa y un producto incluye optar por alertar sobre síntomas o problemas reales inminentes, adaptar tus objetivos a metas que sean realmente alcanzables y asegurarte de que tu monitoreo apoye un diagnóstico rápido.



