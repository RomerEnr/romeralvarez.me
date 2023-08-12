---
title: Conociendo Keycloak - Un sistema de autenticación y autorización seguro Open Source
author: Romer Alvarez
pubDatetime: 2023-08-12T14:00:00Z
postSlug: Conociendo-Keycloak
featured: true
draft: false
tags:
  - Java
  - Keycloak 
ogImage: /assets/keycloak/keycloak-logo.png
description: Adiós a sistemas de autenticación complejos. Descubre cómo Keycloak ahorra tiempo, esfuerzo y mejora la seguridad en tu desarrollo.
---

# Introducción a Keycloak - Un sistema de autenticación y autorización seguro Open Source

El desarrollo de aplicaciones a nivel **empresarial es un proceso que requiere más que solo buenas prácticas de programación**. **La seguridad y la gestión de usuarios se han convertido en unos pilares fundamentales**, se exponen datos sensibles, se realizan transacciones monetarias y se almacenan datos personales. Por lo tanto, **es necesario contar con un sistema de autenticación y autorización robusto y seguro.**  

Existen muchos sistemas de autenticación y autorización tales como [Auth0](https://auth0.com/), [Okta](https://www.okta.com/), [AWS Cognito](https://aws.amazon.com/cognito/) y [Firebase](https://firebase.google.com/). En este artículo nos enfocaremos en Keycloak, un sistema de autenticación y autorización Open Source desarrollado por Red Hat.

![Keycloak](/assets/keycloak/keycloak-logo.png)

## **¿Qué es Keycloak y por qué es un apoyo para los desarrolladores?**
**Keycloak es una solución de código abierto para la gestión de identidades y accesos.** Es una herramienta que permite a los desarrolladores agregar funciones de seguridad a sus aplicaciones **con poco esfuerzo y sin tener que escribir código.** Keycloak es compatible con los protocolos de **autenticación y autorización más utilizados**, como **OpenID Connect, OAuth 2.0 y SAML 2.0.** Además, Keycloak es compatible con los estándares de seguridad más recientes, como **JSON Web Token (JWT)** y **Security Assertion Markup Language (SAML).**

## **¿Cómo funciona Keycloak?**
Es necesario para entender el valor que nos ofrece Keycloak conocer como actua Keycloak detrás de escena 

### **Arquitectura básica:**
Keycloak se compone de **dos partes principales:** el servidor de **autenticación** y el **servidor de administración.** El servidor de autenticación es el que se encarga de la **autenticación y autorización** de los usuarios. El servidor de administración es el que se encarga de la **administración de los usuarios, clientes, roles, etc.**  

**Keycloak sigue una arquitectura modular.** Donde en su núcleo, actua como un servidor de **autenticación y autorización**. Las aplicaciones y servicios que desean autenticar a un usuario lo hacen mediante solicitudes al servidor Keycloak (**que es un servidor REST**) que valida al usuario y devuelve un **token de acceso.**

![Imagen de la arquitectura de Keycloak](/assets/keycloak/keycloak-scheme.png)

### **Conceptos clave:**

Para entender como funciona Keycloak es necesario conocer los siguientes conceptos:

* **Realm(reino):** Un **realm** en **Keycloak** es un dominio de **administración, escencialmente un espacio aislado donde se definen todos los usuarios, roles, clientes y otros aspectos relacionados con la seguirdad.** Al intentar autenticar un usuario, la aplicación o ("client") hace referencia a un "realm" específico, garantizando que solo las configuración y permisos de ese "realm" sean aplicables.  

* **Claim:** Un **"claim"** es una **declaración o atributo sobre un usuario.** Por ejemplo, el **nombre de usuario, la dirección de correo electrónico o el rol pueden ser "claims".** Cuando un usuario se autentica exitosamente, Keycloak genera un token de autenticación que puede contener varios "claims", proporcionando información sobre el **usuario autenticado.**  

* **Client(cliente):** Un **"client"** en **Keycloak** se refiere a una **aplicación o servicio que desea autenticar a un usuario.** Al configurarse con **Keycloak**, básicamente se registra dentro de un **"realm"** específico. Cada **"Client"** **puede tener roles asociados, lo que permite determinar que usuarios tienen acceso y qué permisos se les otorgan.**

* **Roles:** Los **roles** definen ciertos privilegios o permisos para los usuarios. Dentro de un "realm", puedes tener roles que se aplican a varios "clients" o roles específicos para un "client" en particular. Al autenticar a un usuario, Keycloak verifica qué roles tiene asignados y, basándose en eso, decide qué "claims" incluir en el token de autenticación, dictando así los permisos del usuario en la aplicación.

![flow de autenticación de Keycloak](/assets/keycloak/keycloak-token-flow.png)

## **Las ventajas de usar Keycloak:**

* **Autenticación centralizada:** Con Keycloak, puedes tener un único punto de autenticación para múltiples aplicaciones y servicios, evitando redundancias.


* **Adaptable a múltiples plataformas:** Desde aplicaciones web hasta servicios en la nube y aplicaciones móviles, Keycloak se integra sin problemas.

* **Modular y personalizable:** Keycloak se puede extender y personalizar, lo que significa que puedes adaptarlo a necesidades específicas.

* **Seguridad reforzada:** Incorpora prácticas de seguridad modernas, como la autenticación de dos factores y protocolos de cifrado avanzado.

## **¿Qué te ahorras al no crear un sistema de autenticación propio?**

Desarrollar un sistema de autenticación desde cero es un desafío considerable debido a que realmente es algo muy complicado, existe el de riesgo del desconocimiento, de que a estos servicios se dedican corporaciones enteras para garantizar la seguridad. Aquí algunos problemas que evitas con Keycloak:

* **Vulnerabilidades de seguridad:** Cada línea de código escrita es una oportunidad para un error, y en la autenticación, los errores pueden ser costosos.
* **Mantenimiento y actualizaciones:** Los estándares y prácticas de seguridad evolucionan. Mantener un sistema propio significa actualizarlo regularmente, lo que consume tiempo y recursos.
* **Interoperabilidad:** Keycloak, al seguir estándares reconocidos, garantiza que pueda interactuar con otras herramientas y servicios sin problemas.  

Para concluir, a la hora de desarrollar aplicaciones que son puestas en producción es necesario contar con un sistema de **autenticación y autorización robusto y seguro.** No veo una razón para no utilizar un sistema así dado que **Keycloak es Open Source y gratuito.** Por otro lado, un servicio como **Keycloak** nos permite ahorrar tiempo y delegar la seguridad a un sistema que se dedica a eso y poder enfocarnos en el desarrollo de la lógica de negocio.