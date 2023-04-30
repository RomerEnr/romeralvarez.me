---
title: Threads introducción a hilos y concurrencia en Java
author: Romer Alvarez
pubDatetime: 2023-04-30T14:00:00Z
postSlug: Introducción a hilos y concurrencia
featured: true
draft: false
tags:
  - java
  - hilos y concurrencia
  - POO
ogImage: https://cdn.midjourney.com/f6a9b25f-4fa1-48b3-a1aa-a209aa977f4c/0_0.png
description: La concurrencia y la programación multihilo son técnicas poderosas para mejorar el rendimiento y la capacidad de respuesta de las aplicaciones. Sin embargo, su uso también puede generar desafíos únicos. Aquí te presentamos algunas buenas prácticas y consideraciones a tener en cuenta al utilizar hilos y concurrencia en tus proyectos Java.
---
# Threads: Hilos y concurrencia

Los **hilos** son objetos que nos dan la capacidad de hacer más de una tarea al mismo tiempo.

### Características de los hilos

- La máquina virtual de Java es un sistema **multi hilos** capaz de ejecutar varias tareas al mismo tiempo.
- Java soporta **Thread** con algunas clases e interfaces y con métodos específicos en la clase `**Object**`.
- La JVM gestiona todos los detalles, asignación de tiempos de ejecución, prioridades, de forma similar a como gestiona un sistema operativo.

```java
class MiHilo extends Thread {
    private String nombre;

    public MiHilo(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {
                // Pausamos el hilo por 500 milisegundos
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("Error en la pausa del hilo: " + e.getMessage());
            }
        }
    }
}

public class EjemploThread {
    public static void main(String[] args) {

        MiHilo hilo1 = new MiHilo("Hilo 1");
        MiHilo hilo2 = new MiHilo("Hilo 2");

        hilo1.start();
        hilo2.start();
    }
}
```

Al heredar de la clase `**Thread**`, podremos **sobreescribir** el método `**.run()**` pero este **no se llama nunca explicitamente**, se manda a llamar con el método `**.start()**`, son tareas que se ejecutan dentro de un proceso:

Este ejemplo crea dos hilos **(hilo1 y hilo2)** que **imprimen su contador hasta 5 con una pausa de 500 milisegundos entre cada iteración.** La clase `MiHilo` extiende de la clase `**Thread**` y **sobreescribe** el método `**run()**` con el código que se desea ejecutar en cada hilo. Para iniciar los hilos, se llama al método `start()` en las instancias de la clase `MiHilo`.

### Interfaz runnable

También tenemos **una manera que es más desacoplada** de realizar esta acción que es a través de la **interfaz** `**Runnable**` y también implementa el método `**.run()**`

```java
class MiTarea implements Runnable {
    private String nombre;

    public MiTarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {
                // Pausamos el hilo por 500 milisegundos
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("Error en la pausa del hilo: " + e.getMessage());
            }
        }
    }
}

public class EjemploRunnable {
    public static void main(String[] args) {
        // Creamos instancias de la clase MiTarea
        MiTarea tarea1 = new MiTarea("Tarea 1");
        MiTarea tarea2 = new MiTarea("Tarea 2");

        // Creamos instancias de la clase Thread y le pasamos las tareas como argumento
        Thread hilo1 = new Thread(tarea1);
        Thread hilo2 = new Thread(tarea2);

        // Iniciamos la ejecución de los hilos con el método start()
        hilo1.start();
        hilo2.start();
    }
}
```

En este caso, la clase `**MiTarea**` **implementa la interfaz** `**Runnable**` en lugar de **extender de la clase `Thread`**. En lugar de crear instancias de la clase `**MiTarea**` directamente, **creamos instancias de la clase** `**Thread**`, le pasamos por el constructor los objetos instanciados de `**MiTarea**` e iniciamos la ejecución con el método `**.start()**`.

### ¿Qué ganamos implementando el hilo de esta manera?

Tenemos una serie de ventajas al implementar la **interfaz** `Runnable` como:

- Nos permite **establecer una jerarquía de clases** ¿Qué quiere decir esto? Si ya estás he**redando de una clase no puedes extender de la clase** `Threads` a,por lo tanto no podemos establecer una jerarquía de clases.
    
    Al implementar la **interfaz `Runnable`**, **puedes mantener la herencia de la otra clase**, y al mismo tiempo, **tener un hilo en tu clase.**
    
