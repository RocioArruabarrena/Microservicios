Preguntas:

¿Qué diferencia hay entre decodificar y verificar un JWT?
Decodificar (decode) simplemente lee el contenido del payload, porque el payload de un JWT está en Base64 — no está encriptado, cualquiera puede abrirlo aunque no tenga la clave secreta. No confirma nada sobre si el token es legítimo. Verificar (verify), en cambio, además de leer el contenido, recalcula la firma usando la clave secreta y la compara con la firma que trae el token, y chequea que no haya expirado. Solo verify te garantiza que el token es auténtico y confiable.

¿Por qué no conviene guardar la contraseña dentro del token?
Porque el payload de un JWT no está encriptado, solo codificado en Base64. Cualquiera que intercepte el token (por ejemplo mirando el header de una request, o si queda logueado en algún lado) puede decodificarlo y leer su contenido tal cual. Si ahí guardás la contraseña, la estás exponiendo en texto plano prácticamente. Por eso solo se guardan datos no sensibles que sirvan para identificar al usuario (id, email, rol).

¿Qué pasa si alguien modifica una parte del token?
Al cambiar aunque sea un solo caracter del payload, la firma que viene en la tercera parte del token deja de coincidir con el contenido. Cuando el servidor hace verify, recalcula la firma esperada a partir del payload actual + la clave secreta, y como no matchea con la firma original, el token se rechaza automáticamente (JsonWebTokenError: invalid signature).

¿Para qué sirve la clave secreta?
Es la que se usa para generar la firma del token al crearlo, y para volver a calcularla al verificarlo. Es lo que le da autenticidad al token: solo el servidor que conoce esa clave puede emitir tokens válidos, y solo él puede confirmar que un token no fue alterado. Si la clave se filtra, cualquiera podría firmar tokens falsos haciéndose pasar por cualquier usuario — por eso tiene que vivir en una variable de entorno, nunca hardcodeada en el repo.

¿Qué significa que un token esté expirado?
Significa que pasó el tiempo límite que se definió al generarlo (en este caso 1h, guardado en el campo exp del payload como timestamp). Aunque la firma siga siendo perfectamente válida, jwt.verify chequea la fecha actual contra exp y si ya pasó, rechaza el token con un error de expiración. Es una medida de seguridad: aunque alguien robe un token, solo sirve por tiempo limitado.