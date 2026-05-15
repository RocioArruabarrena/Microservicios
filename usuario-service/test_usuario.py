from conftest import client
import pytest

class TestUsuarioEndpoints:
    """Tests para los endpoints del servicio de usuarios"""

    def test_health_check(self, client):
        """CP-004: Verificar que /health responde con 200"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "Usuario service is running"

    def test_crear_usuario_exitoso(self, client):
        """CP-007: Crear usuario con datos válidos debe retornar 201"""
        usuario_data = {
            "nombre": "Juan García",
            "email": "juan@example.com",
            "contraseña": "password123",
            "telefono": "+34 123 456 789"
        }
        response = client.post("/api/usuarios", json=usuario_data)
        assert response.status_code == 201
        assert response.json()["email"] == usuario_data["email"]
        assert response.json()["nombre"] == usuario_data["nombre"]

    def test_crear_usuario_email_duplicado(self, client):
        """CP-008: Email duplicado debe retornar 400"""
        usuario_data = {
            "nombre": "Juan García",
            "email": "juan@example.com",
            "contraseña": "password123",
            "telefono": "+34 123 456 789"
        }
        # Crear primer usuario
        response1 = client.post("/api/usuarios", json=usuario_data)
        assert response1.status_code == 201

        # Intentar crear con el mismo email
        response2 = client.post("/api/usuarios", json=usuario_data)
        assert response2.status_code == 400
        assert "email ya está registrado" in response2.json()["detail"]

    def test_crear_usuario_campos_incompletos(self, client):
        """CP-009: Campos vacíos deben ser rechazados"""
        usuario_data = {
            "nombre": "Juan García",
            "email": "juan@example.com",
            # Falta contraseña
        }
        response = client.post("/api/usuarios", json=usuario_data)
        assert response.status_code == 422  # Unprocessable Entity (validación Pydantic)

    def test_obtener_todos_usuarios(self, client):
        """Obtener lista de usuarios"""
        # Crear un par de usuarios
        for i in range(2):
            usuario_data = {
                "nombre": f"Usuario {i}",
                "email": f"usuario{i}@example.com",
                "contraseña": "password123",
            }
            client.post("/api/usuarios", json=usuario_data)

        response = client.get("/api/usuarios")
        assert response.status_code == 200
        assert len(response.json()) == 2

    def test_obtener_usuario_por_id(self, client):
        """CP-007: Obtener usuario específico por ID"""
        usuario_data = {
            "nombre": "Juan García",
            "email": "juan@example.com",
            "contraseña": "password123",
            "telefono": "+34 123 456 789"
        }
        create_response = client.post("/api/usuarios", json=usuario_data)
        usuario_id = create_response.json()["id"]

        response = client.get(f"/api/usuarios/{usuario_id}")
        assert response.status_code == 200
        assert response.json()["id"] == usuario_id
        assert response.json()["email"] == usuario_data["email"]

    def test_obtener_usuario_no_existe(self, client):
        """CP-009: Usuario no encontrado retorna 404"""
        response = client.get("/api/usuarios/9999")
        assert response.status_code == 404
        assert "Usuario no encontrado" in response.json()["detail"]

    def test_actualizar_usuario(self, client):
        """CP-010: Actualizar datos de usuario existente"""
        # Crear usuario
        usuario_data = {
            "nombre": "Juan García",
            "email": "juan@example.com",
            "contraseña": "password123",
            "telefono": "+34 123 456 789"
        }
        create_response = client.post("/api/usuarios", json=usuario_data)
        usuario_id = create_response.json()["id"]

        # Actualizar usuario
        update_data = {
            "nombre": "Juan García Pérez",
            "telefono": "+34 987 654 321"
        }
        response = client.put(f"/api/usuarios/{usuario_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["nombre"] == update_data["nombre"]
        assert response.json()["telefono"] == update_data["telefono"]

    def test_actualizar_usuario_no_existe(self, client):
        """CP-010: Actualizar usuario inexistente retorna 404"""
        update_data = {"nombre": "Nuevo nombre"}
        response = client.put("/api/usuarios/9999", json=update_data)
        assert response.status_code == 404

    def test_eliminar_usuario(self, client):
        """CP-011: Eliminar usuario debe retornar confirmación"""
        # Crear usuario
        usuario_data = {
            "nombre": "Juan García",
            "email": "juan@example.com",
            "contraseña": "password123",
            "telefono": "+34 123 456 789"
        }
        create_response = client.post("/api/usuarios", json=usuario_data)
        usuario_id = create_response.json()["id"]

        # Eliminar usuario
        response = client.delete(f"/api/usuarios/{usuario_id}")
        assert response.status_code == 200
        assert "Usuario eliminado correctamente" in response.json()["mensaje"]

        # Verificar que se eliminó
        get_response = client.get(f"/api/usuarios/{usuario_id}")
        assert get_response.status_code == 404

    def test_eliminar_usuario_no_existe(self, client):
        """CP-012: Eliminar usuario inexistente retorna 404"""
        response = client.delete("/api/usuarios/9999")
        assert response.status_code == 404