- La **interfaz** **`Runnable`** **permite separar la lógica** **del hilo** de ejecución (el método `**run()**`) de la lógica de control de hilo (`**Thread**` como `**start()**` `**sleep()**`, etc.) De esta manera **puedes reutilizar la lógica** del hilo (`**Runnable**`)en diferentes contextos.
- **Facilita el uso de frameworks y APIs modernas:** Muchos frameworks y APIs de concurrencia modernos en **Java**, como **ExecutorService** o **CompletableFuture**, trabajan con objetos `Runnable` o `Callable` (**una variante de Runnable que permite devolver un valor**) en lugar de instancias de la clase Thread.

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

class MiTarea implements Runnable {
    private String nombre;

    public MiTarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {

                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("Error en la pausa del hilo: " + e.getMessage());
            }
        }
    }
}

public class EjemploRunnableExecutorService {
    public static void main(String[] args) {

        MiTarea tarea1 = new MiTarea("Tarea 1");
        MiTarea tarea2 = new MiTarea("Tarea 2");
        MiTarea tarea3 = new MiTarea("Tarea 3");

        ExecutorService executor = Executors.newFixedThreadPool(3);

        executor.submit(tarea1);
        executor.submit(tarea2);
        executor.submit(tarea3);

        executor.shutdown();
    }
}
```

### Ciclo de vida de un Thread: New

- Esto es un **Hilo** que se ha creado pero aún no se ha iniciado con el método `start()`:

```java
Runnable runnable = new Tarea();
Thread t = new Thread(runnable);

System.out.printl(t.getState()); // NEW  
```

### Ciclo de vida de un Thread: Runnable

- La siguiente parte es un **RUNNABLE** está en **estado ejecutable** se ha creado e iniciado con el `**start()**`:

```java
Runnable runnable = new Tarea();
Thread t = new Thread(runnable);

t.start();

System.out.printl(t.getState()); // RUNNABLE
```

### Ciclo de vida de un Thread: Blocked

- El siguiente estado es **BLOCKED** cuando es elegible para ejecutarse.
- Es aquel que **no puede continuar con su ejecución debido a que está esperando el acceso a un recurso compartido** o la liberación de un bloqueo. **Un hilo puede entrar en este estado en diferentes situaciones como cuando**:
    - Espera **adquirir un bloqueo para entrar a una sección sincronizada**: Un hilo puede entrar en estado bloqueado **cuando intenta ingresar a una sección de código sincronizado que ya está siendo ejecutada por otro hilo.** En este caso, **el hilo esperará hasta que el hilo que actualmente posee el bloqueo libere dicho recurso.**
    - Espera a que otro hilo lo notifique: **Un hilo puede entrar en estado bloqueado al llamar al método `wait()`** en un objeto. En este caso, **el hilo esperará hasta que otro hilo llame al método** `**notify()**` o `**notifyAll()**` en el mismo objeto.

```java
class Contador {
    private int cuenta;

    public synchronized void incrementar() {
        cuenta++;
        System.out.println("Cuenta incrementada a: " + cuenta);
    }
}

class TareaIncremento implements Runnable {
    private Contador contador;

