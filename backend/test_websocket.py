import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server")
            
            # Send a test message
            test_data = b"test audio data"
            await websocket.send(test_data)
            
            # Receive the response
            response = await websocket.recv()
            print(f"Received response: {response}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

# Run the test
asyncio.get_event_loop().run_until_complete(test_websocket())