from conftest import client
import pytest
from unittest.mock import patch, AsyncMock

class TestPedidoEndpoints:
    """Tests para los endpoints del servicio de pedidos"""

    def test_health_check(self, client):
        """CP-015: Verificar que /health responde con 200"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "Pedido service is running"

    @patch('main.verificar_usuario_existe')
    def test_crear_pedido_exitoso(self, mock_verificar, client):
        """CP-018: Crear pedido con datos válidos debe retornar 201"""
        mock_verificar.return_value = True

        pedido_data = {
            "usuarioId": 1,
            "productos": [
                {"nombre": "Producto 1", "cantidad": 2, "precio": 10.0},
                {"nombre": "Producto 2", "cantidad": 1, "precio": 20.0}
            ],
            "direccion": "Calle Principal 123"
        }
        response = client.post("/api/pedidos", json=pedido_data)
        assert response.status_code == 201
        assert response.json()["usuarioId"] == 1
        assert response.json()["total"] == 40.0  # (2*10) + (1*20)

    @patch('main.verificar_usuario_existe')
    def test_crear_pedido_usuario_no_existe(self, mock_verificar, client):
        """CP-019: Usuario inexistente retorna 404"""
        mock_verificar.return_value = False

        pedido_data = {
            "usuarioId": 9999,
            "productos": [
                {"nombre": "Producto 1", "cantidad": 2, "precio": 10.0}
            ],
            "direccion": "Calle Principal 123"
        }
        response = client.post("/api/pedidos", json=pedido_data)
        assert response.status_code == 404
        assert "Usuario no encontrado" in response.json()["detail"]

    @patch('main.verificar_usuario_existe')
    def test_crear_pedido_datos_inválidos(self, mock_verificar, client):
        """CP-020: Datos inválidos retornan 400 o 422"""
        pedido_data = {
            "usuarioId": 1,
            "productos": [
                {"nombre": "Producto 1", "cantidad": -1, "precio": 10.0}  # Cantidad inválida
            ]
        }
        response = client.post("/api/pedidos", json=pedido_data)
        assert response.status_code == 422

    @patch('main.verificar_usuario_existe')
    def test_obtener_todos_pedidos(self, mock_verificar, client):
        """Obtener lista de pedidos"""
        mock_verificar.return_value = True

        # Crear un par de pedidos
        for i in range(2):
            pedido_data = {
                "usuarioId": 1,
                "productos": [{"nombre": f"Producto {i}", "cantidad": 1, "precio": 10.0}],
                "direccion": f"Calle {i}"
            }
            client.post("/api/pedidos", json=pedido_data)

        response = client.get("/api/pedidos")
        assert response.status_code == 200
        assert len(response.json()) == 2

    @patch('main.verificar_usuario_existe')
    def test_obtener_pedido_por_id(self, mock_verificar, client):
        """CP-018: Obtener pedido específico por ID"""
        mock_verificar.return_value = True

        pedido_data = {
            "usuarioId": 1,
            "productos": [{"nombre": "Producto 1", "cantidad": 2, "precio": 10.0}],
            "direccion": "Calle Principal 123"
        }
        create_response = client.post("/api/pedidos", json=pedido_data)
        pedido_id = create_response.json()["id"]

        response = client.get(f"/api/pedidos/{pedido_id}")
        assert response.status_code == 200
        assert response.json()["id"] == pedido_id
        assert response.json()["usuarioId"] == 1

    def test_obtener_pedido_no_existe(self, client):
        """CP-020: Pedido no encontrado retorna 404"""
        response = client.get("/api/pedidos/9999")
        assert response.status_code == 404
        assert "Pedido no encontrado" in response.json()["detail"]

    @patch('main.verificar_usuario_existe')
    def test_obtener_pedidos_por_usuario(self, mock_verificar, client):
        """Obtener pedidos de un usuario específico"""
        mock_verificar.return_value = True

        # Crear pedidos para usuario 1
        for i in range(2):
            pedido_data = {
                "usuarioId": 1,
                "productos": [{"nombre": f"Producto {i}", "cantidad": 1, "precio": 10.0}],
                "direccion": f"Calle {i}"
            }
            client.post("/api/pedidos", json=pedido_data)

        response = client.get("/api/pedidos/usuario/1")
        assert response.status_code == 200
        assert len(response.json()) == 2
        assert all(p["usuarioId"] == 1 for p in response.json())

    @patch('main.verificar_usuario_existe')
    def test_obtener_pedidos_usuario_no_existe(self, mock_verificar, client):
        """Usuario inexistente en consulta de pedidos retorna 404"""
        mock_verificar.return_value = False

        response = client.get("/api/pedidos/usuario/9999")
        assert response.status_code == 404

    @patch('main.verificar_usuario_existe')
    def test_actualizar_estado_pedido(self, mock_verificar, client):
        """CP-021: Actualizar estado de pedido existente"""
        mock_verificar.return_value = True

        # Crear pedido
        pedido_data = {
            "usuarioId": 1,
            "productos": [{"nombre": "Producto 1", "cantidad": 1, "precio": 10.0}],
            "direccion": "Calle Principal 123"
        }
        create_response = client.post("/api/pedidos", json=pedido_data)
        pedido_id = create_response.json()["id"]

        # Actualizar estado
        update_data = {"estado": "enviado"}
        response = client.put(f"/api/pedidos/{pedido_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["estado"] == "enviado"

    def test_actualizar_pedido_no_existe(self, client):
        """CP-021: Actualizar pedido inexistente retorna 404"""
        update_data = {"estado": "procesando"}
        response = client.put("/api/pedidos/9999", json=update_data)
        assert response.status_code == 404

    def test_actualizar_estado_inválido(self, client):
        """CP-021: Estado inválido retorna 400"""
        # Crear un pedido primero
        with patch('main.verificar_usuario_existe', return_value=True):
            pedido_data = {
                "usuarioId": 1,
                "productos": [{"nombre": "Producto 1", "cantidad": 1, "precio": 10.0}],
                "direccion": "Calle Principal 123"
            }
            create_response = client.post("/api/pedidos", json=pedido_data)
            pedido_id = create_response.json()["id"]

        # Intentar actualizar con estado inválido
        update_data = {"estado": "estado_invalido"}
        response = client.put(f"/api/pedidos/{pedido_id}", json=update_data)
        assert response.status_code == 400

    @patch('main.verificar_usuario_existe')
    def test_eliminar_pedido(self, mock_verificar, client):
        """CP-022: Eliminar pedido debe retornar confirmación"""
        mock_verificar.return_value = True

        # Crear pedido
        pedido_data = {
            "usuarioId": 1,
            "productos": [{"nombre": "Producto 1", "cantidad": 1, "precio": 10.0}],
            "direccion": "Calle Principal 123"
        }
        create_response = client.post("/api/pedidos", json=pedido_data)
        pedido_id = create_response.json()["id"]

        # Eliminar pedido
        response = client.delete(f"/api/pedidos/{pedido_id}")
        assert response.status_code == 200
        assert "Pedido eliminado correctamente" in response.json()["mensaje"]

        # Verificar que se eliminó
        get_response = client.get(f"/api/pedidos/{pedido_id}")
        assert get_response.status_code == 404

    def test_eliminar_pedido_no_existe(self, client):
        """CP-022: Eliminar pedido inexistente retorna 404"""
        response = client.delete("/api/pedidos/9999")
        assert response.status_code == 404
