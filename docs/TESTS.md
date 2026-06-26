Lo que cubren los tests auth (23 casos):

POST /create-user → creación exitosa, email duplicado, validaciones de campos (email inválido, password corta, rol inválido, campos faltantes)
POST /login → login con admin seed, usuario creado, password incorrecta, email inexistente, campos faltantes
POST /validate-token → token válido devuelve payload, token basura → 401, sin token → 400
GET /me → usuario autenticado, sin header, token mal formado, sin "Bearer"
GET /health → responde OK
404 → rutas inexistentes