    public TareaIncremento(Contador contador) {
        this.contador = contador;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            contador.incrementar();
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

public class EjemploBloqueoSincronizado {
    public static void main(String[] args) {
        Contador contador = new Contador();
        TareaIncremento tarea1 = new TareaIncremento(contador);
        TareaIncremento tarea2 = new TareaIncremento(contador);

        Thread hilo1 = new Thread(tarea1);
        Thread hilo2 = new Thread(tarea2);

        hilo1.start();
        hilo2.start();
    }
}
```

En este ejemplo, tenemos una clase Contador con un método sincronizado `**incrementar()**`. La clase `**TareaIncremento**` implementa `**Runnable**` y en su método `**run()**` **llama al método** `**incrementar()**` de la instancia compartida de `**Contador**`. **Al ejecutar dos instancias de** `**TareaIncremento**` **en paralelo, uno de los hilos podría quedar bloqueado** al intentar ingresar al método `**incrementar()**` mientras el otro hilo ya está ejecutándolo.

```java
class Mensaje {
    private String contenido;
    private boolean disponible = false;

    public synchronized String recibir() {
        while (!disponible) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        disponible = false;
        notifyAll();
        return contenido;
    }

    public synchronized void enviar(String mensaje) {
        while (disponible) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        contenido = mensaje;
        disponible = true;
        notifyAll();
    }
}

class Emisor implements Runnable {
    private Mensaje mensaje;

    public Emisor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        String[] mensajes = {
            "Mensaje 1",
            "Mensaje 2",
            "Mensaje 3",
            "Mensaje 4",
            "Mensaje 5"
        };

        for (String msg : mensajes) {
            mensaje.enviar(msg);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

class Receptor implements Runnable {
    private Mensaje mensaje;

    public Receptor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            String msgRecibido = mensaje.recibir();
            System.out.println("Mensaje recibido: " + msgRecibido);
        }
    }
}

public class EjemploBloqueoNotificacion {
    public static void main(String[] args) {
        Mensaje mensaje = new Mensaje();
        Emisor emisor = new Emisor(mensaje);
        Receptor receptor = new Receptor(mensaje);

        Thread hiloEmisor = new Thread(emisor);
        Thread hiloReceptor = new Thread(receptor);

        hiloEmisor.start();
        hiloReceptor.start();
    }
}
```

En este ejemplo, tenemos una clase `Mensaje` que contiene un método sincronizado `**enviar()**` y un método sincronizado `**recibir(**)`. Estos métodos hacen uso de `**wait()**` y `**notifyAll()**` para coordinar la comunicación entre un emisor y un receptor. El emisor envía mensajes y el receptor los recibe.

La clase `**Emisor**` implementa `**Runnable**` y, en su método `**run()`,** envía mensajes a través del objeto compartido `**Mensaje**`. Por otro lado, la clase `**Receptor**` también implementa `**Runnable**` y, en su método `**run()**`, recibe los mensajes enviados por el `**Emisor**`.

Cuando se ejecutan los hilos de `**Emisor**` y `**Receptor**` en paralelo, los hilos pueden entrar en estado bloqueado al llamar al método `**wait()**` si están esperando una notificación para continuar su ejecución. Por ejemplo, el `**Receptor**` podría quedar bloqueado al llamar al método `**recibir()**` si no hay mensajes disponibles, mientras que el `**Emisor**` podría quedar bloqueado al llamar al método `**enviar()**` si el `**Receptor**` aún no ha recibido el mensaje anterior. En ambos casos, los hilos continuarán su ejecución una vez que reciban la notificación correspondiente a través del método `**notifyAll()**`.

### Ciclo de vida de un Thread: Waiting

- Un hilo está en estado **********WAITING********** cuando está esperando que otro hilo realice una acción en particular.
- Un hilo puede entrar en este estado llamando a cualquiera de los dos métodos `**wait()**` y `**join()**`
- Estos métodos se utilizan para sincronizar la ejecución de múltiples hilos, a menudo cuando un hilo depende del resultado o la finalización de otro hilo.

```java
class Mensaje {
    private String contenido;

    public synchronized String recibir() {
        while (contenido == null) {
            try {
                wait();
            } catch (InterruptedException e) {
                System.out.println("Error en la espera del hilo: " + e.getMessage());
            }
        }
        String mensaje = contenido;
        contenido = null;
        notify();
        return mensaje;
    }

    public synchronized void enviar(String mensaje) {
        while (contenido != null) {
            try {
                wait();
            } catch (InterruptedException e) {
                System.out.println("Error en la espera del hilo: " + e.getMessage());
            }
        }
        contenido = mensaje;
        notify();
    }
}

class Emisor implements Runnable {
    private Mensaje mensaje;

    public Emisor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        String[] mensajes = {"Hola", "¿Cómo estás?", "Hasta luego"};
        for (String m : mensajes) {
            mensaje.enviar(m);
        }
    }
}

class Receptor implements Runnable {
    private Mensaje mensaje;

    public Receptor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        for (int i = 0; i < 3; i++) {
            String m = mensaje.recibir();
            System.out.println("Mensaje recibido: " + m);
        }
    }
}

