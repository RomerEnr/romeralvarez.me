---
title: Conociendo Keycloak - Revisando, refactorizando y actualizando la implementación.
author: Romer Alvarez
pubDatetime: 2023-08-14T17:42:00Z
postSlug: revisando-refactorizando-y-actualizando-la-implementacion-keycloak
featured: true
draft: false
tags:
  - Java
  - Keycloak 
  - POO
ogImage: /assets/keycloak/keycloak-logo.png
description: Revisión y refactorización de Keycloak; actualizando nuestra implementación en Spring Boot para seguir (o intentar) las buenas prácticas de programación.
---

# Conociendo Keycloak - Revisando, refactorizando y actualizando la implementación.

¡Hola de nuevo! Si recuerdan, en mi [anterior post](https://romeralvarez.me/blog/conociendo-keycloak/) nos metimos de lleno con Keycloak en Spring Boot. Sí, lo sé, la implementación fue un poco rápida y, admito, me salté los test unitarios. 😅 Pero, ¿quién no ha hecho eso alguna vez, cierto?

Por lo tanto, en este post vamos a revisar y refactorizar el código para intentar seguir las buenas prácticas de programación y actualizar la implementación de nuestra pequeña app de Keycloak.

## Revisando el código.

Primero, echemos un ojo a cómo se ve nuestro proyecto en este momento:

```bash
.
├── HELP.md
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── me
    │   │       └── romeralvarez
    │   │           └── springexamplekeycloak
    │   │               ├── SpringExampleKeycloakApplication.java
    │   │               ├── clients
    │   │               │   └── KeycloakClient.java
    │   │               ├── commons
    │   │               │   └── Constants.java
    │   │               ├── configuration
    │   │               │   ├── JwtAuthenticationConverter.java
    │   │               │   └── SecurityConfiguration.java
    │   │               ├── controllers
    │   │               │   ├── KeycloakAuthController.java
    │   │               │   ├── KeycloakController.java
    │   │               │   └── requests
    │   │               │       ├── UserLoginRequest.java
    │   │               │       └── UserRequest.java
    │   │               └── services
    │   │                   ├── KeycloakAuthServiceImpl.java
    │   │                   ├── KeycloakServiceImpl.java
    │   │                   └── interfaces
    │   │                       ├── KeycloakAuthService.java
    │   │                       └── KeycloakService.java
    │   └── resources
    │       ├── application.yaml
    │       ├── banner.txt
    │       ├── static
    │       └── templates
    └── test
        └── java
            └── me
                └── romeralvarez
                    └── springexamplekeycloak
                        └── SpringExampleKeycloakApplicationTests.java
```

* Para empezar, tenemos un cambio muy sencillo, tenemos directorios que no necesitamos, como el directorio `static` y `templates` dentro de `resources`, ya que no vamos a utilizar plantillas ni nada por el estilo. Por lo tanto, vamos a eliminarlos.
* Otro cambio sencillo, vamos a cambiar el paquete `me.romeralvarez.springexamplekeycloak.controllers.requests`a un paquete de DTOs, por lo tanto, vamos a cambiar el nombre del paquete a `me.romeralvarez.springexamplekeycloak.dtos`.

## Constants.java

En esta clase se manejan las constantes de la aplicación, sin embargo, tenemos credenciales, URLs y otros datos que no deberían estar en el código, por lo tanto, vamos a moverlos a un archivo de configuración.

En nuestro caso vamos a mover las constantes a un archivo `application.yaml` en el directorio `resources`, pero lo ideal es tener un servicio de almacenamiento de secretos como **Vault** o **AWS Secrets Manager**.

La decisión que tomaremos, será la de eliminar esta clase y mover las constantes a un archivo `application.yaml` en el directorio `resources`.

```yaml
keycloak:
  url: http://localhost:8080/
  realm-name: spring-boot-realm-dev
  realm-master: master
  admin-cli: admin-cli
  user-console: admin
  user-password: admin
  client-secret: DdWW14rqntQlMvr2AtgCZ1GD7kGSBWsw
  client-id: spring-client-api-rest
```



## KeycloakClient.java

Vamos a revisar el código de la clase `KeycloakClient.java`:

La clase `KeycloakClient` actúa como un cliente que facilita la interacción con el servidor Keycloak;

* Inicialización de la Instancia de **Keycloak:**

  * La clase tiene una instancia estática de Keycloak **(keycloakInstance)** que se inicializa utilizando el **KeycloakBuilder**.
Esta instancia se configura con detalles como la **URL del servidor Keycloak (KEYCLOAK_URL)**, **el reino (REALM_MASTER)**, el **ID del cliente (ADMIN_CLI)**, el **nombre de usuario (USER_CONSOLE)**, la **contraseña (USER_PASSWORD)**, el **secreto del cliente (CLIENT_SECRET)**, y detalles adicionales relacionados con el cliente REST (resteasyClient).
Obteniendo Recursos del Reino (RealmResource):

* El método **getRealmResource()** devuelve un recurso del realm que proporciona funcionalidad para administrar ese reino en particular dentro de **Keycloak**.

* Obteniendo Recursos de Usuarios **(UsersResource):** El método `getUsersResource()` devuelve un recurso que proporciona funcionalidades para administrar usuarios dentro de un realm específico.

* Creando una Instancia de **KeycloakBuilder:** `createKeycloakBuilder(String username, String password)` es un método que crea y devuelve una nueva instancia de **KeycloakBuilder** configurada con el username y password proporcionados.

* Obteniendo el **Token de Acceso para un Usuario:** `getAccessTokenForUser(String username, String password)` es un método que crea una nueva instancia de Keycloak utilizando `createKeycloakBuilder`, y luego solicita y devuelve un token de acceso para el usuario proporcionado.


```java
public class KeycloakClient {

  private static final Keycloak keycloakInstance = KeycloakBuilder.builder()
      .serverUrl(KEYCLOAK_URL)
      .realm(REALM_MASTER)
      .clientId(ADMIN_CLI)
      .username(USER_CONSOLE)
      .password(USER_PASSWORD)
      .clientSecret(CLIENT_SECRET)
      .resteasyClient(new ResteasyClientBuilderImpl()
          .connectionPoolSize(10).build())
      .build();

  public static RealmResource getRealmResource() {
    return keycloakInstance.realm(REALM_NAME);
  }

  public static UsersResource getUsersResource() {
    RealmResource realmResource = getRealmResource();
    return realmResource.users();
  }

  public static KeycloakBuilder createKeycloakBuilder(String username, String password) {
    return KeycloakBuilder.builder()
        .realm(REALM_NAME)
        .serverUrl(KEYCLOAK_URL)
        .clientId(CLIENT_ID)
        .clientSecret(CLIENT_SECRET)
        .username(username)
        .password(password);
  }

  public static AccessTokenResponse getAccessTokenForUser(String username, String password) {
    return createKeycloakBuilder(username, password)
        .build()
        .tokenManager()
        .getAccessToken();
  }

}
```

* En este caso, el primer cambio que haremos será el actualizar nuestro constructor y métodos que hacían uso de las constantes debido al cambio que hemos hecho previamente.

```java
@Component
public class KeycloakClient {

   @Value("${keycloak.url}")
  private String keycloakUrl;

  @Value("${keycloak.realm-name}")
  private String realmName;

  @Value("${keycloak.realm-master}")
  private String realmMaster;

  @Value("${keycloak.admin-cli}")
  private String adminCli;

  @Value("${keycloak.user-console}")
  private String userConsole;

  @Value("${keycloak.user-password}")
  private String userPassword;

  @Value("${keycloak.client-secret}")
  private String clientSecret;

  @Value("${keycloak.client-id}")
  private String clientId;

  private Keycloak keycloakInstance;

  @PostConstruct
  public void init() {
    this.keycloakInstance = createKeycloakInstance();
  }

  protected Keycloak createKeycloakInstance() {
    return KeycloakBuilder.builder()
        .serverUrl(keycloakUrl)
        .realm(realmMaster)
        .clientId(adminCli)
        .username(userConsole)
        .password(userPassword)
        .clientSecret(clientSecret)
        .resteasyClient(new ResteasyClientBuilderImpl().connectionPoolSize(10).build())
        .build();
  }

  public RealmResource getRealmResource() {
    return keycloakInstance.realm(realmName);
  }

  public UsersResource getUsersResource() {
    RealmResource realmResource = getRealmResource();
    return realmResource.users();
  }

  public KeycloakBuilder createKeycloakBuilder(String username, String password) {
    return KeycloakBuilder.builder()
        .realm(realmName)
        .serverUrl(keycloakUrl)
        .clientId(clientId)
        .clientSecret(clientSecret)
        .username(username)
        .password(password);
  }

  public AccessTokenResponse getAccessTokenForUser(String username, String password) {
    return createKeycloakBuilder(username, password)
        .build()
        .tokenManager()
        .getAccessToken();
  }

}
```

* En primer lugar hemos **implementado el uso de la anotación** `@Value` para inyectar las propiedades de nuestro archivo de configuración.
* El otro cambio que hemos hecho es **implementar la anotación** `@PostConstruct` que marca el método que debe ser ejecutado después de que se haya realizado la inyección de dependencias. En otras palabras, una vez que **Spring haya inyectado todos los valores (desde application.yml) en nuestros campos, se invocará el método** `init()`. En este método, estamos inicializando nuestra instancia de Keycloak utilizando los valores de configuración inyectados.
* El primer antes de refactorizar es tener una buena bateria de test (cosa que no tenemos) por lo tanto, el paso previo es directamente hacer que el código sea testeable, por lo tanto hemos realizado los siguientes cambios:
  * Hemos extraido la lógica de la instancia de `Keycloak` a un nuevo método protegido: `createKeycloakInstance()`. La razón de este cambio es desacoplar la lógica de creación de la instancia de `Keycloak` del proceso de inicialización del bean. Con esto logramos varias cosas:
    * **Separación de responsabilidades:** El método `init()` ahora solo se encarga de inicializar el bean, mientras que la lógica de creación de la instancia de `Keycloak` se ha movido a un método separado.
    * **Mejora de la Testeabilidad:** Al tener la creación en su propio método, podemos sobrescribir o "mockear" ese método específico en un contexto de prueba. Esto es especialmente útil cuando queremos evitar conexiones reales a servicios externos (como Keycloak) durante las pruebas unitarias.
  * **Hemos eliminado los métodos estáticos** y los hemos convertido en **métodos de instancia.** Al no depender directamente de métodos estáticos para crear instancias y al poder inyectar o sobrescribir esas instancias, la clase se vuelve menos acoplada y más modular.

## KeycloakServiceImpl.java

* Ahora que hemos refactorizado nuestra clase `KeycloakClient`, podemos refactorizar nuestra clase `KeycloakServiceImpl` para que utilice la nueva clase `KeycloakClient` en lugar de la instancia de `Keycloak` directamente.

Daremos un vistazo a como estaba anteriormente la clase:

```java
@Service
@Slf4j
public class KeycloakServiceImpl implements KeycloakService {

  @Override
  public List<UserRepresentation> findAllUsers() {
    log.info("Finding all users");
    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    return KeycloakClient.getRealmResource().users().list();
  }

  @Override
  public List<UserRepresentation> searchByUsername(String username) {
    return KeycloakClient.getRealmResource().users().searchByUsername(username, true);
  }

  @Override
  public String createUser(@NonNull UserRequest userRequest) {
    log.info("Creating user");
    int status = 0;

    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    UsersResource usersResource = KeycloakClient.getUsersResource();
    UserRepresentation userRepresentation = new UserRepresentation();

    log.info("Setting user attributes");
    userRepresentation.setFirstName(userRequest.firstName());
    userRepresentation.setLastName(userRequest.lastName());
    userRepresentation.setEmail(userRequest.email());
    userRepresentation.setUsername(userRequest.username());
    userRepresentation.setEnabled(true);
    userRepresentation.setEmailVerified(true);

    Response response = usersResource.create(userRepresentation);
    status = response.getStatus();

    if (status == 201) {
      log.info("User created");
      String path = response.getLocation().getPath();
      String userId = path.substring(path.lastIndexOf('/') + 1);
      log.info("User id: {}", userId);

      log.info("Setting user password");
      CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
      credentialRepresentation.setTemporary(false);
      credentialRepresentation.setType(OAuth2Constants.PASSWORD);
      credentialRepresentation.setValue(userRequest.password());

      log.info("Resetting user password");
      usersResource.get(userId).resetPassword(credentialRepresentation);

      log.info("Assigning user roles");
      RealmResource realmResource = KeycloakClient.getRealmResource();
      List<RoleRepresentation> roles = null;
      
      if(userRequest.roles() == null || userRequest.roles().isEmpty()){
        roles = List.of(realmResource.roles().get("user").toRepresentation());
      } else {
        roles = realmResource
            .roles()
            .list()
            .stream()
            .filter(role -> userRequest.roles()
                .stream()
                .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
            .toList();
      }
      realmResource
          .users()
          .get(userId)
          .roles()
          .realmLevel()
          .add(roles);

      return "User created";
    } else if (status == 409) {
      log.error("User already exists");
      return "User already exists";
    } else {
      log.error("Error creating user");
      return "Error creating user";
    }

  }

  @Override
  public void deleteUser(String userId) {
    log.info("Deleting user");
    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    KeycloakClient.getUsersResource().get(userId).remove();
  }

  @Override
  public void updateUser(String userId, UserRequest userRepresentation) {
    log.info("Updating user");
    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
    credentialRepresentation.setTemporary(false);
    credentialRepresentation.setType(OAuth2Constants.PASSWORD);
    credentialRepresentation.setValue(userRepresentation.password());

    UserRepresentation user = new UserRepresentation();
    user.setFirstName(userRepresentation.firstName());
    user.setLastName(userRepresentation.lastName());
    user.setEmail(userRepresentation.email());
    user.setUsername(userRepresentation.username());
    user.setEnabled(true);
    user.setEmailVerified(true);
    user.setCredentials(Collections.singletonList(credentialRepresentation));

    UserResource userResource = KeycloakClient.getUsersResource().get(userId);
    userResource.update(user);
  }
}
```

Sin duda a simple vista se puede ver que hay mucho código repetido, métodos muy largos, números mágicos, **code smells**, etc. Vamos explicar un poco que sucede:

* **Métodos largos:** Los métodos largos son un problema porque son difíciles de leer y de entender. Además, suelen ser un indicador de que la clase está haciendo demasiadas cosas. En este caso, los métodos `createUser()` y `updateUser()` son muy largos y hacen demasiadas cosas. Por ejemplo, el método `createUser()` hace lo siguiente:
  * Crea un usuario
  * Le asigna una contraseña
  * Le asigna roles
* **Duplicación de código:** La lógica para registrar el "realm" se repite en varios métodos (`findAllUsers`, `createUser`, `deleteUser`, `updateUser`).
* **Falta de abstracción:** La lógica para crear una representación de usuario y credenciales se repite en `createUser` y `updateUser`. Esto podría abstraerse en métodos separados o incluso en una clase auxiliar.
* **Hace uso de una interfaz que realmente no aporta nada:** Realmente, para este proyecto solo habrá una única implementación que será la de **Keycloak**, es un proyecto muy pequeño, y tampoco cambiaremos de proveedor de autenticación.

Ahora, que hemos evaluado algunos de los problemas, vamos a refactorizar la clase:

* Primero vamos a eliminar la implementación de la interfaz y cambiar el nombre de la clase `KeycloakService`
* Vamos a definir constantes para los códigos de estado HTTP
* Vamos a definir el `KeycloakClient` como un atributo de la clase

```java 
public class KeycloakService {
  private final static int STATUS_CREATED = 201;
  private final static int STATUS_CONFLICT = 409;
  private KeycloakClient keycloakClient;
}
```
Ahora iremos método a método refactorizando:

### findAllUsers()

```java
public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  return KeycloakClient.getRealmResource().users().list();
}
```

* Lo único que cambiaremos acá será la línea 2, dado que se repite por todo el código, vamos a definir un método privado:

```java
private void logRealmInfo(){
  log.info("Realm: {}", keycloakClient.getRealmResource().toRepresentation().getRealm());
}
```

* Lo que haría que nuestra método quede de la siguiente manera:

```java
public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  logRealmInfo();
  return keycloakClient.getRealmResource().users().list();
}
```

### createUser(@NonNull UserRequest userRequest)

```java
public String createUser(@NonNull UserRequest userRequest) {
  log.info("Creating user");
  int status = 0;

  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  UsersResource usersResource = KeycloakClient.getUsersResource();
  UserRepresentation userRepresentation = new UserRepresentation();

  log.info("Setting user attributes");
  userRepresentation.setFirstName(userRequest.firstName());
  userRepresentation.setLastName(userRequest.lastName());
  userRepresentation.setEmail(userRequest.email());
  userRepresentation.setUsername(userRequest.username());
  userRepresentation.setEnabled(true);
  userRepresentation.setEmailVerified(true);

  Response response = usersResource.create(userRepresentation);
  status = response.getStatus();

  if (status == 201) {
    log.info("User created");
    String path = response.getLocation().getPath();
    String userId = path.substring(path.lastIndexOf('/') + 1);
    log.info("User id: {}", userId);

    log.info("Setting user password");
    CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
    credentialRepresentation.setTemporary(false);
    credentialRepresentation.setType(OAuth2Constants.PASSWORD);
    credentialRepresentation.setValue(userRequest.password());

    log.info("Resetting user password");
    usersResource.get(userId).resetPassword(credentialRepresentation);

    log.info("Assigning user roles");
    RealmResource realmResource = KeycloakClient.getRealmResource();
    List<RoleRepresentation> roles = null;
    
    if(userRequest.roles() == null || userRequest.roles().isEmpty()){
      roles = List.of(realmResource.roles().get("user").toRepresentation());
    } else {
      roles = realmResource
          .roles()
          .list()
          .stream()
          .filter(role -> userRequest.roles()
              .stream()
              .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
          .toList();
    }
    realmResource
        .users()
        .get(userId)
        .roles()
        .realmLevel()
        .add(roles);

    return "User created";
  } else if (status == 409) {
    log.error("User already exists");
    return "User already exists";
  } else {
    log.error("Error creating user");
    return "Error creating user";
  }

}
```

Como podemos ver, este método es muy largo y hace muchas cosas, vamos a analizar un poco que hemos hecho para que este código sea más legible:

```java
public String createUser(@NonNull UserRequest userRequest) {
  log.info("Creating user");
  logRealmInfo();
  Response response = createUserInKeycloak(userRequest);

  if (response.getStatus() == STATUS_CREATED) {
    handleUserCreated(response, userRequest);
    return "User created";
  } else if (response.getStatus() == STATUS_CONFLICT) {
    log.error("User already exists");
    return "User already exists";
  } else {
    log.error("Error creating user");
    return "Error creating user";
  }

}
```
1. **Extracción de la lógica de creación de usuarios:**
   * **Antes:** La lógica para crear un usuario en Keycloak estaba incrustada en el método.
   * **Después:** Se ha definido el método privado createUserInKeycloak(UserRequest userRequest) para manejar esta lógica.
```java
private Response createUserInKeycloak(UserRequest userRequest){
  UsersResource userResource = keycloakClient.getUsersResource();
  UserRepresentation userRepresentation = createUserRepresentationFromRequest(userRequest);
  return userResource.create(userRepresentation);
}
```
2. **Extración de la lógica de mapeo de usuario:**
   * **Antes:** La lógica para mapear un usuario de la petición a un objeto UserRepresentation estaba totalmente incrustada en el método.
   * **Después:** Se ha definido el método privado createUserRepresentationFromRequest(UserRequest userRequest) para manejar esta lógica.
```java
private UserRepresentation createUserRepresentationFromRequest(UserRequest userRequest){
  UserRepresentation userRepresentation = new UserRepresentation();
  userRepresentation.setFirstName(userRequest.firstName());
  userRepresentation.setLastName(userRequest.lastName());
  userRepresentation.setEmail(userRequest.email());
  userRepresentation.setUsername(userRequest.username());
  userRepresentation.setEnabled(true);
  userRepresentation.setEmailVerified(true);
  userRepresentation.setCredentials(Collections.singletonList(createCredentialRepresentation(userRequest)));
  return userRepresentation;
}
```
3. **Extracción de la lógica de creación de credenciales:**
   * **Antes:** La lógica para crear las credenciales de un usuario estaba incrustada en el método.
   * **Después:** Se creó el método privado `createCredentialRepresentation(UserRequest userRequest)` para manejar esta lógica.
```java
private CredentialRepresentation createCredentialRepresentation(UserRequest userRequest) {
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRequest.password());
  return credentialRepresentation;
}
```
4. **Extracción de la lógica post-creación:**
   * **Antes:** Después de crear un usuario, había una lógica adicional para establecer la contraseña y asignar roles.
   * **Después:** Se creó el método privado `handleUserCreated(Response response, UserRequest userRequest)` para manejar esta lógica.
```java
private void handleUserCreated(Response response, UserRequest userRequest) {
  String userId = extractUserIdFromResponse(response);
  log.info("User id: {}", userId);

  setUserPassword(userId, userRequest);
  assignUserRoles(userId, userRequest);
}
```
5. **Extracción de la lógica para extraer el ID del usuario:
   * **Antes:** Se manejaba la lógica para extraer el ID del usuario también en el mismo método.
   * **Después:** Se creó el método privado `extractUserIdFromResponse(Response response)` para manejar esta lógica.
```java
private String extractUserIdFromResponse(Response response) {
  String path = response.getLocation().getPath();
  return path.substring(path.lastIndexOf('/') + 1);
}
```
6. **Extracción de la lógica para establecer la contraseña del usuario:**
   * **Antes:** Se manejaba la lógica para establecer la contraseña del usuario también en el mismo método.
   * **Después:** Se creó el método privado `setUserPassword(String userId, UserRequest userRequest)` para manejar esta lógica.
```java
private void setUserPassword(String userId, UserRequest userRequest) {
  UsersResource usersResource = keycloakClient.getUsersResource();
  usersResource.get(userId).resetPassword(createCredentialRepresentation(userRequest));
}
```
7. **Extracción de la lógica para asignar roles al usuario:**
   * **Antes:** Se manejaba la lógica para asignar roles al usuario también en el mismo método.
   * **Después:** Se creó el método privado `assignUserRoles(String userId, UserRequest userRequest)` para manejar esta lógica.
```java
private void assignUserRoles(String userId, UserRequest userRequest) {
  RealmResource realmResource = keycloakClient.getRealmResource();
  List<RoleRepresentation> roles = determineRolesToAssign(userRequest, realmResource);
  realmResource.users().get(userId).roles().realmLevel().add(roles);
}
```
8. **Extracción de la lógica para determinar los roles a asignar al usuario:**
   * **Antes:** Se manejaba la lógica para determinar los roles a asignar al usuario también en el mismo método.
   * **Después:** Se creó el método privado `determineRolesToAssign(UserRequest userRequest, RealmResource realmResource)` para manejar esta lógica.
```java
private List<RoleRepresentation> determineRolesToAssign(UserRequest userRequest, RealmResource realmResource) {
  if (userRequest.roles() == null || userRequest.roles().isEmpty()) {
    return List.of(realmResource.roles().get("user").toRepresentation());
  } else {
    return realmResource.roles().list().stream()
        .filter(role -> userRequest.roles().stream().anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
        .collect(Collectors.toList());
  }
}
```

Finalmente se nos ha quedado un método mucho más legible y fácil de entender.

### updateUser(String userId, UserRequest userRequest)

Vamos a echar un vistazo a como está implementado el método `updateUser(String userId, UserRequest userRequest)`:

```java
public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRepresentation.password());

  UserRepresentation user = new UserRepresentation();
  user.setFirstName(userRepresentation.firstName());
  user.setLastName(userRepresentation.lastName());
  user.setEmail(userRepresentation.email());
  user.setUsername(userRepresentation.username());
  user.setEnabled(true);
  user.setEmailVerified(true);
  user.setCredentials(Collections.singletonList(credentialRepresentation));

  UserResource userResource = KeycloakClient.getUsersResource().get(userId);
  userResource.update(user);
}
```

Vamos a aplicar los mismos pasos que en el método anterior, y analizar como podemos dejar este método un poco más legible:

1.  **Extracción de la Lógica de Mapeo de Usuario:**
    * **Antes:** La lógica para mapear un usuario de la petición a un objeto UserRepresentation estaba en el método.
    * **Después:** Se utilizó el método privado createUserRepresentationFromRequest(UserRequest userRequest) para manejar esta lógica, así reutilizamos la lógica que ya teníamos en el método createUser.
2. **Extracción de la lógica de creación de credenciales:**
   * **Antes:** La lógica para crear una representación de las credenciales estaba incrustada en el método updateUser.
   * **Después:** Se utilizó el método privado createCredentialRepresentation(UserRequest userRequest) para manejar esta lógica, reutilizando código que ya habíamos extraído en el método createUser.

Finalmente nuestro método queda de esta manera, sustancialmente con menos líneas de código y aprovechando el código anterior:

```java
public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  logRealmInfo();
  UserResource userResource = keycloakClient.getUsersResource().get(userId);
  userResource.update(createUserRepresentationFromRequest(userRepresentation));
}
```

Y finalmente se nos queda una clase más legible y más fácil de entender:

```java
@Service
@Slf4j
@AllArgsConstructor
public class KeycloakService {
private final static int STATUS_CREATED = 201;
private final static int STATUS_CONFLICT = 409;
private KeycloakClient keycloakClient;

public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  logRealmInfo();
  return keycloakClient.getRealmResource().users().list();
}

public List<UserRepresentation> searchByUsername(String username) {
  return keycloakClient.getRealmResource().users().searchByUsername(username, true);
}

public String createUser(@NonNull UserRequest userRequest) {
  log.info("Creating user");
  logRealmInfo();
  Response response = createUserInKeycloak(userRequest);

  if (response.getStatus() == STATUS_CREATED) {
    handleUserCreated(response, userRequest);
    return "User created";
  } else if (response.getStatus() == STATUS_CONFLICT) {
    log.error("User already exists");
    return "User already exists";
  } else {
    log.error("Error creating user");
    return "Error creating user";
  }

}

public void deleteUser(String userId) {
  log.info("Deleting user");
  logRealmInfo();
  keycloakClient.getUsersResource().get(userId).remove();
}

public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  logRealmInfo();
  UserResource userResource = keycloakClient.getUsersResource().get(userId);
  userResource.update(createUserRepresentationFromRequest(userRepresentation));
}

private void logRealmInfo(){
  log.info("Realm: {}", keycloakClient.getRealmResource().toRepresentation().getRealm());
}

private Response createUserInKeycloak(UserRequest userRequest){
  UsersResource userResource = keycloakClient.getUsersResource();
  UserRepresentation userRepresentation = createUserRepresentationFromRequest(userRequest);
  return userResource.create(userRepresentation);
}

private UserRepresentation createUserRepresentationFromRequest(UserRequest userRequest){
  UserRepresentation userRepresentation = new UserRepresentation();
  userRepresentation.setFirstName(userRequest.firstName());
  userRepresentation.setLastName(userRequest.lastName());
  userRepresentation.setEmail(userRequest.email());
  userRepresentation.setUsername(userRequest.username());
  userRepresentation.setEnabled(true);
  userRepresentation.setEmailVerified(true);
  userRepresentation.setCredentials(Collections.singletonList(createCredentialRepresentation(userRequest)));
  return userRepresentation;
}

private CredentialRepresentation createCredentialRepresentation(UserRequest userRequest) {
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRequest.password());
  return credentialRepresentation;
}

private void handleUserCreated(Response response, UserRequest userRequest) {
  String userId = extractUserIdFromResponse(response);
  log.info("User id: {}", userId);

  setUserPassword(userId, userRequest);
  assignUserRoles(userId, userRequest);
}

private String extractUserIdFromResponse(Response response) {
  String path = response.getLocation().getPath();
  return path.substring(path.lastIndexOf('/') + 1);
}

private void setUserPassword(String userId, UserRequest userRequest) {
  UsersResource usersResource = keycloakClient.getUsersResource();
  usersResource.get(userId).resetPassword(createCredentialRepresentation(userRequest));
}

private void assignUserRoles(String userId, UserRequest userRequest) {
  RealmResource realmResource = keycloakClient.getRealmResource();
  List<RoleRepresentation> roles = determineRolesToAssign(userRequest, realmResource);
  realmResource.users().get(userId).roles().realmLevel().add(roles);
}

private List<RoleRepresentation> determineRolesToAssign(UserRequest userRequest, RealmResource realmResource) {
  if (userRequest.roles() == null || userRequest.roles().isEmpty()) {
    return List.of(realmResource.roles().get("user").toRepresentation());
  } else {
    return realmResource.roles().list().stream()
        .filter(role -> userRequest.roles().stream().anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
        .collect(Collectors.toList());
  }
}
```

## KeycloakController.java

En nuestro controlador, no hay mucho por hacer, pero podemos corregir unos pequeños errores de código:

```java
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class KeycloakController {
private KeycloakService keycloakService;

@GetMapping("/all")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> findAllUsers() {
  return ResponseEntity.ok(keycloakService.findAllUsers());
}

@GetMapping("/user/{username}")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> searchByUsername(@PathVariable String username) {
  return ResponseEntity.ok(keycloakService.searchByUsername(username));
}

@PostMapping("/user/create")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest) throws URISyntaxException {
  String response = keycloakService.createUser(userRequest);
  return ResponseEntity.created(new URI("/api/users/user/create")).body(response);
}

@PutMapping("/user/update/{userId}")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserRequest userRequest) {
  keycloakService.updateUser(userId, userRequest);
  return ResponseEntity.ok("User updated successfully");
}
```

Hay una serie de cosas que podemos mejorar:

1. **Consistencia en las Rutas de la API:**
   * **Antes:** Las rutas como /user/{username}, /user/create, /user/update/{userId}.
   * **Después:** Se elimina el segmento /user y usar rutas como /{username}, /create, /update/{userId}. Dado que ya está en el controlador (/api/users), es redundante.
2. **Respuestas de la API:**
   * **Antes:** Se está devolviendo ResponseEntity<?>.
   * **Después:** Especifica el tipo de respuesta en lugar de usar un comodín. Por ejemplo, ResponseEntity<List<UserRepresentation>> para findAllUsers().

Y finalmente queda de la siguiente manera:

```java
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class KeycloakController {
  private KeycloakService keycloakService;

  @GetMapping("/all")
  @PreAuthorize("hasRole('admin_client_role')")
  public ResponseEntity<List<UserRepresentation>> findAll() {
    return ResponseEntity.ok(keycloakService.findAllUsers());
  }

  @GetMapping("/{username}")
  @PreAuthorize("hasRole('admin_client_role') or hasRole('user_client_role')")
  public ResponseEntity<UserRepresentation> searchByUsername(@PathVariable String username) {
    return ResponseEntity.ok(keycloakService.searchByUsername(username).get(0));
  }

  @PostMapping("/create")
  @PreAuthorize("hasRole('admin_client_role')")
  public ResponseEntity<ApiResponse> createUser(@RequestBody UserRequest userRequest) throws URISyntaxException {
    String userId = keycloakService.createUser(userRequest);
    URI location = new URI("/api/users/" + userId);
    return ResponseEntity.created(location).body(new ApiResponse("User created successfully", HttpStatus.CREATED.value()));
  }

  @PutMapping("/update/{userId}")
  @PreAuthorize("hasRole('admin_client_role')")
  public ResponseEntity<ApiResponse> updateUser(@PathVariable String userId, @RequestBody UserRequest userRequest) {
    keycloakService.updateUser(userId, userRequest);
    return ResponseEntity.ok(new ApiResponse("User updated successfully", HttpStatus.OK.value()));
  }
}
```

## SecurityConfiguration.java

En esta clase haremos unos cambios menores:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

  private final JwtAuthenticationConverter jwtAuthenticationConverter;

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(authorize -> {
          authorize
              .requestMatchers("/api/auth/login").permitAll()
              .anyRequest().authenticated();
        })
        .oauth2ResourceServer(oauth2 -> {
          oauth2.jwt(jwtConfigurer -> {
            jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter);
          });
        })
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .build();
  }
}
```

Lo único que haremos será remover unas llaves que no son necesarias.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

  private final JwtAuthenticationConverter jwtAuthenticationConverter;

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(authorize ->
          authorize
              .requestMatchers("/api/auth/login").permitAll()
              .anyRequest().authenticated())
        .oauth2ResourceServer(oauth2 ->
          oauth2.jwt(jwtConfigurer ->
            jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter)))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .build();
  }
}
```

Después de estos cambios, podremos pasar la aplicación por nuestro Scanner de SonarQube y ver que ya no tenemos errores, y que la calidad de nuestro código ha mejorado sustancialmente.

![SonarQube analysis](/assets/keycloak/sonar.png)

Sin duda, hay muchas cosas que se pueden mejorar en esta implementación, tampoco soy un experto refactorizando código, ni tampoco es cuestión de hacer sobre ingeniería en este proyecto, pero si duda es una buena mejoría y un buen punto de partida para seguir mejorando.