public class EjemploWaiting {
    public static void main(String[] args) {
        Mensaje mensaje = new Mensaje();
        new Thread(new Emisor(mensaje)).start();
        new Thread(new Receptor(mensaje)).start();
    }
}
```

En este ejemplo, la clase **`Mensaje`** tiene dos métodos sincronizados, **`enviar()`** y **`recibir()`**, que utilizan **`Object.wait()`** y **`Object.notify()`** para coordinar la comunicación entre un hilo emisor y un hilo receptor. Cuando un hilo llama a **`recibir()`**, espera hasta que haya un mensaje disponible (contenido != null). De manera similar, cuando un hilo llama a **`enviar()`**, espera hasta que el mensaje anterior haya sido recibido (contenido == null). Cuando se cumplen estas condiciones, los hilos utilizan **`Object.notify()`** para notificar al otro hilo que puede continuar con su ejecución. En este caso, los hilos entran en estado "waiting" cuando llaman a `**Object.wait()`** y salen de este estado cuando otro hilo llma **`Object.notify()`** sobre el mismo objeto.

El método principal en la clase **`EjemploWaiting`** crea un objeto **`Mensaje`**, un hilo **`Emisor`** y un hilo **`Receptor`**. El hilo emisor envía mensajes al hilo receptor a través del objeto **`Mensaje`**. El hilo receptor recibe y muestra los mensajes enviados por el hilo emisor. Ambos hilos se ejecutan en paralelo, y utilizan el objeto **`Mensaje`** para coordinar sus acciones.

En resumen, el estado "waiting" es útil cuando necesitas sincronizar la ejecución de múltiples hilos que dependen unos de otros. En el ejemplo presentado, se utilizan los métodos **`Object.wait()`** y **`Object.notify()`** para lograr esta sincronización, poniendo un hilo en espera hasta que otro hilo notifique su disponibilidad para continuar.

### Ciclo de vida de un Thread: Terminated.

- Es un hilo que ha completado su ejecución. En otras palabras, el hilo ha finalizado su tarea y ya no está activido ni listo para ejecutar nada.
- Un hilo entra en terminated por las siguientes razones:
    1. El método **`run()`** del hilo ha finalizado normalmente, es decir, ha ejecutado todas las instrucciones contenidas en él y ha llegado al final del método.
    2. Ha ocurrido una excepción no controlada en el método **`run()`** y no se ha manejado mediante un bloque **`try-catch`**. En este caso, el hilo se detiene abruptamente y entra en estado TERMINATED.
    3. El hilo ha sido interrumpido por otro hilo mediante la llamada al método **`interrupt()`** y el hilo interrumpido ha manejado la interrupción, finalizando su ejecución.

```java
class MiTarea implements Runnable {
    private String nombre;

    public MiTarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println(nombre + " fue interrumpido. " + e.getMessage());

                return;
            }
        }
    }
}

public class EjemploTerminated {
    public static void main(String[] args) throws InterruptedException {

        MiTarea tarea = new MiTarea("Tarea 1");

        Thread hilo = new Thread(tarea);

        hilo.start();

        Thread.sleep(2000);

        hilo.interrupt();

        hilo.join();

        System.out.println("Estado del hilo: " + hilo.getState());
    }
}
```

En este ejemplo, creamos una tarea llamada "MiTarea" que implementa la interfaz Runnable. El método **`run()`** de la tarea realiza un bucle con un contador hasta 5 y duerme el hilo por 500 milisegundos en cada iteración.

En el método **`main`**, creamos un hilo con la tarea y lo iniciamos. Después de esperar 2 segundos, interrumpimos el hilo llamando al método **`interrupt()`**. Dentro del método **`run()`**, manejamos la interrupción en el bloque **`catch`** y salimos del método **`run()`** usando **`return`**. Luego, esperamos a que el hilo termine su ejecución con el método **`join()`** y mostramos el estado del hilo, que debería ser "TERMINATED".

## En conlusión:

Para concluir con el articulo te brindo una serie de recomendaciones a la hora de implementar hilos en tu código de Java.

La concurrencia y la programación multihilo son técnicas poderosas para mejorar el rendimiento y la capacidad de respuesta de las aplicaciones. Sin embargo, su uso también puede generar desafíos únicos. Aquí te presentamos algunas buenas prácticas y consideraciones a tener en cuenta al utilizar hilos y concurrencia en tus proyectos Java.

1. **Evitar la herencia de la clase Thread**: En lugar de extender la clase Thread, implementa la interfaz Runnable o Callable. Esto te proporciona un diseño más desacoplado y flexible, evitando problemas de herencia múltiple y facilitando la integración con frameworks modernos.
2. **Utilizar ExecutorService**: En lugar de gestionar manualmente la creación y terminación de hilos, utiliza el framework ExecutorService. Este facilita el control de la concurrencia, la reutilización de hilos y la gestión de recursos del sistema.
3. **Sincronizar el acceso a recursos compartidos**: Asegúrate de sincronizar el acceso a recursos compartidos entre hilos para evitar condiciones de carrera y comportamientos indeterminados. Puedes utilizar bloques **`synchronized`**, clases de bloqueo (**`Lock`**, **`ReentrantLock`**) o estructuras de datos concurrentes (**`ConcurrentHashMap`**, **`CopyOnWriteArrayList`**, etc.).
4. **Evitar bloqueos (deadlocks)**: Un bloqueo ocurre cuando dos o más hilos esperan eternamente el recurso que otro hilo tiene bloqueado. Para prevenirlos, asegúrate de adquirir bloqueos en un orden consistente y utilizar mecanismos de bloqueo con tiempo de espera (**`tryLock()`**).
5. **Minimizar la contención**: Cuando sea posible, reduce la contención entre hilos utilizando estructuras de datos locales a cada hilo, dividiendo tareas en unidades independientes o utilizando estructuras de datos concurrentes optimizadas.
6. **Manejar adecuadamente las interrupciones**: Al utilizar el método **`Thread.sleep()`**, **`Thread.join()`** o **`Lock.lockInterruptibly()`**, asegúrate de manejar la excepción **`InterruptedException`** correctamente. En general, debes propagar la interrupción llamando a **`Thread.currentThread().interrupt()`** o finalizar el hilo de forma ordenada.
7. **No utilizar `Thread.stop()`, `Thread.suspend()` o `Thread.resume()`**: Estos métodos están en desuso y pueden causar problemas de consistencia y bloqueos. En su lugar, utiliza mecanismos de interrupción y control de estados para finalizar y gestionar hilos.
8. **Prestar atención al rendimiento**: El uso de concurrencia no garantiza automáticamente un mejor rendimiento. Utiliza herramientas de monitoreo y perfiles de rendimiento para analizar el comportamiento de tu aplicación y ajustar la cantidad de hilos o la estrategia de concurrencia según sea necesario.
9. **Probar y depurar rigurosamente**: La programación concurrente puede generar comportamientos indeterminados y difíciles de reproducir. Utiliza herramientas de depuración de hilos y pruebas unitarias para asegurarte de que tu código concurrente funciona correctamente en diferentes escenarios.
10. **Documentar y comunicar**: Asegúrate de documentar adecuadamente el uso de hilos y concurrencia en tu código. Esto facilitará la comprensión, el mantenimiento y la colaboración con otros desarrolladores. Incluye comentarios en el código y documentación técnica para explicar la lógica y las decisiones de diseño.
11. **Preferir la inmutabilidad**: Utiliza objetos inmutables siempre que sea posible. Los objetos inmutables son aquellos cuyo estado no puede ser modificado una vez creados. Al no permitir cambios en su estado, se eliminan problemas de sincronización y condiciones de carrera.
12. **Usar APIs modernas de concurrencia**: Java ofrece APIs modernas y avanzadas para la programación concurrente, como **`CompletableFuture`**, **`ForkJoinPool`** y **`StampedLock`**. Estudia y utiliza estas APIs cuando sea apropiado, ya que suelen ser más eficientes y flexibles que las soluciones más antiguas.
13. **Capacitación y actualización constante**: La programación concurrente y multihilo es un campo en constante evolución. Mantente al tanto de las novedades y actualizaciones en las APIs y frameworks de concurrencia, así como de las mejores prácticas emergentes en la industria. Participar en cursos, conferencias y comunidades en línea te ayudará a mantenerte actualizado y mejorar tus habilidades en esta área.